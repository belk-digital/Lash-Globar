import { NextResponse, type NextRequest } from 'next/server';
import {
  PAYMENT_INTENT_ID,
  PAYMENT_INTENT_SECRET,
  WOO_NOT_CONFIGURED_MESSAGE,
  buildReturnRedirect,
  getWooConfig,
  notifyWoo,
  parseOrderId,
  sameText,
  type WooReturnStatus,
} from '@/lib/woo-bridge';
import { describeStripeError, getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const text = (message: string, status: number) =>
  new NextResponse(message, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });

const redirect = (to: string) =>
  NextResponse.redirect(to, { status: 303, headers: { 'cache-control': 'no-store' } });

/**
 * GET /woo/return - where the customer lands after the payment page on this site.
 *
 *   ?payment_intent=pi_...&payment_intent_client_secret=...   Stripe's return link after paying.
 *                                                             The real status is read from Stripe,
 *                                                             never from the URL.
 *   ?status=cancelled                                         the customer backed out
 *
 * It makes sure WooCommerce has been told about a paid order (the webhook normally got there first;
 * the confirmation is idempotent), then redirects to the configured WordPress site only. The redirect
 * is signed, so WooCommerce can trust it, and it carries an order number only after Stripe has
 * confirmed that payment. A cancelled return carries no order at all.
 */
export async function GET(request: NextRequest) {
  const config = getWooConfig();
  if (!config) return text(WOO_NOT_CONFIGURED_MESSAGE, 503);

  const params = request.nextUrl.searchParams;

  if (params.get('status') === 'cancelled') {
    return redirect(buildReturnRedirect(config, 'cancelled', null));
  }

  const paymentId = params.get('payment_intent');
  const secret = params.get('payment_intent_client_secret');
  if (
    !paymentId ||
    !PAYMENT_INTENT_ID.test(paymentId) ||
    !secret ||
    !PAYMENT_INTENT_SECRET.test(secret)
  ) {
    return text('This payment link is not valid.', 400);
  }

  const stripe = getStripe();
  if (!stripe) return text('Payments are not configured.', 503);

  let intent;
  try {
    intent = await stripe.paymentIntents.retrieve(paymentId);
  } catch (error) {
    console.error('[woo-return] Could not load the payment:', describeStripeError(error));
    return text(
      'We could not confirm your payment right now. Please check your email or contact us.',
      502,
    );
  }

  // The secret in the link proves the visitor is the person who paid; the metadata says which order.
  if (!intent.client_secret || !sameText(intent.client_secret, secret)) {
    return text('This payment link is not valid.', 400);
  }
  const orderId = parseOrderId(intent.metadata?.woo_order_id);
  if (!orderId) return text('This payment link is not valid.', 400);

  let status: WooReturnStatus;
  if (intent.status === 'succeeded') {
    status = 'paid';
    const result = await notifyWoo(config, {
      event: 'paid',
      order_id: orderId,
      amount: intent.amount_received,
      currency: intent.currency,
      payment_intent: intent.id,
    });
    if (!result.ok) {
      // Not fatal for the customer: Stripe's webhook retries, and the shop also asks us for the status
      // when the customer arrives and from the order's "Check card payment status" action.
      console.error(
        `[woo-return] Order ${orderId} paid, but WooCommerce did not accept the confirmation yet (HTTP ${result.status}): ${result.detail}`,
      );
    }
  } else if (intent.status === 'processing') {
    // The bank is still confirming (a delayed payment method).
    status = 'pending';
  } else {
    // Not paid: back to checkout, the cart untouched.
    status = 'cancelled';
  }

  return redirect(buildReturnRedirect(config, status, status === 'cancelled' ? null : orderId));
}
