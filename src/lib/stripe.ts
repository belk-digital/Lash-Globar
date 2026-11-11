/**
 * Server-side Stripe helpers. Import ONLY from route handlers / server code -
 * the secret key must never reach the browser.
 */
import Stripe from 'stripe';

const PLACEHOLDER = /x{3,}/i; // matches the `sk_test_xxx` values in .env.example

/** True only when a real-looking secret key is present (not the .env.example placeholder). */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key) && key!.startsWith('sk_') && !PLACEHOLDER.test(key!);
}

let client: Stripe | null = null;

/** Returns a cached Stripe client, or `null` when keys aren't configured. */
export function getStripe(): Stripe | null {
  if (!isStripeConfigured()) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      appInfo: { name: 'Lash Globar storefront' },
    });
  }
  return client;
}

export const STRIPE_NOT_CONFIGURED_MESSAGE =
  'Checkout is not configured yet. Add your Stripe test keys to .env.local (see README) and restart the dev server.';

/** Turn any thrown value into a safe, user-facing message. */
export function describeStripeError(error: unknown): string {
  if (error instanceof Stripe.errors.StripeAuthenticationError) {
    return 'Stripe rejected the API key. Check STRIPE_SECRET_KEY in .env.local.';
  }
  if (error instanceof Stripe.errors.StripeConnectionError) {
    return 'We could not reach Stripe. Please check your connection and try again.';
  }
  if (error instanceof Stripe.errors.StripeError) {
    return error.message;
  }
  return 'Something went wrong while starting checkout. Please try again.';
}
