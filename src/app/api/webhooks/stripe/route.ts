import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { decodeLines } from '@/lib/payments';
import { getStripe } from '@/lib/stripe';
import {
  WOO_NOT_CONFIGURED_MESSAGE,
  getWooConfig,
  notifyWoo,
  parseOrderId,
} from '@/lib/woo-bridge';

// Signature verification needs Node's crypto and the exact raw request body.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLACEHOLDER = /x{3,}/i; // the `whsec_xxx` value from .env.example

/**
 * POST /api/webhooks/stripe
 * Local testing:  stripe listen --events payment_intent.succeeded --forward-to localhost:3000/api/webhooks/stripe
 *
 * Needs ONE event enabled on the Stripe webhook endpoint: `payment_intent.succeeded`.
 *
 * There's no database, so a completed store order is logged to the console. Swap the `logOrder` call
 * for your fulfilment / email / DB logic when you're ready.
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

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;

    // A payment that started on the WooCommerce site carries the Woo order number in its metadata.
    // It is forwarded to WordPress and never reaches this store's own order logging below.
    const wooOrderId = intent.metadata?.woo_order_id;
    if (wooOrderId) return forwardToWoo(intent, wooOrderId);

    // This store's own checkout.
    if (intent.metadata?.kind === 'store') logOrder(intent);
  }

  return NextResponse.json({ received: true });
}

/**
 * Tells the WooCommerce site that one of its orders was paid.
 * A failed delivery returns 500 so Stripe retries (it keeps trying for days); the confirmation is
 * idempotent on the WooCommerce side, so repeats are harmless.
 */
async function forwardToWoo(
  intent: Stripe.PaymentIntent,
  rawOrderId: string,
): Promise<NextResponse> {
  const orderId = parseOrderId(rawOrderId);
  const config = getWooConfig();
  if (!orderId || !config) {
    console.error('[webhook] WooCommerce payment event received but the bridge is not configured.');
    return NextResponse.json({ error: WOO_NOT_CONFIGURED_MESSAGE }, { status: 503 });
  }

  const result = await notifyWoo(config, {
    event: 'paid',
    order_id: orderId,
    amount: intent.amount_received,
    currency: intent.currency,
    payment_intent: intent.id,
  });
  if (result.ok) return NextResponse.json({ received: true });

  console.error(
    `[webhook] WooCommerce rejected the paid confirmation for order ${orderId} (HTTP ${result.status}): ${result.detail}`,
  );
  // 404/422 mean WooCommerce will never accept it (unknown order, bad data): stop the retries.
  if (result.permanent) return NextResponse.json({ received: true, forwarded: false });
  // Say WHY in the reply, so it is visible in Stripe's webhook dashboard (no secrets are ever in here):
  // wp_status 0 = no answer, 3xx = redirected, 401 = secrets differ, 403 = a firewall said no.
  return NextResponse.json(
    {
      error: 'Could not reach WooCommerce.',
      wp_status: result.status,
      wp_detail: (result.detail ?? '').replace(/\s+/g, ' ').slice(0, 160),
    },
    { status: 500 },
  );
}

function logOrder(intent: Stripe.PaymentIntent): void {
  const money = (cents: number | null | undefined) =>
    cents == null ? 'n/a' : `${(cents / 100).toFixed(2)} ${intent.currency.toUpperCase()}`;
  const shipping = intent.shipping;
  const meta = (key: string) => {
    const n = Number(intent.metadata?.[key]);
    return Number.isInteger(n) ? n : null;
  };

  console.log('\n✨ NEW ORDER ─────────────────────────────────────────');
  console.log('Payment:  ', intent.id);
  console.log('Customer: ', intent.receipt_email ?? 'n/a');
  if (shipping) {
    console.log('Ship to:  ', shipping.name, JSON.stringify(shipping.address));
  }
  console.log('Items:');
  for (const line of decodeLines(intent.metadata)) {
    console.log(`  • ${line.quantity} × ${line.name}  ·  ${money(line.amount)}`);
  }
  console.log('Shipping: ', money(meta('shipping_cents')));
  console.log('Total:    ', money(intent.amount_received));
  console.log('──────────────────────────────────────────────────────\n');
}
