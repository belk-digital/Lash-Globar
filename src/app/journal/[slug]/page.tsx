import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { ArticleBody } from '@/components/journal/ArticleBody';
import { ProductGrid } from '@/components/commerce/ProductGrid';
import { FadeIn } from '@/components/ui/FadeIn';
import { Label } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { RevealImage } from '@/components/ui/RevealImage';
import { RevealText } from '@/components/ui/RevealText';
import { SectionHead } from '@/components/ui/SectionHead';
import {
  ARTICLES,
  articleHref,
  formatArticleDate,
  getArticle,
  getNextArticle,
} from '@/lib/articles';
import { getProduct, type Product } from '@/lib/products';
import { SITE_NAME, SITE_URL } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: 'Article not found' };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: articleHref(article) },
    openGraph: {
      type: 'article',
      title: `${article.title} | ${SITE_NAME}`,
      description: article.excerpt,
      publishedTime: article.date,
      images: [{ url: article.cover.src, alt: article.cover.alt }],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const next = getNextArticle(article.slug);
  const products = article.products
    .map((s) => getProduct(s))
    .filter((p): p is Product => p !== undefined);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    image: `${SITE_URL}${article.cover.src}`,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}${articleHref(article)}`,
  };

  return (
    <>
      <Panel as="header" className="p-5 sm:p-8 lg:p-12">
        <div className="flex items-start justify-between gap-6">
          <Link
            href="/journal"
            className="label link-draw inline-flex min-h-8 items-center text-ink"
          >
            ← Journal
          </Link>
          <Label>
            {article.category} · {article.readTime} min read ·{' '}
            <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
          </Label>
        </div>
        <RevealText
          as="h1"
          text={article.title}
          immediate
          className="statement mt-10 max-w-[22ch] text-[clamp(2.25rem,6.2vw,6.5rem)] leading-[0.98] sm:mt-16 lg:mt-24"
        />
        <FadeIn delay={0.25} y={16}>
          <p className="mt-8 max-w-2xl text-lead text-ink-soft sm:mt-12">{article.excerpt}</p>
        </FadeIn>
      </Panel>

      <RevealImage
        src={article.cover.src}
        alt={article.cover.alt}
        sizes="100vw"
        position={article.cover.position}
        trigger="load"
        preload
        className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
      />

      {/* ~680px reading column */}
      <Panel as="article" className="p-5 sm:p-8 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--frame)*2)]">
              <Label tone="ink">In this article</Label>
              <ul className="mt-4 space-y-2 text-[0.9375rem] text-ink-soft">
                {article.body
                  .filter((b) => b.type === 'h2')
                  .map((b) => (
                    <li key={b.type === 'h2' ? b.text : ''} className="border-t border-line pt-2">
                      {b.type === 'h2' ? b.text : null}
                    </li>
                  ))}
              </ul>
            </div>
          </aside>
          <div className="max-w-prose lg:col-span-9">
            <ArticleBody blocks={article.body} />
          </div>
        </div>
      </Panel>

      {products.length > 0 ? (
        <Panel aria-label="Shop this article">
          <div className="p-5 pb-8 sm:p-8 sm:pb-10 lg:p-12 lg:pb-12">
            <SectionHead label="From this article" title="Shop the ritual" />
          </div>
          <div className="border-t border-ink">
            <ProductGrid bare products={products} cols="grid-cols-2 sm:grid-cols-3" />
          </div>
        </Panel>
      ) : null}

      {next ? (
        <Panel tone="lavender" aria-label="Continue reading">
          <Link
            href={articleHref(next)}
            className="group flex items-end justify-between gap-8 p-5 sm:p-8 lg:p-12"
          >
            <span>
              <Label tone="ink">Continue reading</Label>
              <span className="statement mt-8 block max-w-[20ch] text-[clamp(1.75rem,4.6vw,4.5rem)] leading-[0.98]">
                <span className="link-draw-group">{next.title}</span>
              </span>
            </span>
            <ArrowRight
              className="size-8 shrink-0 transition-transform duration-500 ease-expo group-hover:translate-x-2 sm:size-12"
              aria-hidden="true"
            />
          </Link>
        </Panel>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
