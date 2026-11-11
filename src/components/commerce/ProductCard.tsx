import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Label';
import { Stars } from '@/components/ui/Stars';
import { hasVariants, productHref, type Product } from '@/lib/products';
import { cn, formatPrice, pad2 } from '@/lib/utils';
import { AddToBagButton } from './AddToBagButton';

type ProductCardProps = {
  product: Product;
  /** `sizes` hint for next/image - set per layout so we never download more than needed. */
  sizes?: string;
  /** Preload the image (above-the-fold only). */
  preload?: boolean;
  /** Shown top-right as a spec-sheet index ("01"). */
  index?: number;
  className?: string;
};

const DEFAULT_SIZES = '(min-width: 1280px) 24vw, (min-width: 641px) 33vw, 50vw';

/**
 * Product cell. A photograph on a mist ground, then a ruled caption: name, claim, price, rating.
 * On desktop an add-to-bag bar rises from the foot of the photograph on hover/focus; on touch the
 * button sits in the caption. Hover behaviour adapts to the data:
 *  - 2+ images → crossfade to the second photograph
 *  - 1 image   → a slow zoom instead (never a broken or empty swap)
 */
export function ProductCard({
  product,
  sizes = DEFAULT_SIZES,
  preload = false,
  index,
  className,
}: ProductCardProps) {
  const [primary, secondary] = product.images;
  const canSwap = Boolean(secondary);
  const onSale = product.compareAtPrice !== undefined && product.compareAtPrice > product.price;
  const options = hasVariants(product);

  return (
    <article className={cn('group/card relative flex h-full flex-col bg-white', className)}>
      <div className="group relative aspect-[4/5] overflow-hidden bg-mist">
        <Link
          href={productHref(product)}
          aria-label={`${product.name}, ${formatPrice(product.price)}`}
          className="absolute inset-0"
        >
          <span
            className={cn(
              'absolute inset-0 block transition-transform duration-[1400ms] ease-expo',
              canSwap ? 'group-hover:scale-[1.03]' : 'group-hover:scale-[1.06]',
            )}
          >
            <Image
              src={primary}
              alt={`${product.name}: ${product.tagline}`}
              fill
              sizes={sizes}
              preload={preload}
              className={cn(
                'object-cover transition-opacity duration-[900ms] ease-expo',
                canSwap && 'group-hover:opacity-0',
              )}
            />
            {canSwap ? (
              <Image
                src={secondary}
                alt=""
                fill
                sizes={sizes}
                className="object-cover opacity-0 transition-opacity duration-[900ms] ease-expo group-hover:opacity-100"
              />
            ) : null}
          </span>
        </Link>

        {product.badges?.[0] ? (
          <Tag tone="white" className="pointer-events-none absolute left-3 top-3">
            {product.badges[0]}
          </Tag>
        ) : null}
        {index !== undefined ? (
          <span className="label pointer-events-none absolute right-3 top-3 text-ink">
            {pad2(index + 1)}
          </span>
        ) : null}

        {/* Desktop quick-add: rises from the foot of the photograph */}
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full transition-transform duration-[700ms] ease-expo group-focus-within:translate-y-0 group-hover:translate-y-0 lg:block">
          {options ? (
            <Button href={productHref(product)} block className="!h-12">
              Choose options
            </Button>
          ) : (
            <AddToBagButton productId={product.id} block className="!h-12" />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 border-t border-line p-3 sm:gap-3 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h3 className="display text-[0.9375rem] leading-[1.1] tracking-[-0.01em] sm:text-base">
            <Link href={productHref(product)} className="link-draw">
              {product.name}
            </Link>
          </h3>
          <p className="shrink-0 text-sm tabular-nums">
            {onSale ? (
              <>
                <span className="sr-only">Now </span>
                <span className="font-bold">{formatPrice(product.price)}</span>{' '}
                <s className="text-ink-soft">
                  <span className="sr-only">Was </span>
                  {formatPrice(product.compareAtPrice!)}
                </s>
              </>
            ) : (
              <span className="font-bold">{formatPrice(product.price)}</span>
            )}
          </p>
        </div>
        <p className="text-[0.8125rem] leading-snug text-ink-soft">{product.tagline}</p>
        <Stars
          rating={product.rating}
          reviewCount={product.reviewCount}
          size="sm"
          labelClassName="hidden sm:inline"
        />

        {/* Touch / tablet: the button lives in the caption */}
        <div className="mt-auto pt-2 lg:hidden">
          {options ? (
            <Button href={productHref(product)} variant="outline" size="sm" block>
              Options
            </Button>
          ) : (
            <AddToBagButton productId={product.id} size="sm" block />
          )}
        </div>
      </div>
    </article>
  );
}
