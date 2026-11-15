import { NextResponse } from 'next/server';
import type { IntentResponse } from '@/lib/checkout-types';
import { encodeLines, priceCart } from '@/lib/payments';
import { SITE_NAME } from '@/lib/site';
import { STRIPE_NOT_CONFIGURED_MESSAGE, describeStripeError, getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers: { 'cache-control': 'no-store' } });

/**
 * POST /api/checkout/intent
 * Body: `{ items: { id, quantity, variant? }[] }` (a bare array is accepted too).
 *
 * Creates a Stripe PaymentIntent for the bag and returns its client secret, which the /checkout
 * page hands to Stripe's card form (the Payment Element) so the customer pays on this site.
 * Amounts are always priced here from the catalog, never taken from the browser.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return fail(STRIPE_NOT_CONFIGURED_MESSAGE, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request.', 400);
  }

  const priced = priceCart(
    Array.isArray(body) ? body : (body as { items?: unknown } | null)?.items,
  );
  if (!priced.ok) return fail(priced.error, 400);
  const { cart } = priced;

  try {
    const intent = await stripe.paymentIntents.create({
      amount: cart.total,
      currency: 'usd',
      allowed_payment_method_types: ['card'],
      description: `${SITE_NAME} order`,
      metadata: {
        kind: 'store',
        subtotal_cents: String(cart.subtotal),
        shipping_cents: String(cart.shipping),
        ...encodeLines(cart.lines),
      },
    });
    if (!intent.client_secret)
      return fail('Stripe did not return a payment form. Please try again.', 502);

    const response: IntentResponse = {
      clientSecret: intent.client_secret,
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      total: cart.total,
    };
    return NextResponse.json(response, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    console.error('[checkout] Could not create the payment:', error);
    return fail(describeStripeError(error), 502);
  }
}
