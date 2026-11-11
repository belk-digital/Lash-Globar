import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { SITE_URL } from '@/lib/site';
import { STRIPE_NOT_CONFIGURED_MESSAGE, describeStripeError, getStripe } from '@/lib/stripe';
import {
  WOO_NOT_CONFIGURED_MESSAGE,
  WOO_SIGNATURE_HEADER,
  WOO_TIMESTAMP_HEADER,
  getWooConfig,
  parseOrderId,
  verifySignedRequest,
} from '@/lib/woo-bridge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Stripe's USD limits, in cents ($0.50 to $999,999.99). */
const MIN_AMOUNT = 50;
const MAX_AMOUNT = 99_999_999;
const MAX_BODY_BYTES = 4096;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers: { 'cache-control': 'no-store' } });

/**
 * POST /api/woo/checkout - called by the WooCommerce plugin (server to server), never by browsers.
 *
 * Headers: X-LGPB-Timestamp (unix seconds) and X-LGPB-Signature
 *          = hex HMAC-SHA256(WOO_BRIDGE_SECRET, `${timestamp}.${rawBody}`).
 * Body:    { order_id, amount (cents, integer), currency: "usd", email? }
 *
 * Creates a hosted Stripe payment page with ONE line item ("Order #<id>", quantity 1) for the
 * order total, and returns `{ url }` for the plugin to redirect the customer to. The only
 * metadata stored is the WooCommerce order number. Nothing else about the order is sent.
 */
export async function POST(request: Request) {
  const config = getWooConfig();
  if (!config) return fail(WOO_NOT_CONFIGURED_MESSAGE, 503);
  const stripe = getStripe();
  if (!stripe) return fail(STRIPE_NOT_CONFIGURED_MESSAGE, 503);

  // The signature covers the exact bytes received, so read the raw text first.
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) return fail('Request too large.', 413);

  const authentic = verifySignedRequest(
    config.secret,
    request.headers.get(WOO_TIMESTAMP_HEADER),
    request.headers.get(WOO_SIGNATURE_HEADER),
    rawBody,
  );
  if (!authentic) return fail('Invalid signature.', 401);

  let body: { order_id?: unknown; amount?: unknown; currency?: unknown; email?: unknown };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return fail('Invalid JSON.', 400);
  }

  const orderId = parseOrderId(body?.order_id);
  if (!orderId) return fail('Invalid order_id.', 400);

  const amount = body.amount;
  if (
    typeof amount !== 'number' ||
    !Number.isInteger(amount) ||
    amount < MIN_AMOUNT ||
    amount > MAX_AMOUNT
  ) {
    return fail('Invalid amount. Send whole cents between 50 and 99999999.', 400);
  }

  if (typeof body.currency !== 'string' || body.currency.toLowerCase() !== 'usd') {
    return fail('Only USD orders are supported.', 400);
  }

  let email: string | undefined;
  if (body.email !== undefined && body.email !== null && body.email !== '') {
    if (typeof body.email !== 'string' || body.email.length > 254 || !EMAIL.test(body.email)) {
      return fail('Invalid email.', 400);
    }
    email = body.email;
  }

  // The page lives for about an hour. The expiry is rounded to 10-minute buckets so that a
  // double-clicked "Pay" produces identical parameters and Stripe's idempotency returns the
  // same session instead of creating a second one.
  const bucket = Math.floor(Date.now() / 600_000);
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: { name: `Order #${orderId}` },
        },
      },
    ],
    customer_email: email,
    metadata: { woo_order_id: orderId },
    payment_intent_data: { metadata: { woo_order_id: orderId } },
    expires_at: (bucket + 1) * 600 + 3600,
    success_url: `${SITE_URL}/woo/return?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/woo/return?status=cancelled`,
  };
  const idempotencyKey = `woo-${createHash('sha256').update(JSON.stringify(params)).digest('hex')}`;

  try {
    const session = await stripe.checkout.sessions.create(params, { idempotencyKey });
    if (!session.url) return fail('Stripe did not return a payment link.', 502);
    return NextResponse.json({ url: session.url }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    console.error(`[woo-bridge] Could not create a payment page for order ${orderId}:`, error);
    return fail(describeStripeError(error), 502);
  }
}
