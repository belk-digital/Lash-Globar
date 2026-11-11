'use client';

import { useEffect, type ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { useCartStore } from '@/lib/cart-store';
import { MotionConfig } from 'framer-motion';

const CART_STORAGE_KEY = 'lash-globar-cart';

/** Client-side providers: toasts, motion preferences, and cart hydration + cross-tab sync. */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Read the persisted cart after mount so SSR and first client render match.
    void useCartStore.persist.rehydrate();

    // Keep multiple tabs in sync.
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) void useCartStore.persist.rehydrate();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    // `user` makes every framer-motion animation honour prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
}
