/**
 * Cart state - Zustand + persist (localStorage).
 *
 * Hydration is deferred (`skipHydration`) and triggered from <Providers/> after mount,
 * so server HTML and the first client render always match (no badge flicker/mismatch).
 * Components that show cart data should gate on `useCartHydrated()`.
 */
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clamp } from './utils';
import { getProductById, resolveVariant, type Product, type VariantSelection } from './products';
import { MAX_QTY } from './site';

export type CartItem = {
  /** Unique per product + variant combination. */
  key: string;
  /** Product id (see products.ts). */
  id: string;
  quantity: number;
  variant?: VariantSelection;
};

export type CartLine = CartItem & { product: Product };

/** Stable identity for a product + variant pairing. */
export function makeCartKey(id: string, variant?: VariantSelection): string {
  if (!variant || Object.keys(variant).length === 0) return id;
  const parts = Object.entries(variant)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);
  return `${id}::${parts.join('|')}`;
}

type AddInput = { id: string; quantity?: number; variant?: VariantSelection };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (input: AddInput, options?: { openDrawer?: boolean }) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

/** Drop anything from storage that no longer matches the catalog. */
function sanitize(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CartItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const { id, quantity, variant } = entry as Partial<CartItem>;
    if (typeof id !== 'string') continue;
    const product = getProductById(id);
    if (!product) continue;
    const resolved = resolveVariant(product, variant);
    if (resolved === null) continue;
    const qty = clamp(Math.floor(Number(quantity) || 1), 1, MAX_QTY);
    out.push({ key: makeCartKey(id, resolved), id, quantity: qty, variant: resolved });
  }
  return out;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      add: ({ id, quantity = 1, variant }, options) =>
        set((state) => {
          const product = getProductById(id);
          if (!product) return state;
          const resolved = resolveVariant(product, variant);
          if (resolved === null) return state;
          const key = makeCartKey(id, resolved);
          const existing = state.items.find((i) => i.key === key);
          const items = existing
            ? state.items.map((i) =>
                i.key === key ? { ...i, quantity: clamp(i.quantity + quantity, 1, MAX_QTY) } : i,
              )
            : [
                ...state.items,
                { key, id, variant: resolved, quantity: clamp(quantity, 1, MAX_QTY) },
              ];
          return { items, isOpen: options?.openDrawer ? true : state.isOpen };
        }),

      setQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) =>
                  i.key === key ? { ...i, quantity: clamp(quantity, 1, MAX_QTY) } : i,
                ),
        })),

      remove: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
    }),
    {
      name: 'lash-globar-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only the items are persisted - never the drawer's open state.
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => ({
        ...current,
        items: sanitize((persisted as { items?: unknown } | undefined)?.items),
      }),
      skipHydration: true,
    },
  ),
);

/** True once localStorage has been read. Server render and first paint are always `false`. */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useCartStore.persist.onFinishHydration(onChange),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}

/** Total number of units in the bag (0 until hydrated, so SSR matches). */
export function useCartCount(): number {
  const hydrated = useCartHydrated();
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  return hydrated ? count : 0;
}

/** Attach product data to raw items. Unknown products are skipped. */
export function toCartLines(items: CartItem[]): CartLine[] {
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = getProductById(item.id);
    if (product) lines.push({ ...item, product });
  }
  return lines;
}

export const cartSubtotal = (lines: CartLine[]): number =>
  lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
