'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useOverlay } from '@/hooks/use-overlay';
import { EASE } from '@/lib/motion';
import {
  FEATURED_PRODUCTS,
  PRODUCTS,
  getCategory,
  productHref,
  type Product,
} from '@/lib/products';
import { formatPrice } from '@/lib/utils';

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

/** Case-insensitive match across name, tagline, description and category. */
function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) => {
    const haystack = [p.name, p.tagline, p.description, getCategory(p.category)?.label, p.style]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  return <AnimatePresence>{open ? <SearchPanel onClose={onClose} /> : null}</AnimatePresence>;
}

/** Mounted only while open, so its query state resets every time. */
function SearchPanel({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState('');
  useOverlay(true, onClose, ref);

  const results = useMemo(() => searchProducts(query), [query]);
  const trimmed = query.trim();
  const list = (trimmed ? results : FEATURED_PRODUCTS).slice(0, 4);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!trimmed) return;
    onClose();
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      tabIndex={-1}
      data-lenis-prevent
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed inset-x-0 top-0 z-[60] max-h-dvh overflow-y-auto bg-white"
    >
      <div className="flex h-header items-stretch border-b border-line">
        <p className="label flex items-center pl-4 text-ink sm:pl-6">Search</p>
        <button
          type="button"
          onClick={onClose}
          className="label ml-auto flex items-center border-l border-line px-6 text-ink transition-colors hover:bg-lavender"
        >
          Close
        </button>
      </div>

      <form onSubmit={onSubmit} role="search" className="px-frame pt-8 sm:pt-12">
        <label htmlFor="site-search" className="sr-only">
          Search the shop
        </label>
        <div className="flex items-center gap-4 border-b border-ink pb-4">
          <Search className="size-7 shrink-0 text-ink-soft" aria-hidden="true" />
          <input
            id="site-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            autoComplete="off"
            className="display w-full bg-transparent text-[clamp(2rem,7vw,5.5rem)] leading-none tracking-[-0.03em] text-ink placeholder:text-lavender focus:outline-none"
          />
        </div>
      </form>

      <div className="px-frame pb-frame pt-8">
        <p className="label text-ink-soft" aria-live="polite">
          {trimmed
            ? results.length > 0
              ? `${results.length} result${results.length === 1 ? '' : 's'}`
              : `No results for “${trimmed}”`
            : 'Popular right now'}
        </p>

        <ul className="mt-4 grid grid-cols-2 border-l border-t border-line lg:grid-cols-4">
          {list.map((product) => (
            <li key={product.id} className="border-b border-r border-line">
              <Link href={productHref(product)} onClick={onClose} className="group block">
                <span className="relative block aspect-[4/5] overflow-hidden bg-mist">
                  <Image
                    src={product.images[0]}
                    alt=""
                    fill
                    sizes="(min-width: 1025px) 22vw, 46vw"
                    className="object-cover transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.04]"
                  />
                </span>
                <span className="flex items-baseline justify-between gap-3 p-4">
                  <span className="display text-sm leading-tight tracking-[-0.01em]">
                    {product.name}
                  </span>
                  <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {trimmed && results.length > 4 ? (
          <Link
            href={`/shop?q=${encodeURIComponent(trimmed)}`}
            onClick={onClose}
            className="link-draw mt-6 inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-[0.1em]"
          >
            See all {results.length} results
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}
