import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { articleHref, formatArticleDate, type Article } from '@/lib/articles';
import { cn } from '@/lib/utils';

type ArticleCardProps = {
  article: Article;
  sizes?: string;
  /** `large` = lead story (journal index): photograph beside the text on desktop. */
  size?: 'default' | 'large';
  className?: string;
};

/** Journal teaser: photograph, mono meta line, bold title, excerpt. A ruled cell, not a card. */
export function ArticleCard({
  article,
  sizes = '(min-width: 1025px) 33vw, (min-width: 641px) 50vw, 100vw',
  size = 'default',
  className,
}: ArticleCardProps) {
  const large = size === 'large';
  return (
    <article className={cn('group h-full', className)}>
      <Link
        href={articleHref(article)}
        className={cn('flex h-full flex-col', large && 'lg:grid lg:grid-cols-12')}
      >
        <div
          className={cn(
            'relative overflow-hidden bg-mist',
            large ? 'aspect-[4/3] lg:col-span-7 lg:aspect-auto lg:min-h-[28rem]' : 'aspect-[4/3]',
          )}
        >
          <Image
            src={article.cover.src}
            alt={article.cover.alt}
            fill
            sizes={large ? '(min-width: 1025px) 58vw, 100vw' : sizes}
            className="object-cover transition-transform duration-[1400ms] ease-expo group-hover:scale-[1.04]"
            style={{ objectPosition: article.cover.position }}
          />
        </div>
        <div
          className={cn(
            'flex flex-1 flex-col justify-between gap-8 border-t border-line p-5 sm:p-6',
            large && 'lg:col-span-5 lg:border-l lg:border-t-0 lg:p-10',
          )}
        >
          <div>
            <p className="label text-ink-soft">
              {article.category} · {article.readTime} min read
              <span className="sr-only"> · {formatArticleDate(article.date)}</span>
            </p>
            <h3
              className={cn(
                'statement mt-4',
                large ? 'text-[clamp(1.75rem,3vw,3rem)]' : 'text-[clamp(1.25rem,1.8vw,1.625rem)]',
              )}
            >
              {article.title}
            </h3>
            <p className="mt-4 text-[0.9375rem] text-ink-soft">{article.excerpt}</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em]">
            <span className="link-draw-group pb-0.5">Read article</span>
            <ArrowUpRight
              className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}
