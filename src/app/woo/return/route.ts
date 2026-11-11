import { NextResponse, type NextRequest } from 'next/server';
import {
  WOO_NOT_CONFIGURED_MESSAGE,
  buildReturnRedirect,
  getWooConfig,
  notifyWoo,
  parseOrderId,
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
 * GET /woo/return - where Stripe sends the customer after the payment page.
 *
 *   ?session_id=cs_...   paid (or pending): the real status is read from Stripe, never from the URL
 *   ?status=cancelled    the customer backed out
 *
 * It makes sure WooCommerce has been told about a paid order (the webhook normally got there first;
 * the confirmation is idempotent), then redirects to the configured WordPress site only. The
 * redirect is signed, so WooCommerce can trust it, and it carries an order number only after Stripe
 * has confirmed that session. A cancelled return carries no order at all.
 */
export async function GET(request: NextRequest) {
  const config = getWooConfig();
  if (!config) return text(WOO_NOT_CONFIGURED_MESSAGE, 503);

  const params = request.nextUrl.searchParams;

  if (params.get('status') === 'cancelled') {
    return redirect(buildReturnRedirect(config, 'cancelled', null));
  }

  const sessionId = params.get('session_id');
  if (!sessionId || !/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) {
    return text('This payment link is not valid.', 400);
  }

  const stripe = getStripe();
  if (!stripe) return text('Payments are not configured.', 503);

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error('[woo-return] Could not load the payment session:', describeStripeError(error));
    return text(
      'We could not confirm your payment right now. Please check your email or contact us.',
      502,
    );
  }

  const orderId = parseOrderId(session.metadata?.woo_order_id);
  if (!orderId) return text('This payment link is not valid.', 400);

  let status: WooReturnStatus;
  if (session.payment_status === 'paid') {
    status = 'paid';
    const result = await notifyWoo(config, {
      event: 'paid',
      order_id: orderId,
      session_id: session.id,
      amount: session.amount_total ?? undefined,
      currency: session.currency ?? undefined,
      payment_intent:
        typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
    });
    if (!result.ok) {
      // Not fatal for the customer: Stripe's webhook keeps retrying the same confirmation.
      console.error(
        `[woo-return] Order ${orderId} paid, but WooCommerce did not accept the confirmation yet (HTTP ${result.status}): ${result.detail}`,
      );
    }
  } else if (session.status === 'expired') {
    status = 'cancelled';
  } else {
    // Complete but not paid yet (a delayed payment method), or still open.
    status = 'pending';
  }

  return redirect(buildReturnRedirect(config, status, status === 'cancelled' ? null : orderId));
}
