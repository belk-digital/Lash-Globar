import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { STRIPE_NOT_CONFIGURED_MESSAGE, describeStripeError, getStripe } from '@/lib/stripe';
import {
  WOO_NOT_CONFIGURED_MESSAGE,
  WOO_SIGNATURE_HEADER,
  WOO_TIMESTAMP_HEADER,
  createPayToken,
  getWooConfig,
  parseOrderId,
  requestOrigin,
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
 * Creates a Stripe payment for the order total and returns `{ url, payment_intent }`. The URL is a
 * payment page ON THIS SITE (`/pay/<token>`) that shows only "Order #<id>" and the total, with Stripe's
 * card form embedded. The only metadata stored on the payment is the WooCommerce order number.
 * Nothing else about the order (products, SKUs, addresses) is ever sent.
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

  const origin = requestOrigin(request);
  if (!origin) return fail('Could not tell which address this site was reached on.', 400);

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

  // Identical requests (a double-clicked "Pay", a customer retrying) get the SAME payment back from
  // Stripe's idempotency, so one order never ends up with several open payments. If the total or
  // email changes, the parameters differ and a new payment is made.
  const params: Stripe.PaymentIntentCreateParams = {
    amount,
    currency: 'usd',
    allowed_payment_method_types: ['card'],
    receipt_email: email,
    metadata: { woo_order_id: orderId },
  };
  const idempotencyKey = `woo-pi-${createHash('sha256').update(JSON.stringify(params)).digest('hex')}`;

  try {
    const intent = await stripe.paymentIntents.create(params, { idempotencyKey });
    return NextResponse.json(
      {
        url: `${origin}/pay/${createPayToken(config.secret, intent.id)}`,
        payment_intent: intent.id,
      },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    console.error(`[woo-bridge] Could not create a payment for order ${orderId}:`, error);
    return fail(describeStripeError(error), 502);
  }
}
