import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ShopBrowser } from '@/components/commerce/ShopBrowser';
import { ShopSkeleton } from '@/components/commerce/ShopSkeleton';
import { FaqSection } from '@/components/sections/FaqSection';
import { PageHeader } from '@/components/ui/PageHeader';
import { FAQ_SETS, faqsById } from '@/lib/faqs';
import { PRODUCTS } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Shop all',
  description:
    'Shop every Lash Globar essential: strip lashes, clusters, extension trays, adhesives, tools and kits. Weightless, reusable, vegan and cruelty-free.',
  alternates: { canonical: '/shop' },
};

export default function ShopPage() {
  return (
    <>
      <PageHeader
        eyebrow="The collection"
        meta={`${PRODUCTS.length} products`}
        title="Shop all"
        intro="Weightless lashes, quiet adhesives and the small tools that make the ritual easy. Choose a category, or filter by style and price."
      />
      {/* ShopBrowser reads the URL via useSearchParams, so it needs a Suspense boundary. */}
      <Suspense fallback={<ShopSkeleton />}>
        <ShopBrowser />
      </Suspense>
      <FaqSection
        label="Shop FAQ"
        title="Before you buy"
        description="Curls, care and delivery, answered."
        items={faqsById(FAQ_SETS.shop)}
      />
    </>
  );
}
