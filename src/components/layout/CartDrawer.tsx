'use client';

import { useMemo, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { CartLineItem } from '@/components/commerce/CartLineItem';
import { OrderSummary } from '@/components/commerce/OrderSummary';
import { Button } from '@/components/ui/Button';
import { useCheckout } from '@/hooks/use-checkout';
import { useOverlay } from '@/hooks/use-overlay';
import {
  cartSubtotal,
  toCartLines,
  useCartCount,
  useCartHydrated,
  useCartStore,
} from '@/lib/cart-store';
import { EASE } from '@/lib/motion';
import { FREE_SHIPPING_THRESHOLD, ROUTES } from '@/lib/site';
import { formatPrice } from '@/lib/utils';

/**
 * Slide-out bag. Accessible modal dialog: focus is trapped, Escape and the backdrop close it,
 * background scroll is locked, and focus returns to the control that opened it.
 */
export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const hydrated = useCartHydrated();
  const count = useCartCount();
  const { checkout, loading } = useCheckout();
  const panelRef = useRef<HTMLElement>(null);

  useOverlay(isOpen, close, panelRef);

  const lines = useMemo(() => (hydrated ? toCartLines(items) : []), [items, hydrated]);
  const subtotal = cartSubtotal(lines);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="backdrop"
            aria-hidden="true"
            className="fixed inset-0 z-[70] bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
          />
          <motion.aside
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.65, ease: EASE }}
            className="fixed right-0 top-0 z-[71] flex h-dvh w-full max-w-[28.75rem] flex-col border-l border-ink bg-white"
          >
            <div className="flex h-header shrink-0 items-stretch border-b border-line">
              <h2 id="cart-drawer-title" className="label flex items-center pl-5 text-ink">
                Your bag ({count})
              </h2>
              <button
                type="button"
                onClick={close}
                className="label ml-auto flex items-center border-l border-line px-6 text-ink transition-colors hover:bg-lavender"
              >
                Close
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="display text-[clamp(2.5rem,9vw,3.5rem)] leading-[0.95] tracking-[-0.03em]">
                    Your bag is empty
                  </p>
                  <p className="mt-5 max-w-xs text-ink-soft">
                    Nothing here yet. Start with something soft.
                  </p>
                </div>
                <Button href={ROUTES.shop} onClick={close} size="lg" block>
                  Shop all
                </Button>
              </div>
            ) : (
              <>
                {/* Free-shipping progress: a flat bar, no ornament */}
                <div className="shrink-0 border-b border-line p-5">
                  <p className="text-sm">
                    {remaining > 0 ? (
                      <>
                        <strong className="font-bold">{formatPrice(remaining)}</strong> away from
                        free shipping
                      </>
                    ) : (
                      <strong className="font-bold">You’ve unlocked free shipping</strong>
                    )}
                  </p>
                  <div
                    className="mt-3 h-[3px] bg-line"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress)}
                    aria-label="Progress toward free shipping"
                  >
                    <div
                      className="h-full bg-ink transition-[width] duration-700 ease-expo"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* data-lenis-prevent: lets this list scroll natively while Lenis is paused */}
                <ul
                  data-lenis-prevent
                  className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain"
                >
                  {lines.map((line) => (
                    <CartLineItem key={line.key} line={line} onNavigate={close} />
                  ))}
                </ul>

                <div className="shrink-0 border-t border-ink bg-mist p-5">
                  <OrderSummary
                    subtotal={subtotal}
                    loading={loading}
                    onCheckout={() =>
                      void checkout(
                        lines.map((l) => ({ id: l.id, quantity: l.quantity, variant: l.variant })),
                      )
                    }
                  />
                  <Link
                    href={ROUTES.cart}
                    onClick={close}
                    className="link-draw mx-auto mt-3 flex min-h-11 w-fit items-center text-xs font-bold uppercase tracking-[0.1em]"
                  >
                    View full bag
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
