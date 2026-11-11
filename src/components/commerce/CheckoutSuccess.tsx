'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { useCartStore } from '@/lib/cart-store';
import type { CheckoutSessionSummary } from '@/lib/checkout-types';
import { formatPrice } from '@/lib/utils';

type Result = { kind: 'ok'; session: CheckoutSessionSummary } | { kind: 'error'; message: string };

/**
 * Reads ?session_id=, fetches the order summary from /api/checkout/session,
 * shows items + total, and clears the cart once payment is confirmed.
 */
export function CheckoutSuccess() {
  const sessionId = useSearchParams().get('session_id');
  const clearCart = useCartStore((s) => s.clear);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`,
          {
            signal: controller.signal,
          },
        );
        const data = (await res.json()) as CheckoutSessionSummary | { error: string };
        if (!res.ok || 'error' in data) {
          setResult({
            kind: 'error',
            message: 'error' in data ? data.error : 'We could not load your order details.',
          });
          return;
        }
        setResult({ kind: 'ok', session: data });
        // Payment confirmed → the bag has served its purpose.
        if (data.paymentStatus === 'paid' || data.status === 'complete') clearCart();
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setResult({ kind: 'error', message: 'We could not load your order details.' });
      }
    })();

    return () => controller.abort();
  }, [sessionId, clearCart]);

  // No session id in the URL → nothing to look up (derived, so no state update needed).
  if (!sessionId) {
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
        body={`Your payment may have gone through, but ${result.message.toLowerCase()} Check your email for a Stripe receipt, or contact us and we'll help.`}
      />
    );
  }

  const { session } = result;
  const currency = session.currency?.toUpperCase() ?? 'USD';

  return (
    <>
      <PageHeader
        eyebrow="Order confirmed"
        meta={currency}
        title="Thank you"
        intro={
          <>
            Your order is confirmed.
            {session.customerEmail ? (
              <>
                {' '}
                A receipt is on its way to{' '}
                <strong className="font-bold text-ink">{session.customerEmail}</strong>.
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
          {session.items.map((item, i) => (
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
          {session.amountSubtotal !== null ? (
            <Row label="Subtotal" value={formatPrice(session.amountSubtotal)} />
          ) : null}
          {session.amountShipping !== null ? (
            <Row
              label="Shipping"
              value={session.amountShipping === 0 ? 'Free' : formatPrice(session.amountShipping)}
            />
          ) : null}
          {session.amountTax ? <Row label="Tax" value={formatPrice(session.amountTax)} /> : null}
          <div className="flex items-baseline justify-between border-t border-ink pt-4">
            <dt className="label text-ink">Total</dt>
            <dd className="display text-3xl tabular-nums tracking-[-0.02em]">
              {session.amountTotal !== null ? formatPrice(session.amountTotal) : 'n/a'}
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
