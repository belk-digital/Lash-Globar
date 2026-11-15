import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { CheckoutSummary } from '@/lib/checkout-types';
import { decodeLines } from '@/lib/payments';
import { STRIPE_NOT_CONFIGURED_MESSAGE, describeStripeError, getStripe } from '@/lib/stripe';
import { PAYMENT_INTENT_ID, PAYMENT_INTENT_SECRET, sameText } from '@/lib/woo-bridge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers: { 'cache-control': 'no-store' } });

const cents = (value: string | undefined): number | null => {
  const n = Number(value);
  return value !== undefined && Number.isInteger(n) && n >= 0 ? n : null;
};

/**
 * GET /api/checkout/order?payment_intent=pi_...&payment_intent_client_secret=pi_..._secret_...
 * Returns the order summary for the "Thank you" page. The payment's client secret (which Stripe puts
 * in the return link) is required, so an order can only be read by the person who paid for it.
 */
export async function GET(request: Request) {
  const stripe = getStripe();
  if (!stripe) return fail(STRIPE_NOT_CONFIGURED_MESSAGE, 503);

  const params = new URL(request.url).searchParams;
  const id = params.get('payment_intent');
  const secret = params.get('payment_intent_client_secret');
  if (!id || !PAYMENT_INTENT_ID.test(id) || !secret || !PAYMENT_INTENT_SECRET.test(secret)) {
    return fail('Missing or invalid payment reference.', 400);
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(id);
    // Only this store's own orders (never WooCommerce payments), and only with the matching secret.
    if (
      intent.metadata?.kind !== 'store' ||
      !intent.client_secret ||
      !sameText(intent.client_secret, secret)
    ) {
      return fail('We could not find that order.', 404);
    }

    const summary: CheckoutSummary = {
      id: intent.id,
      state:
        intent.status === 'succeeded'
          ? 'paid'
          : intent.status === 'processing'
            ? 'processing'
            : 'unpaid',
      currency: intent.currency,
      customerEmail: intent.receipt_email ?? null,
      amountSubtotal: cents(intent.metadata.subtotal_cents),
      amountShipping: cents(intent.metadata.shipping_cents),
      amountTotal: intent.amount,
      items: decodeLines(intent.metadata).map((l) => ({
        name: l.name,
        quantity: l.quantity,
        amountTotal: l.amount,
      })),
    };
    return NextResponse.json(summary, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === 'resource_missing'
    ) {
      return fail('We could not find that order.', 404);
    }
    console.error('[checkout/order] retrieve failed:', error);
    return fail(describeStripeError(error), 502);
  }
}
