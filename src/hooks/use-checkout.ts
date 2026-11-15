'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { ROUTES } from '@/lib/site';

/**
 * Takes the customer to the on-site /checkout page, where they pay in the embedded card form.
 * (The old behaviour, a redirect to a Stripe-hosted page, is gone: payment now happens on this site.)
 */
export function useCheckout() {
  const router = useRouter();
  const pathname = usePathname();
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const [loading, setLoading] = useState(false);

  // Shared components (the cart drawer) stay mounted across pages: clear the spinner once we arrive.
  useEffect(() => () => setLoading(false), [pathname]);

  const checkout = useCallback(() => {
    setLoading(true);
    closeDrawer();
    router.push(ROUTES.checkout);
  }, [closeDrawer, router]);

  return { checkout, loading };
}
