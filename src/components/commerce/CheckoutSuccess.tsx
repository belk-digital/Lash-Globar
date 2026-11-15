'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { useCartStore } from '@/lib/cart-store';
import type { CheckoutSummary } from '@/lib/checkout-types';
import { formatPrice } from '@/lib/utils';

type Result = { kind: 'ok'; order: CheckoutSummary } | { kind: 'error'; message: string };

/**
 * Stripe sends the customer here after paying, with ?payment_intent=...&payment_intent_client_secret=...
 * We ask our server for the order summary (the secret proves it is their payment), show the items
 * and total, and empty the bag once the payment is confirmed.
 */
export function CheckoutSuccess() {
  const params = useSearchParams();
  const paymentIntent = params.get('payment_intent');
  const secret = params.get('payment_intent_client_secret');
  const clearCart = useCartStore((s) => s.clear);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!paymentIntent || !secret) return;
    const controller = new AbortController();

    (async () => {
      try {
        const query = new URLSearchParams({
          payment_intent: paymentIntent,
          payment_intent_client_secret: secret,
        });
        const res = await fetch(`/api/checkout/order?${query.toString()}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as CheckoutSummary | { error: string };
        if (!res.ok || 'error' in data) {
          setResult({
            kind: 'error',
            message: 'error' in data ? data.error : 'We could not load your order details.',
          });
          return;
        }
        setResult({ kind: 'ok', order: data });
        // Payment received (or on its way): the bag has served its purpose.
        if (data.state === 'paid' || data.state === 'processing') clearCart();
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setResult({ kind: 'error', message: 'We could not load your order details.' });
      }
    })();

    return () => controller.abort();
  }, [paymentIntent, secret, clearCart]);

  // No payment reference in the URL → nothing to look up (derived, so no state update needed).
  if (!paymentIntent || !secret) {
    return (
      <Notice
        title="Order confirmed"
        body="If you just completed a payment, a receipt is on its way to your inbox."
      />
    );
  }

  if (!result) {
    return (
      <Panel className="p-5 sm:p-8 lg:p-12" aria-busy="true" aria-live="polite">
        <Label>Confirming your order…</Label>
        <div className="mt-6 h-40 animate-pulse bg-mist" />
      </Panel>
    );
  }

  if (result.kind === 'error') {
    return (
      <Notice
        title="Thank you, almost there"
        body={`Your payment may have gone through, but ${result.message.toLowerCase()} Check your email for a receipt, or contact us and we'll help.`}
      />
    );
  }

  const { order } = result;

  if (order.state === 'unpaid') {
    return (
      <PageHeader
        eyebrow="Payment"
        title="Payment not completed"
        intro="Your card was not charged, and everything you picked is still in your bag. You can try again with the same or a different card."
      >
        <div className="flex flex-wrap gap-2">
          <Button href="/checkout" size="lg">
            Try again
          </Button>
          <Button href="/cart" variant="outline" size="lg">
            Back to bag
          </Button>
        </div>
      </PageHeader>
    );
  }

  const currency = order.currency?.toUpperCase() ?? 'USD';
  const processing = order.state === 'processing';

  return (
    <>
      <PageHeader
        eyebrow={processing ? 'Payment processing' : 'Order confirmed'}
        meta={currency}
        title="Thank you"
        intro={
          <>
            {processing
              ? 'Your payment is being confirmed by your bank. We will email you as soon as it clears.'
              : 'Your order is confirmed.'}
            {order.customerEmail ? (
              <>
                {' '}
                A receipt is on its way to{' '}
                <strong className="font-bold text-ink">{order.customerEmail}</strong>.
              </>
            ) : null}{' '}
            We’ll email tracking as soon as it ships.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Button href="/shop" size="lg">
            Continue shopping
          </Button>
          <Button href="/journal" variant="outline" size="lg">
            Read the journal
          </Button>
        </div>
      </PageHeader>

      <Panel tone="mist" aria-labelledby="order-summary-title" className="p-5 sm:p-8 lg:p-12">
        <h2 id="order-summary-title" className="label text-ink">
          Order summary
        </h2>
        <ul className="mt-6 divide-y divide-line border-y border-ink">
          {order.items.map((item, i) => (
            <li
              key={`${item.name}-${i}`}
              className="flex items-baseline justify-between gap-4 py-4"
            >
              <span>
                {item.name} <span className="label ml-2 text-ink-soft">× {item.quantity}</span>
              </span>
              <span className="font-bold tabular-nums">{formatPrice(item.amountTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 max-w-md space-y-2 text-sm lg:ml-auto">
          {order.amountSubtotal !== null ? (
            <Row label="Subtotal" value={formatPrice(order.amountSubtotal)} />
          ) : null}
          {order.amountShipping !== null ? (
            <Row
              label="Shipping"
              value={order.amountShipping === 0 ? 'Free' : formatPrice(order.amountShipping)}
            />
          ) : null}
          <div className="flex items-baseline justify-between border-t border-ink pt-4">
            <dt className="label text-ink">Total</dt>
            <dd className="display text-3xl tabular-nums tracking-[-0.02em]">
              {order.amountTotal !== null ? formatPrice(order.amountTotal) : 'n/a'}
            </dd>
          </div>
        </dl>
      </Panel>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <PageHeader eyebrow="Order" title={title} intro={body}>
      <div className="flex flex-wrap gap-2">
        <Button href="/shop" size="lg">
          Continue shopping
        </Button>
        <Button href="/contact" variant="outline" size="lg">
          Contact us
        </Button>
      </div>
    </PageHeader>
  );
}
