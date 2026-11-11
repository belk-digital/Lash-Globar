import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BenefitTable } from '@/components/commerce/BenefitTable';
import { ProductGallery } from '@/components/commerce/ProductGallery';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { PurchasePanel } from '@/components/commerce/PurchasePanel';
import { FaqSection } from '@/components/sections/FaqSection';
import { Accordion, type AccordionItem } from '@/components/ui/Accordion';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { FadeIn } from '@/components/ui/FadeIn';
import { Label, Tag } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { SectionHead } from '@/components/ui/SectionHead';
import { Stars } from '@/components/ui/Stars';
import { StickyPanel } from '@/components/ui/StickyPanel';
import { FAQ_SETS, faqsById } from '@/lib/faqs';
import { IMAGES } from '@/lib/images';
import {
  PRODUCTS,
  getCategory,
  getPairsWith,
  getProduct,
  getRelated,
  productHref,
} from '@/lib/products';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { formatPrice } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

/** Pre-render all product pages at build time. */
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: `${product.tagline} ${product.description}`.slice(0, 200),
    alternates: { canonical: productHref(product) },
    openGraph: {
      type: 'website',
      title: `${product.name} | ${SITE_NAME}`,
      description: product.tagline,
      images: [{ url: product.images[0], alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const pairs = getPairsWith(product, 3);
  const related = getRelated(product, 4);
  const onSale = product.compareAtPrice !== undefined && product.compareAtPrice > product.price;

  const accordionItems: AccordionItem[] = [
    {
      id: 'details',
      title: 'Details',
      content: (
        <ul className="list-[square] space-y-2 pl-5 marker:text-ink">
          {product.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ),
    },
    {
      id: 'how-to-apply',
      title: 'How to apply',
      content: (
        <ol className="list-decimal space-y-2 pl-5 marker:font-mono marker:text-xs marker:text-ink">
          {product.howToApply.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      ),
    },
    {
      id: 'materials',
      title: 'Materials',
      content: (
        <ul className="list-[square] space-y-2 pl-5 marker:text-ink">
          {product.materials.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      ),
    },
    {
      id: 'shipping',
      title: 'Shipping & returns',
      content: (
        <p>
          Free standard shipping on orders over $60. Orders ship within 1–2 business days. Unopened
          products can be returned within 30 days. See our{' '}
          <Link href="/shipping-returns" className="link-draw text-ink">
            full shipping &amp; returns policy
          </Link>
          .
        </p>
      ),
    },
  ];

  // Structured data for search engines (Product + Offer + AggregateRating).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.id,
    image: product.images.map((src) => `${SITE_URL}${src}`),
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: category?.label,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}${productHref(product)}`,
      priceCurrency: 'USD',
      price: (product.price / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <>
      <div className="grid gap-frame lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Sticky info panel (desktop). StickyPanel keeps even a tall panel fully reachable. */}
        <div className="lg:col-span-5">
          <StickyPanel>
            <Panel className="p-5 sm:p-8">
              <FadeIn y={16}>
                <div className="flex items-start justify-between gap-4">
                  <nav aria-label="Breadcrumb">
                    <ol className="label flex flex-wrap items-center gap-x-2 text-ink-soft">
                      <li>
                        <Link href="/shop" className="link-draw">
                          Shop
                        </Link>
                      </li>
                      <li aria-hidden="true">/</li>
                      <li>
                        <Link href={`/shop/${product.category}`} className="link-draw">
                          {category?.label}
                        </Link>
                      </li>
                    </ol>
                  </nav>
                  <Label>{product.id}</Label>
                </div>

                <h1 className="display mt-8 text-[clamp(2rem,3.6vw,3.75rem)] leading-[0.95] tracking-[-0.03em]">
                  {product.name}
                </h1>
                <p className="mt-3 text-lead text-ink-soft">{product.tagline}</p>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-line py-4">
                  <p className="flex items-baseline gap-3">
                    <span className="display text-3xl tabular-nums tracking-[-0.02em]">
                      {formatPrice(product.price)}
                    </span>
                    {onSale ? (
                      <s className="tabular-nums text-ink-soft">
                        <span className="sr-only">Was </span>
                        {formatPrice(product.compareAtPrice!)}
                      </s>
                    ) : null}
                  </p>
                  {product.badges?.map((b) => (
                    <Tag key={b}>{b}</Tag>
                  ))}
                  <Stars
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    className="sm:ml-auto"
                  />
                </div>

                <p className="mt-6 leading-relaxed text-ink/85">{product.description}</p>
              </FadeIn>

              <div className="mt-8">
                <PurchasePanel product={product} />
              </div>

              <div className="mt-10">
                <Accordion items={accordionItems} defaultOpen={['details']} />
              </div>

              <BenefitTable className="mt-8" />
            </Panel>
          </StickyPanel>
        </div>
      </div>

      {/* Pairs well with */}
      {pairs.length > 0 ? (
        <Panel aria-label="Pairs well with">
          <div className="p-5 pb-8 sm:p-8 sm:pb-10 lg:p-12 lg:pb-12">
            <SectionHead label="Complete the ritual" title="Pairs well with" />
          </div>
          <div className="grid border-t border-ink lg:grid-cols-12">
            <div className="relative aspect-[16/10] border-b border-line sm:aspect-[16/9] lg:col-span-4 lg:aspect-auto lg:min-h-[26rem] lg:border-b-0 lg:border-r">
              <Image
                src={IMAGES.pairsWith.src}
                alt={IMAGES.pairsWith.alt}
                fill
                sizes="(min-width: 1025px) 30vw, 100vw"
                className="object-cover"
                style={{ objectPosition: IMAGES.pairsWith.position }}
              />
            </div>
            <div className="lg:col-span-8">
              <ProductGrid
                bare
                products={pairs}
                cols="grid-cols-2 sm:grid-cols-3"
                sizes="(min-width: 1025px) 20vw, 33vw"
              />
            </div>
          </div>
        </Panel>
      ) : null}

      {/* You may also like */}
      <Panel aria-label="You may also like">
        <div className="p-5 pb-8 sm:p-8 sm:pb-10 lg:p-12 lg:pb-12">
          <SectionHead
            label="More to love"
            title="You may also like"
            action={<ArrowLink href="/shop">Shop all</ArrowLink>}
          />
        </div>
        <div className="border-t border-ink">
          <ProductGrid bare products={related} cols="grid-cols-2 lg:grid-cols-4" />
        </div>
      </Panel>

      <FaqSection
        label="Product FAQ"
        title="Good to know"
        description={`Care, wear and delivery for ${product.name}.`}
        items={faqsById(FAQ_SETS.category[product.category]).slice(0, 5)}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
