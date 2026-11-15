import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PayForm } from '@/components/commerce/PayForm';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { getStripe } from '@/lib/stripe';
import { getWooConfig, parseOrderId, parsePayToken } from '@/lib/woo-bridge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Secure payment',
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ token: string }> };

/**
 * /pay/<token> - the payment page for a WooCommerce order. The token is issued by /api/woo/checkout
 * and is signed, so only real payment links open this page.
 */
export default async function PayPage({ params }: Props) {
  const { token } = await params;
  const config = getWooConfig();
  const stripe = getStripe();
  if (!config || !stripe) {
    return (
      <Unavailable
        title="Payments are unavailable"
        body="This payment page is not available right now. Please go back to the shop and try again in a moment."
      />
    );
  }

  const paymentId = parsePayToken(config.secret, decodeURIComponent(token));
  if (!paymentId) notFound();

  let intent;
  try {
    intent = await stripe.paymentIntents.retrieve(paymentId);
  } catch {
    notFound();
  }

  const orderId = parseOrderId(intent.metadata?.woo_order_id);
  if (!orderId || !intent.client_secret) notFound();

  // Already paid (or the bank is confirming): do not show the form again, finish the journey instead.
  // This also lets a customer who returns to an old payment link complete a stuck order.
  if (intent.status === 'succeeded' || intent.status === 'processing') {
    redirect(
      `/woo/return?payment_intent=${intent.id}&payment_intent_client_secret=${intent.client_secret}`,
    );
  }

  if (intent.status === 'canceled') {
    return (
      <Unavailable
        title="This payment link has expired"
        body="Please go back to the shop and choose card payment again to get a new link."
      />
    );
  }

  return (
    <PayForm clientSecret={intent.client_secret} amount={intent.amount} orderNumber={orderId} />
  );
}

function Unavailable({ title, body }: { title: string; body: string }) {
  return (
    <PageHeader eyebrow="Secure payment" title={title} intro={body}>
      <Button href="/woo/return?status=cancelled" size="lg">
        Return to the shop
      </Button>
    </PageHeader>
  );
}
