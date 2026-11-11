import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { describeStripeError, getStripe } from '@/lib/stripe';
import {
  WOO_NOT_CONFIGURED_MESSAGE,
  getWooConfig,
  notifyWoo,
  parseOrderId,
  type WooConfirmation,
} from '@/lib/woo-bridge';

// Signature verification needs Node's crypto and the exact raw request body.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLACEHOLDER = /x{3,}/i; // the `whsec_xxx` value from .env.example

/**
 * POST /api/webhooks/stripe
 * Local testing:  stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *
 * There's no database, so a completed order is logged to the console. Swap the
 * `logOrder` call for your fulfilment / email / DB logic when you're ready.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret || PLACEHOLDER.test(secret)) {
    return NextResponse.json(
      { error: 'Stripe webhooks are not configured (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET).' },
      { status: 503 },
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  // IMPORTANT: read the RAW text body. Parsing it as JSON first would change the bytes
  // and make signature verification fail.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    console.error('[webhook] Signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  // Payments that started on the WooCommerce site carry the Woo order number in metadata. They are
  // forwarded to WordPress and never reach this store's own order logging below.
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded' ||
    event.type === 'checkout.session.expired'
  ) {
    const wooOrderId = (event.data.object as Stripe.Checkout.Session).metadata?.woo_order_id;
    if (wooOrderId) return forwardToWoo(event, wooOrderId);
  }

  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      // The event payload omits line items - fetch them for a complete order record.
      const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] });
      logOrder(full);
    } catch (error) {
      // Return 500 so Stripe retries delivery.
      console.error('[webhook] Could not load completed session:', describeStripeError(error));
      return NextResponse.json({ error: 'Failed to process event.' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

/**
 * Tells the WooCommerce site what happened to one of its orders.
 * A failed delivery returns 500 so Stripe retries (it keeps trying for days); the confirmation is
 * idempotent on the WooCommerce side, so repeats are harmless.
 */
async function forwardToWoo(event: Stripe.Event, rawOrderId: string): Promise<NextResponse> {
  const orderId = parseOrderId(rawOrderId);
  const config = getWooConfig();
  if (!orderId || !config) {
    console.error('[webhook] WooCommerce payment event received but the bridge is not configured.');
    return NextResponse.json({ error: WOO_NOT_CONFIGURED_MESSAGE }, { status: 503 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  let confirmation: WooConfirmation | null = null;
  if (event.type === 'checkout.session.expired') {
    confirmation = { event: 'expired', order_id: orderId, session_id: session.id };
  } else if (session.payment_status === 'paid') {
    // `completed` for cards, or `async_payment_succeeded` for delayed methods.
    confirmation = {
      event: 'paid',
      order_id: orderId,
      session_id: session.id,
      amount: session.amount_total ?? undefined,
      currency: session.currency ?? undefined,
      payment_intent:
        typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
    };
  }
  // `completed` while still unpaid (delayed method): wait for `async_payment_succeeded`.
  if (!confirmation) return NextResponse.json({ received: true });

  const result = await notifyWoo(config, confirmation);
  if (result.ok) return NextResponse.json({ received: true });

  console.error(
    `[webhook] WooCommerce rejected the ${confirmation.event} confirmation for order ${orderId} (HTTP ${result.status}): ${result.detail}`,
  );
  // 404/422 mean WooCommerce will never accept it (unknown order, bad data): stop the retries.
  if (result.permanent) return NextResponse.json({ received: true, forwarded: false });
  return NextResponse.json({ error: 'Could not reach WooCommerce.' }, { status: 500 });
}

function logOrder(session: Stripe.Checkout.Session): void {
  const money = (cents: number | null | undefined) =>
    cents == null
      ? 'n/a'
      : `${(cents / 100).toFixed(2)} ${(session.currency ?? 'usd').toUpperCase()}`;
  const shipping = session.collected_information?.shipping_details;

  console.log('\n✨ NEW ORDER ─────────────────────────────────────────');
  console.log('Session:  ', session.id);
  console.log('Payment:  ', session.payment_status);
  console.log('Customer: ', session.customer_details?.email ?? 'n/a');
  if (shipping) {
    console.log('Ship to:  ', shipping.name, JSON.stringify(shipping.address));
  }
  console.log('Items:');
  for (const line of session.line_items?.data ?? []) {
    console.log(`  • ${line.quantity} × ${line.description}  ·  ${money(line.amount_total)}`);
  }
  console.log('Shipping: ', money(session.total_details?.amount_shipping));
  console.log('Total:    ', money(session.amount_total));
  console.log('──────────────────────────────────────────────────────\n');
}
