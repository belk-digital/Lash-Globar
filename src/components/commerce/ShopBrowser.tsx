'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { useOverlay } from '@/hooks/use-overlay';
import { IMAGES } from '@/lib/images';
import { EASE } from '@/lib/motion';
import {
  CATEGORIES,
  PRICE_RANGES,
  PRODUCTS,
  STYLE_LABELS,
  getCategory,
  getProductsByCategory,
  type Category,
  type SortKey,
} from '@/lib/products';
import {
  EMPTY_FILTERS,
  activeFilterCount,
  applyFilters,
  parseFilters,
  serializeFilters,
  type ShopFilters,
} from '@/lib/shop-filters';
import { cn } from '@/lib/utils';
import { Filters } from './Filters';
import { ProductGrid } from './ProductGrid';
import { SortSelect } from './SortSelect';

type ShopBrowserProps = {
  /** Pin to one category (used by /shop/[category]). */
  lockedCategory?: Category;
};

const tabBase =
  'flex h-12 shrink-0 items-center gap-2 border-r border-line px-5 text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-300 sm:px-6';

/**
 * Client-side shop: all filter/sort/search state lives in the URL query string (shareable,
 * back-button friendly) and is applied to the in-memory catalog. Category navigation is a ruled
 * tab strip; style and price live in a sticky column (a drawer below 1025px).
 * Must render inside <Suspense> because it reads useSearchParams().
 */
