import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';
import { CATEGORIES, PRODUCTS } from '@/lib/products';
import { SITE_URL } from '@/lib/site';

/** /sitemap.xml - public, indexable pages only (no cart, checkout or API routes). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly',
    lastModified: Date = now,
  ) => ({ url: `${SITE_URL}${path}`, lastModified, changeFrequency, priority });

  return [
    entry('/', 1, 'weekly'),
    entry('/shop', 0.9, 'weekly'),
    ...CATEGORIES.map((c) => entry(`/shop/${c.slug}`, 0.8, 'weekly')),
    ...PRODUCTS.map((p) => entry(`/products/${p.slug}`, 0.8, 'weekly')),
    entry('/our-story', 0.6),
    entry('/journal', 0.6, 'weekly'),
    ...ARTICLES.map((a) => entry(`/journal/${a.slug}`, 0.5, 'yearly', new Date(a.date))),
    entry('/faq', 0.5),
    entry('/shipping-returns', 0.4, 'yearly'),
    entry('/contact', 0.4, 'yearly'),
  ];
}
