'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { startCheckout, type CheckoutItem } from '@/lib/checkout-client';

/**
 * Starts Stripe Checkout and surfaces any failure as an error toast
 * (missing keys, network trouble, Stripe errors) - it never throws into the UI.
 */
export function useCheckout() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Coming back from Stripe via the browser's Back button restores this page from
  // the back/forward cache with `loading` still true - reset it.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setLoading(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const checkout = useCallback(
    async (items: CheckoutItem[]) => {
      setLoading(true);
      try {
        await startCheckout(items);
        // Success → the browser is navigating to Stripe; keep the spinner up.
      } catch (error) {
        setLoading(false);
        toast({
          title: 'Checkout unavailable',
          description:
            error instanceof Error ? error.message : 'Something went wrong. Please try again.',
          variant: 'error',
        });
      }
    },
    [toast],
  );

  return { checkout, loading };
}
