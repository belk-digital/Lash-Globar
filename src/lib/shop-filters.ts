/**
 * Pure helpers for the shop's URL-driven filtering.
 *
 * URL shape (all optional):
 *   /shop?category=clusters,extensions&style=natural,wispy&price=under-25&sort=price-asc&q=cloud
 * Multi-value params are comma-separated. Unknown values are ignored, so hand-edited
 * or stale URLs never break the page.
 */
import {
  CATEGORIES,
  PRICE_RANGES,
  SORT_OPTIONS,
  STYLE_LABELS,
  getCategory,
  type Category,
  type LashStyle,
  type Product,
  type SortKey,
} from './products';

export type PriceRangeId = (typeof PRICE_RANGES)[number]['id'];

export type ShopFilters = {
  categories: Category[];
  styles: LashStyle[];
  prices: PriceRangeId[];
  sort: SortKey;
  q: string;
};

export const EMPTY_FILTERS: ShopFilters = {
  categories: [],
  styles: [],
  prices: [],
  sort: 'featured',
  q: '',
};

type ParamsLike = { get(name: string): string | null };

const csv = (value: string | null): string[] =>
  value
    ? value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

/** Read filters out of URL search params, dropping anything unrecognised. */
export function parseFilters(params: ParamsLike): ShopFilters {
  const categorySlugs = new Set<string>(CATEGORIES.map((c) => c.slug));
  const styleKeys = new Set<string>(Object.keys(STYLE_LABELS));
  const priceIds = new Set<string>(PRICE_RANGES.map((r) => r.id));
  const sortKeys = new Set<string>(SORT_OPTIONS.map((o) => o.value));

  const sort = params.get('sort');
  return {
    categories: csv(params.get('category')).filter((c): c is Category => categorySlugs.has(c)),
    styles: csv(params.get('style')).filter((s): s is LashStyle => styleKeys.has(s)),
    prices: csv(params.get('price')).filter((p): p is PriceRangeId => priceIds.has(p)),
    sort: sort && sortKeys.has(sort) ? (sort as SortKey) : 'featured',
    q: (params.get('q') ?? '').trim().slice(0, 80),
  };
}

/** Build a query string (without "?") from filters, omitting defaults. */
export function serializeFilters(
  filters: ShopFilters,
  omit: readonly (keyof ShopFilters)[] = [],
): string {
  const params = new URLSearchParams();
  if (!omit.includes('categories') && filters.categories.length)
    params.set('category', filters.categories.join(','));
  if (filters.styles.length) params.set('style', filters.styles.join(','));
  if (filters.prices.length) params.set('price', filters.prices.join(','));
  if (filters.sort !== 'featured') params.set('sort', filters.sort);
  if (filters.q) params.set('q', filters.q);
  return params.toString();
}

/** How many filter groups are active (used for the mobile "Filters (2)" badge). */
export function activeFilterCount(filters: ShopFilters, lockedCategory?: Category): number {
  return (
    (lockedCategory ? 0 : filters.categories.length) + filters.styles.length + filters.prices.length
  );
}

function matchesQuery(product: Product, q: string): boolean {
  if (!q) return true;
  const haystack = [
    product.name,
    product.tagline,
    product.description,
    getCategory(product.category)?.label,
    product.style,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}

/** Filter + sort the catalog. `lockedCategory` pins a category (for /shop/[category]). */
export function applyFilters(
  products: readonly Product[],
  filters: ShopFilters,
  lockedCategory?: Category,
): Product[] {
  const ranges = PRICE_RANGES.filter((r) => filters.prices.includes(r.id));

  const list = products.filter((p) => {
    if (lockedCategory && p.category !== lockedCategory) return false;
    if (!lockedCategory && filters.categories.length && !filters.categories.includes(p.category))
      return false;
    if (filters.styles.length && (!p.style || !filters.styles.includes(p.style))) return false;
    if (ranges.length && !ranges.some((r) => p.price >= r.min && p.price < r.max)) return false;
    return matchesQuery(p, filters.q);
  });

  const sorted = [...list];
  switch (filters.sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // Featured first, otherwise catalog order (Array#sort is stable).
      sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
  return sorted;
}