export function ShopBrowser({ lockedCategory }: ShopBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const products = useMemo(
    () => applyFilters(PRODUCTS, filters, lockedCategory),
    [filters, lockedCategory],
  );
  const activeCount = activeFilterCount(filters, lockedCategory);
  const hasAnything =
    activeCount > 0 || Boolean(filters.q) || (!lockedCategory && filters.categories.length > 0);

  const update = (patch: Partial<ShopFilters>) => {
    const next = { ...filters, ...patch };
    const qs = serializeFilters(next, lockedCategory ? ['categories'] : []);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearAll = () => {
    const qs = serializeFilters({ ...EMPTY_FILTERS, sort: filters.sort });
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Removable chips for every active filter.
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”`, remove: () => update({ q: '' }) });
  if (!lockedCategory && filters.categories.length > 1)
    for (const c of filters.categories)
      chips.push({
        key: `c-${c}`,
        label: getCategory(c)?.label ?? c,
        remove: () => update({ categories: filters.categories.filter((v) => v !== c) }),
      });
  for (const s of filters.styles)
    chips.push({
      key: `s-${s}`,
      label: STYLE_LABELS[s],
      remove: () => update({ styles: filters.styles.filter((v) => v !== s) }),
    });
  for (const p of filters.prices)
    chips.push({
      key: `p-${p}`,
      label: PRICE_RANGES.find((r) => r.id === p)?.label ?? p,
      remove: () => update({ prices: filters.prices.filter((v) => v !== p) }),
    });

  const allActive = !lockedCategory && filters.categories.length === 0;

  return (
    <Panel className="!overflow-visible">
      {/* Category tabs - links on category pages, in-place filters on /shop */}
      <nav
        aria-label="Categories"
        className="shop-bar no-scrollbar flex overflow-x-auto border-b border-ink bg-white"
      >
        {lockedCategory ? (
          <Link href="/shop" className={cn(tabBase, 'hover:bg-mist')}>
            All
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => update({ categories: [] })}
            aria-pressed={allActive}
            className={cn(tabBase, allActive ? 'bg-ink text-white' : 'hover:bg-mist')}
          >
            All
          </button>
        )}
        {CATEGORIES.map((c) => {
          const active = lockedCategory
            ? lockedCategory === c.slug
            : filters.categories.includes(c.slug);
          const content = (
            <>
              {c.label}
              <span className={cn('label', active ? 'text-lavender' : 'text-ink-soft')}>
                {getProductsByCategory(c.slug).length}
              </span>
            </>
          );
          return lockedCategory ? (
            <Link
              key={c.slug}
              href={`/shop/${c.slug}`}
              aria-current={active ? 'page' : undefined}
              className={cn(tabBase, active ? 'bg-ink text-white' : 'hover:bg-mist')}
            >
              {content}
            </Link>
          ) : (
            <button
              key={c.slug}
              type="button"
              aria-pressed={active}
              onClick={() =>
                update({ categories: active && filters.categories.length === 1 ? [] : [c.slug] })
              }
              className={cn(tabBase, active ? 'bg-ink text-white' : 'hover:bg-mist')}
            >
              {content}
            </button>
          );
        })}
      </nav>

      <div className="grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        {/* Desktop filter column */}
        <aside className="hidden border-r border-line lg:block" aria-label="Filters">
          <div className="shop-filters p-6">
            <Filters idPrefix="side" filters={filters} onChange={update} />
            {hasAnything ? (
              <button
                type="button"
                onClick={clearAll}
                className="link-draw mt-8 min-h-11 text-xs font-bold uppercase tracking-[0.1em]"
              >
                Clear all
              </button>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4 sm:px-6">
            <p className="label text-ink-soft" aria-live="polite">
              {products.length} product{products.length === 1 ? '' : 's'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-haspopup="dialog"
                className="h-10 border border-ink px-4 text-xs font-bold uppercase tracking-[0.08em] transition-colors hover:bg-mist lg:hidden"
              >
                Filters{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>
              <SortSelect value={filters.sort} onChange={(sort: SortKey) => update({ sort })} />
            </div>
          </div>

          {chips.length > 0 ? (
            <ul
              className="flex flex-wrap gap-2 border-b border-line p-4 sm:px-6"
              aria-label="Active filters"
            >
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={chip.remove}
                    aria-label={`Remove filter: ${chip.label}`}
                    className="label inline-flex h-8 items-center gap-2 bg-lavender px-3 text-ink transition-colors hover:bg-ink hover:text-white"
                  >
                    {chip.label}
                    <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {products.length > 0 ? (
            <ProductGrid
              products={products}
              bare
              cols="grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4"
              preloadCount={4}
              promo={
                !hasAnything && !lockedCategory && products.length >= 8
                  ? { after: 4, node: <CurlPromo /> }
                  : undefined
              }
            />
          ) : (
            <div className="p-6 py-20 sm:p-12 sm:py-28">
              <p className="display text-[clamp(1.75rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.02em]">
                Nothing matches
              </p>
              <p className="mt-4 max-w-md text-ink-soft">
                Try removing a filter or searching for something different.
              </p>
              <Button variant="outline" className="mt-8" onClick={clearAll}>
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={update}
        onClear={clearAll}
        resultCount={products.length}
        canClear={hasAnything}
      />
    </Panel>
  );
}

/** Editorial cell dropped into the grid: a route into the curl guide. */
function CurlPromo() {
  const image = IMAGES.journal[1];
  return (
    <div className="grid h-full grid-cols-2">
      <div className="flex flex-col justify-between p-5 sm:p-6">
        <Label tone="ink">Guide</Label>
        <div>
          <p className="display text-[clamp(1.75rem,3.4vw,3.25rem)] leading-[0.95] tracking-[-0.03em]">
            C or D?
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            The curl you choose changes how open the eye looks. Here is how to decide.
          </p>
          <ArrowLink href="/journal/how-to-choose-your-curl" className="mt-4">
            Read the guide
          </ArrowLink>
        </div>
      </div>
      <div className="relative min-h-64">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1025px) 24vw, 46vw"
          className="object-cover"
          style={{ objectPosition: '75% 50%' }}
        />
      </div>
    </div>
  );
}

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  filters: ShopFilters;
  onChange: (patch: Partial<ShopFilters>) => void;
  onClear: () => void;
  resultCount: number;
  canClear: boolean;
};

/** Mobile/tablet filter drawer - modal dialog with focus trap and Escape-to-close. */
function FilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onClear,
  resultCount,
  canClear,
}: FilterDrawerProps) {
  const ref = useRef<HTMLDivElement>(null);
  useOverlay(open, onClose, ref);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="filter-backdrop"
            aria-hidden="true"
            className="fixed inset-0 z-[70] bg-ink/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="filter-panel"
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-drawer-title"
            tabIndex={-1}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed left-0 top-0 z-[71] flex h-dvh w-full max-w-sm flex-col border-r border-ink bg-white lg:hidden"
          >
            <div className="flex h-header items-stretch border-b border-line">
              <h2 id="filter-drawer-title" className="label flex items-center pl-5 text-ink">
                Filters
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="label ml-auto flex items-center border-l border-line px-6 text-ink transition-colors hover:bg-lavender"
              >
                Close
              </button>
            </div>
            <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain p-5">
              <Filters idPrefix="drawer" filters={filters} onChange={onChange} />
            </div>
            <div className="flex gap-2 border-t border-ink p-4">
              {canClear ? (
                <Button variant="outline" onClick={onClear} className="flex-1">
                  Clear
                </Button>
              ) : null}
              <Button onClick={onClose} className="flex-[2]">
                Show {resultCount} product{resultCount === 1 ? '' : 's'}
              </Button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
