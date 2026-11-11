import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopBrowser } from '@/components/commerce/ShopBrowser';
import { ShopSkeleton } from '@/components/commerce/ShopSkeleton';
import { FaqSection } from '@/components/sections/FaqSection';
import { PageHeader } from '@/components/ui/PageHeader';
import { FAQ_SETS, faqsById } from '@/lib/faqs';
import { CATEGORIES, getCategory, getProductsByCategory } from '@/lib/products';

type Props = { params: Promise<{ category: string }> };

/** Pre-render every category page at build time. */
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const meta = getCategory(category);
  if (!meta) return { title: 'Not found' };
  return {
    title: meta.label,
    description: meta.description,
    alternates: { canonical: `/shop/${meta.slug}` },
    openGraph: { title: `${meta.label} | Lash Globar`, description: meta.description },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const meta = getCategory(category);
  if (!meta) notFound();

  const count = getProductsByCategory(meta.slug).length;

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        meta={`${count} product${count === 1 ? '' : 's'}`}
        title={meta.headline}
        intro={meta.intro}
      />
      <Suspense fallback={<ShopSkeleton />}>
        <ShopBrowser lockedCategory={meta.slug} />
      </Suspense>
      <FaqSection
        label={`${meta.label} FAQ`}
        title="Before you buy"
        description={`Quick answers about ${meta.label.toLowerCase()}.`}
        items={faqsById(FAQ_SETS.category[meta.slug])}
      />
    </>
  );
}
