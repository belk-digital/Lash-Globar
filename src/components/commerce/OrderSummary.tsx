'use client';

import { Button } from '@/components/ui/Button';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/site';
import { cn, formatPrice } from '@/lib/utils';

type OrderSummaryProps = {
  subtotal: number;
  onCheckout: () => void;
  loading?: boolean;
  className?: string;
};

/** Subtotal, shipping note and the Checkout button (shared by the drawer and /cart). */
export function OrderSummary({ subtotal, onCheckout, loading, className }: OrderSummaryProps) {
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  return (
    <div className={cn('space-y-4', className)}>
      <dl className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between">
          <dt className="text-ink-soft">Subtotal</dt>
          <dd className="font-bold tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-ink-soft">Shipping</dt>
          <dd className="tabular-nums">
            {freeShipping ? (
              <span className="font-bold">Free</span>
            ) : (
              <span className="text-ink-soft">Calculated at checkout</span>
            )}
          </dd>
        </div>
      </dl>
      <div className="flex items-baseline justify-between border-t border-ink pt-4">
        <span className="label text-ink">Estimated total</span>
        <span className="display text-3xl tabular-nums tracking-[-0.02em]">
          {formatPrice(subtotal)}
        </span>
      </div>
      <Button size="lg" block loading={loading} onClick={onCheckout}>
        Checkout
      </Button>
      <p className="label text-center text-ink-soft">
        Secure checkout with Stripe · Taxes at payment
      </p>
    </div>
  );
}
