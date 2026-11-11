import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { CheckoutSessionSummary } from '@/lib/checkout-types';
import { STRIPE_NOT_CONFIGURED_MESSAGE, describeStripeError, getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET /api/checkout/session?session_id=cs_… - returns an order summary with line items. */
export async function GET(request: Request) {
  const stripe = getStripe();
  if (!stripe) return fail(STRIPE_NOT_CONFIGURED_MESSAGE, 503);

  const sessionId = new URL(request.url).searchParams.get('session_id');
  // Checkout Session IDs look like cs_test_a1B2… / cs_live_…
  if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return fail('Missing or invalid session id.', 400);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    const summary: CheckoutSessionSummary = {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      currency: session.currency,
      customerEmail: session.customer_details?.email ?? null,
      amountSubtotal: session.amount_subtotal,
      amountShipping: session.total_details?.amount_shipping ?? null,
      amountTax: session.total_details?.amount_tax ?? null,
      amountTotal: session.amount_total,
      items: (session.line_items?.data ?? []).map((line) => ({
        name: line.description ?? 'Item',
        quantity: line.quantity ?? 1,
        amountTotal: line.amount_total,
      })),
    };
    return NextResponse.json(summary);
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === 'resource_missing'
    ) {
      return fail('We could not find that order.', 404);
    }
    console.error('[checkout/session] retrieve failed:', error);
    return fail(describeStripeError(error), 502);
  }
}
