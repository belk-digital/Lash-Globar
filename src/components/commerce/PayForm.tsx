'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { STATEMENT_NAME } from '@/lib/site';
import {
  STRIPE_NOT_READY_MESSAGE,
  getStripePromise,
  stripeAppearance,
  stripeFonts,
} from '@/lib/stripe-client';
import { formatMoney } from '@/lib/utils';

type Props = {
  clientSecret: string;
  /** Total in cents. */
  amount: number;
  orderNumber: string;
};

/**
 * The payment page a WooCommerce customer is sent to. It deliberately shows ONLY the order number and
 * the total (no products), with Stripe's card form embedded so the customer pays on this site.
 */
export function PayForm({ clientSecret, amount, orderNumber }: Props) {
  const stripePromise = useMemo(() => getStripePromise(), []);

  return (
    <>
      <PageHeader
        eyebrow="Secure payment"
        meta="Pay by card"
        title={`Order #${orderNumber}`}
        intro="Enter your card details to complete your order. You will be taken back to the shop as soon as the payment goes through."
      />
      <div className="mx-auto w-full max-w-2xl">
        <Panel className="p-5 sm:p-8 lg:p-10">
          <div className="flex items-baseline justify-between border-b border-ink pb-5">
            <Label tone="ink">Total to pay</Label>
            <span className="display text-4xl tabular-nums tracking-[-0.02em]">
              {formatMoney(amount)}
            </span>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            This payment will appear on your card statement as{' '}
            <strong className="font-bold text-ink">{STATEMENT_NAME}</strong>.
          </p>

          {!stripePromise ? (
            <p role="alert" className="mt-8 text-ink-soft">
              {STRIPE_NOT_READY_MESSAGE}
            </p>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: stripeAppearance, fonts: stripeFonts }}
            >
              <Card amount={amount} />
            </Elements>
          )}
        </Panel>
      </div>
    </>
  );
}

function Card({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!stripe || !elements || busy) return;
    setBusy(true);
    setMessage(null);

    // On success Stripe sends the browser to return_url, where this site confirms the payment with
    // Stripe and sends the customer back to the shop. We only get control back if something needs fixing.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/woo/return` },
    });
    setMessage(
      error.type === 'card_error' || error.type === 'validation_error'
        ? error.message?.trim() ||
            'We could not complete the payment. Please check your card details.'
        : 'Something went wrong while paying. You have not been charged. Please try again.',
    );
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8">
      <PaymentElement options={{ layout: 'tabs', wallets: { link: 'never' } }} />

      {message ? (
        <p role="alert" className="mt-6 border border-ink bg-mist p-4 text-sm">
          {message}
        </p>
      ) : null}

      <Button type="submit" size="lg" block loading={busy} disabled={!stripe} className="mt-8">
        {`Pay ${formatMoney(amount)}`}
      </Button>
      <p className="label mt-4 text-center text-ink-soft">
        Payments are processed securely by Stripe · Card details never touch our servers
      </p>
      <p className="mt-6 text-center">
        <Link
          href="/woo/return?status=cancelled"
          prefetch={false}
          className="label text-ink-soft underline underline-offset-4"
        >
          Cancel and return to the shop
        </Link>
      </p>
    </form>
  );
}
