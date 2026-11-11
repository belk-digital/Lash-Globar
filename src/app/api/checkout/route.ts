import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getProductById, resolveVariant } from '@/lib/products';
import { FREE_SHIPPING_THRESHOLD, MAX_QTY, SITE_URL } from '@/lib/site';
import { STRIPE_NOT_CONFIGURED_MESSAGE, describeStripeError, getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

const MAX_LINES = 20;
/** Flat rate below the free-shipping threshold, in cents. Edit to match your real rates. */
const FLAT_SHIPPING_CENTS = 599;

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** Stripe can't fetch images from localhost, so only send image URLs for public origins. */
const isPublicOrigin = (url: string) => !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(url);

/**
 * POST /api/checkout
 * Body: `{ items: { id, quantity, variant? }[] }` (a bare array is accepted too).
 *
 * SECURITY: the client only ever sends product IDs, quantities and option choices.
 * Names and prices are looked up from src/lib/products.ts here - client prices are
 * never read, so they can't be tampered with.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return fail(STRIPE_NOT_CONFIGURED_MESSAGE, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request.', 400);
  }

  const raw = Array.isArray(body) ? body : (body as { items?: unknown } | null)?.items;
  if (!Array.isArray(raw) || raw.length === 0) return fail('Your bag is empty.', 400);
  if (raw.length > MAX_LINES) return fail('Too many items in one order.', 400);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotal = 0;

  for (const entry of raw as Array<{ id?: unknown; quantity?: unknown; variant?: unknown }>) {
    const product = typeof entry?.id === 'string' ? getProductById(entry.id) : undefined;
    if (!product) return fail('One of the items in your bag is no longer available.', 400);

    const quantity = Number(entry.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return fail(`Invalid quantity for ${product.name}.`, 400);
    }

    const variant = resolveVariant(product, entry.variant);
    if (variant === null) return fail(`Invalid option selected for ${product.name}.`, 400);

    const optionText = variant ? Object.values(variant).join(' / ') : '';
    subtotal += product.price * quantity;

    lineItems.push({
      quantity,
      price_data: {
        currency: 'usd',
        unit_amount: product.price, // cents, from the server-side catalog
        product_data: {
          name: optionText ? `${product.name} (${optionText})` : product.name,
          description: product.tagline,
          images: isPublicOrigin(SITE_URL) ? [`${SITE_URL}${product.images[0]}`] : undefined,
          metadata: { product_id: product.id, options: optionText },
        },
      },
    });
  }

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'IN'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: freeShipping ? 'Free shipping' : 'Standard shipping',
            fixed_amount: { amount: freeShipping ? 0 : FLAT_SHIPPING_CENTS, currency: 'usd' },
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/checkout/cancel`,
    });

    if (!session.url) return fail('Stripe did not return a checkout link. Please try again.', 502);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[checkout] Stripe session creation failed:', error);
    return fail(describeStripeError(error), 502);
  }
}
