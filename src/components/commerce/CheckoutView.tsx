'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  AddressElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import {
  cartSubtotal,
  toCartLines,
  useCartHydrated,
  useCartStore,
  type CartLine,
} from '@/lib/cart-store';
import type { IntentResponse } from '@/lib/checkout-types';
import { FEATURED_PRODUCTS } from '@/lib/products';
import { ROUTES, SHIPPING_COUNTRIES } from '@/lib/site';
import {
  STRIPE_NOT_READY_MESSAGE,
  fieldClass,
  getStripePromise,
  stripeAppearance,
  stripeFonts,
} from '@/lib/stripe-client';
import { formatMoney, formatPrice } from '@/lib/utils';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

/**
 * The /checkout page: contact, shipping address and the card form, all on this site.
 * The card form is Stripe's Payment Element, so card numbers are typed into Stripe's secure fields
 * (an iframe) and never reach our servers, but the customer never leaves the page to pay.
 */
export function CheckoutView() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartHydrated();
  const lines = useMemo(() => toCartLines(items), [items]);
  const stripePromise = useMemo(() => getStripePromise(), []);

  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    intent: IntentResponse | null;
    error: string | null;
  } | null>(null);

  // What we ask the server to price. Re-asked only when the bag really changes (or on "Try again").
  const payload = useMemo(
    () =>
      JSON.stringify(lines.map((l) => ({ id: l.id, quantity: l.quantity, variant: l.variant }))),
    [lines],
  );
  const requestKey = `${attempt}:${payload}`;

  // A result only counts for the request it answered, so changing the bag shows the loader again.
  const current = result?.key === requestKey ? result : null;
  const intent = current?.intent ?? null;
  const error = current?.error ?? null;

  useEffect(() => {
    if (!hydrated || lines.length === 0 || !stripePromise) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/checkout/intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: JSON.parse(payload) }),
        });
        const data = (await res.json().catch(() => ({}))) as Partial<IntentResponse> & {
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.clientSecret) {
          setResult({
            key: requestKey,
            intent: null,
            error: data.error ?? 'Checkout is unavailable right now. Please try again shortly.',
          });
          return;
        }
        setResult({ key: requestKey, intent: data as IntentResponse, error: null });
      } catch {
        if (!cancelled) {
          setResult({
            key: requestKey,
            intent: null,
            error: 'Network error. Please check your connection and try again.',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, payload, requestKey, lines.length, stripePromise]);

  if (!hydrated) {
    return <Panel aria-hidden="true" className="min-h-[24rem] animate-pulse bg-mist" />;
  }

  if (lines.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Checkout"
          title="Your bag is empty"
          intro="Nothing to pay for yet. Start with something soft. Our essentials are a lovely place to begin."
        >
          <Button href={ROUTES.shop} size="lg">
            Shop all
          </Button>
        </PageHeader>
        <Panel className="p-5 sm:p-8 lg:p-12">
          <Label tone="ink" className="mb-6">
            Our essentials
          </Label>
          <ProductGrid products={FEATURED_PRODUCTS} />
        </Panel>
      </>
    );
  }

  const subtotal = cartSubtotal(lines);

  return (
    <>
      <PageHeader eyebrow="Secure checkout" meta="Pay by card" title="Checkout" />
      <div className="grid gap-frame lg:grid-cols-12">
        <div className="lg:col-span-8">
          {!stripePromise ? (
            <Notice title="Card payments are not set up yet" body={STRIPE_NOT_READY_MESSAGE} />
          ) : error ? (
            <Notice
              title="We couldn't start checkout"
              body={error}
              action={
                <Button size="lg" onClick={() => setAttempt((n) => n + 1)}>
                  Try again
                </Button>
              }
            />
          ) : !intent ? (
            <Panel aria-busy="true" aria-live="polite" className="p-5 sm:p-8 lg:p-10">
              <Label tone="ink">Preparing secure payment…</Label>
              <div className="mt-6 h-72 animate-pulse bg-mist" />
            </Panel>
          ) : (
            <Elements
              key={intent.clientSecret}
              stripe={stripePromise}
              options={{
                clientSecret: intent.clientSecret,
                appearance: stripeAppearance,
                fonts: stripeFonts,
              }}
            >
              <PaymentForm intent={intent} />
            </Elements>
          )}
        </div>

        <aside className="lg:col-span-4" aria-label="Order summary">
          <Panel
            tone="mist"
            className="p-5 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+var(--frame)*2)]"
          >
            <h2 className="label mb-6 text-ink">Order summary</h2>
            <SummaryLines lines={lines} />
            <dl className="mt-6 space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(intent?.subtotal ?? subtotal)} />
              <Row
                label="Shipping"
                value={
                  intent
                    ? intent.shipping === 0
                      ? 'Free'
                      : formatPrice(intent.shipping)
                    : 'Calculated below'
                }
              />
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-ink pt-4">
              <span className="label text-ink">Total</span>
              <span className="display text-3xl tabular-nums tracking-[-0.02em]">
                {formatMoney(intent?.total ?? subtotal)}
              </span>
            </div>
            <Link
              href={ROUTES.cart}
              className="label mt-6 inline-block text-ink-soft underline underline-offset-4"
            >
              Edit bag
            </Link>
          </Panel>
        </aside>
      </div>
    </>
  );
}

