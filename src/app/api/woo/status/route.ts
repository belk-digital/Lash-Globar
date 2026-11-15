import { NextResponse } from 'next/server';
import { STRIPE_NOT_CONFIGURED_MESSAGE, describeStripeError, getStripe } from '@/lib/stripe';
import {
  PAYMENT_INTENT_ID,
  WOO_NOT_CONFIGURED_MESSAGE,
  WOO_SIGNATURE_HEADER,
  WOO_TIMESTAMP_HEADER,
  getWooConfig,
  parseOrderId,
  verifySignedRequest,
} from '@/lib/woo-bridge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 1024;

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers: { 'cache-control': 'no-store' } });

/**
 * POST /api/woo/status - called by the WooCommerce plugin (server to server, signed like the others).
 * Body: { order_id, payment_intent }
 *
 * Lets WordPress ASK whether an order was paid, instead of relying only on being told. That call goes
 * from the shop OUT to this site, so a firewall in front of the shop can't leave a paid order stuck.
 * The answer is only given when the payment really belongs to that order (its metadata must carry the
 * same WooCommerce order number).
 */
export async function POST(request: Request) {
  const config = getWooConfig();
  if (!config) return fail(WOO_NOT_CONFIGURED_MESSAGE, 503);
  const stripe = getStripe();
  if (!stripe) return fail(STRIPE_NOT_CONFIGURED_MESSAGE, 503);

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) return fail('Request too large.', 413);

  const authentic = verifySignedRequest(
    config.secret,
    request.headers.get(WOO_TIMESTAMP_HEADER),
    request.headers.get(WOO_SIGNATURE_HEADER),
    rawBody,
  );
  if (!authentic) return fail('Invalid signature.', 401);

  let body: { order_id?: unknown; payment_intent?: unknown };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return fail('Invalid JSON.', 400);
  }

  const orderId = parseOrderId(body?.order_id);
  const id = typeof body?.payment_intent === 'string' ? body.payment_intent : '';
  if (!orderId) return fail('Invalid order_id.', 400);
  if (!PAYMENT_INTENT_ID.test(id)) return fail('Invalid payment_intent.', 400);

  try {
    const intent = await stripe.paymentIntents.retrieve(id);
    if (parseOrderId(intent.metadata?.woo_order_id) !== orderId) {
      return fail('That payment does not belong to this order.', 404);
    }
    const status =
      intent.status === 'succeeded'
        ? 'paid'
        : intent.status === 'processing'
          ? 'processing'
          : intent.status === 'canceled'
            ? 'canceled'
            : 'unpaid';
    return NextResponse.json(
      {
        status,
        payment_intent: intent.id,
        amount: intent.status === 'succeeded' ? intent.amount_received : intent.amount,
        currency: intent.currency,
      },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    console.error(`[woo-status] Could not read the payment for order ${orderId}:`, error);
    return fail(describeStripeError(error), 502);
  }
}
