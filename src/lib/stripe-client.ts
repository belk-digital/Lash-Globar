'use client';

/**
 * Browser-side Stripe setup for the embedded card form (the Payment Element).
 * Only the PUBLISHABLE key is used here; it is safe to expose and is set with
 * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
 */
import {
  loadStripe,
  type Appearance,
  type Stripe,
  type StripeElementsOptions,
} from '@stripe/stripe-js';

const PLACEHOLDER = /x{3,}/i; // the `pk_test_xxx` value from .env.example

let cached: Promise<Stripe | null> | null | undefined;

/** Loads Stripe.js once. Returns `null` when the publishable key is missing or still the placeholder. */
export function getStripePromise(): Promise<Stripe | null> | null {
  if (cached !== undefined) return cached;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  cached = key && key.startsWith('pk_') && !PLACEHOLDER.test(key) ? loadStripe(key) : null;
  return cached;
}

export const STRIPE_NOT_READY_MESSAGE =
  'Card payments are not set up yet. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local (see README) and restart the server.';

/** Makes Stripe's card form match the site: square corners, hairlines, ink text, Archivo. */
export const stripeAppearance: Appearance = {
  theme: 'flat',
  variables: {
    colorPrimary: '#2C142C',
    colorText: '#2C142C',
    colorTextSecondary: '#6B5F73',
    colorTextPlaceholder: '#6B5F73',
    colorBackground: '#FFFFFF',
    colorDanger: '#B3261E',
    fontFamily: 'Archivo, system-ui, sans-serif',
    fontSizeBase: '16px',
    borderRadius: '0px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: '1px solid #2C142C', boxShadow: 'none', padding: '14px 16px' },
    '.Input:hover': { backgroundColor: '#F7F4FB' },
    '.Input:focus': { backgroundColor: '#F7F4FB', border: '1px solid #2C142C', boxShadow: 'none' },
    '.Label': {
      fontSize: '12px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '8px',
    },
    '.Tab': { border: '1px solid #E2D9EE', boxShadow: 'none' },
    '.Tab--selected': { border: '1px solid #2C142C', boxShadow: 'none' },
    '.Error': { fontSize: '13px' },
  },
};

export const stripeFonts: StripeElementsOptions['fonts'] = [
  { cssSrc: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700&display=swap' },
];

export const fieldClass =
  'w-full border border-ink bg-white px-4 py-3.5 text-base text-ink transition-colors placeholder:text-ink-soft hover:bg-mist focus:bg-mist focus:outline-none';
