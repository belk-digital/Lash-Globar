/**
 * Server-side pricing and order helpers for this store's own checkout (the embedded card form).
 * Import ONLY from route handlers / server code.
 *
 * SECURITY: the browser only ever sends product IDs, quantities and option choices. Names and prices
 * are looked up here from the catalog (src/lib/products.ts), so client-sent prices are never read.
 */
import { getProductById, resolveVariant } from '@/lib/products';
import { FREE_SHIPPING_THRESHOLD, MAX_QTY } from '@/lib/site';

export const MAX_LINES = 20;
/** Flat rate below the free-shipping threshold, in cents. Edit to match your real rates. */
export const FLAT_SHIPPING_CENTS = 599;
export type PricedLine = {
  name: string;
  quantity: number;
  /** Line total in cents. */
  amount: number;
};

export type PricedCart = {
  lines: PricedLine[];
  /** All in integer cents. */
  subtotal: number;
  shipping: number;
  total: number;
};

export type PriceResult = { ok: true; cart: PricedCart } | { ok: false; error: string };

/** Validates a cart sent by the browser and prices it from the catalog. */
export function priceCart(raw: unknown): PriceResult {
  if (!Array.isArray(raw) || raw.length === 0) return { ok: false, error: 'Your bag is empty.' };
  if (raw.length > MAX_LINES) return { ok: false, error: 'Too many items in one order.' };

  const lines: PricedLine[] = [];
  let subtotal = 0;

  for (const entry of raw as Array<{ id?: unknown; quantity?: unknown; variant?: unknown }>) {
    const product = typeof entry?.id === 'string' ? getProductById(entry.id) : undefined;
    if (!product)
      return { ok: false, error: 'One of the items in your bag is no longer available.' };

    const quantity = Number(entry.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return { ok: false, error: `Invalid quantity for ${product.name}.` };
    }

    const variant = resolveVariant(product, entry.variant);
    if (variant === null)
      return { ok: false, error: `Invalid option selected for ${product.name}.` };

    const optionText = variant ? Object.values(variant).join(' / ') : '';
    const amount = product.price * quantity;
    subtotal += amount;
    lines.push({
      name: optionText ? `${product.name} (${optionText})` : product.name,
      quantity,
      amount,
    });
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_CENTS;
  return { ok: true, cart: { lines, subtotal, shipping, total: subtotal + shipping } };
}

// Stripe metadata allows 50 keys of up to 500 characters each, so the item list is stored in chunks.
const CHUNK = 450;
const MAX_CHUNKS = 8;

/** Packs the order lines into Stripe metadata (`items_0`, `items_1`, ...). */
export function encodeLines(lines: PricedLine[]): Record<string, string> {
  const json = JSON.stringify(
    lines.map((l) => ({ n: l.name.slice(0, 80), q: l.quantity, a: l.amount })),
  );
  const out: Record<string, string> = {};
  for (let i = 0; i * CHUNK < json.length && i < MAX_CHUNKS; i++) {
    out[`items_${i}`] = json.slice(i * CHUNK, (i + 1) * CHUNK);
  }
  return out;
}

/** Reads the order lines back out of Stripe metadata. Never throws. */
export function decodeLines(metadata: Record<string, string> | null | undefined): PricedLine[] {
  if (!metadata) return [];
  let json = '';
  for (let i = 0; i < MAX_CHUNKS; i++) {
    const part = metadata[`items_${i}`];
    if (typeof part !== 'string') break;
    json += part;
  }
  try {
    const parsed = JSON.parse(json) as Array<{ n?: unknown; q?: unknown; a?: unknown }>;
    return parsed
      .filter((l) => typeof l.n === 'string' && Number.isInteger(l.q) && Number.isInteger(l.a))
      .map((l) => ({ name: l.n as string, quantity: l.q as number, amount: l.a as number }));
  } catch {
    return [];
  }
}