function PaymentForm({ intent }: { intent: IntentResponse }) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!stripe || !elements || busy) return;
    if (!EMAIL.test(email)) {
      setMessage('Enter a valid email address so we can send your receipt.');
      document.getElementById('checkout-email')?.focus();
      return;
    }
    setBusy(true);
    setMessage(null);

    // On success the browser is sent to return_url (the "Thank you" page). We only get control back
    // here when something needs fixing: a declined card, a missing field, a network problem.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        receipt_email: email,
      },
    });
    setMessage(
      error.type === 'card_error' || error.type === 'validation_error'
        ? error.message?.trim() || 'We could not complete the payment. Please check your details.'
        : 'Something went wrong while paying. You have not been charged. Please try again.',
    );
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Panel className="p-5 sm:p-8 lg:p-10">
        <Section n="01" title="Contact">
          <label
            htmlFor="checkout-email"
            className="mb-2 block text-xs font-bold uppercase tracking-[0.1em]"
          >
            Email
          </label>
          <input
            id="checkout-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </Section>

        <Section n="02" title="Shipping address">
          <AddressElement
            options={{ mode: 'shipping', allowedCountries: [...SHIPPING_COUNTRIES] }}
          />
        </Section>

        <Section n="03" title="Payment">
          <PaymentElement options={{ layout: 'tabs', wallets: { link: 'never' } }} />
        </Section>

        {message ? (
          <p role="alert" className="mt-8 border border-ink bg-mist p-4 text-sm">
            {message}
          </p>
        ) : null}

        <Button type="submit" size="lg" block loading={busy} disabled={!stripe} className="mt-8">
          {`Pay ${formatMoney(intent.total)}`}
        </Button>
        <p className="label mt-4 text-center text-ink-soft">
          Payments are processed securely by Stripe · Card details never touch our servers
        </p>
      </Panel>
    </form>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <div className="mb-5 flex items-baseline gap-3">
        <Label tone="ink">{n}</Label>
        <h2 className="text-lg font-bold uppercase tracking-[0.04em]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SummaryLines({ lines }: { lines: CartLine[] }) {
  return (
    <ul className="divide-y divide-line border-y border-ink">
      {lines.map((line) => {
        const option = line.variant ? Object.values(line.variant).join(' / ') : '';
        return (
          <li key={line.key} className="flex items-baseline justify-between gap-4 py-3 text-sm">
            <span>
              {line.product.name}
              {option ? <span className="text-ink-soft"> ({option})</span> : null}
              <span className="label ml-2 text-ink-soft">× {line.quantity}</span>
            </span>
            <span className="font-bold tabular-nums">
              {formatPrice(line.product.price * line.quantity)}
            </span>
          </li>
        );
      })}
    </ul>
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

function Notice({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <Panel className="p-5 sm:p-8 lg:p-10" role="alert">
      <h2 className="text-lg font-bold uppercase tracking-[0.04em]">{title}</h2>
      <p className="mt-3 max-w-prose text-ink-soft">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Panel>
  );
}
