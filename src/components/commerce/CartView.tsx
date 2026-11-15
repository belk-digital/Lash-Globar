'use client';

import { useMemo } from 'react';
import { CartLineItem } from '@/components/commerce/CartLineItem';
import { OrderSummary } from '@/components/commerce/OrderSummary';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCheckout } from '@/hooks/use-checkout';
import { cartSubtotal, toCartLines, useCartHydrated, useCartStore } from '@/lib/cart-store';
import { FEATURED_PRODUCTS } from '@/lib/products';
import { FREE_SHIPPING_THRESHOLD, ROUTES } from '@/lib/site';
import { formatPrice } from '@/lib/utils';

/** The /cart page body: a title band, then line items + sticky summary - or a calm empty state. */
export function CartView() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartHydrated();
  const { checkout, loading } = useCheckout();

  const lines = useMemo(() => toCartLines(items), [items]);
  const subtotal = cartSubtotal(lines);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const units = lines.reduce((n, l) => n + l.quantity, 0);

  // Until localStorage has been read, show a neutral placeholder (avoids an "empty bag" flash).
  if (!hydrated) {
    return <Panel aria-hidden="true" className="min-h-[24rem] animate-pulse bg-mist" />;
  }

  if (lines.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Checkout"
          title="Your bag is empty"
          intro="Nothing here yet. Start with something soft. Our essentials are a lovely place to begin."
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

  return (
    <>
      <PageHeader
        eyebrow="Checkout"
        meta={`${units} item${units === 1 ? '' : 's'}`}
        title="Your bag"
      />
      <div className="grid gap-frame lg:grid-cols-12">
        <Panel className="lg:col-span-8">
          <p className="border-b border-line p-5 text-sm sm:px-6">
            {remaining > 0 ? (
              <>
                <strong className="font-bold">{formatPrice(remaining)}</strong> away from free
                shipping
              </>
            ) : (
              <strong className="font-bold">You’ve unlocked free shipping</strong>
            )}
          </p>
          <ul className="divide-y divide-line">
            {lines.map((line) => (
              <CartLineItem key={line.key} line={line} layout="full" />
            ))}
          </ul>
        </Panel>

        <aside className="lg:col-span-4" aria-label="Order summary">
          <Panel
            tone="mist"
            className="p-5 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+var(--frame)*2)]"
          >
            <h2 className="label mb-6 text-ink">Summary</h2>
            <OrderSummary subtotal={subtotal} loading={loading} onCheckout={checkout} />
          </Panel>
        </aside>
      </div>
    </>
  );
}
