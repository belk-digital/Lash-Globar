/** Browser-side helper that starts a Stripe Checkout Session via our API route. */
import type { VariantSelection } from './products';

export type CheckoutItem = {
  id: string;
  quantity: number;
  variant?: VariantSelection;
};

type CheckoutResponse = { url?: string; error?: string };

/**
 * POSTs the cart to /api/checkout and redirects to Stripe-hosted Checkout.
 * Throws an Error with a human-friendly message on any failure - callers show it in a toast.
 */
export async function startCheckout(items: CheckoutItem[]): Promise<void> {
  if (items.length === 0) throw new Error('Your bag is empty.');

  let res: Response;
  try {
    res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  } catch {
    throw new Error('Network error. Please check your connection and try again.');
  }

  let data: CheckoutResponse = {};
  try {
    data = (await res.json()) as CheckoutResponse;
  } catch {
    // Non-JSON error body; fall through to the generic message below.
  }

  if (!res.ok || !data.url) {
    throw new Error(data.error ?? 'Checkout is unavailable right now. Please try again shortly.');
  }

  window.location.assign(data.url);
}
