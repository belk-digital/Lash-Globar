'use client';

import Image from 'next/image';
import Link from 'next/link';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCartStore, type CartLine } from '@/lib/cart-store';
import { productHref, variantLabel } from '@/lib/products';
import { cn, formatPrice } from '@/lib/utils';

type CartLineItemProps = {
  line: CartLine;
  /** `compact` for the slide-out drawer, `full` for the /cart page. */
  layout?: 'compact' | 'full';
  /** Called when the user follows the product link (e.g. to close the drawer). */
  onNavigate?: () => void;
};

/** One row in the bag: photograph, name, option, stepper, remove. */
export function CartLineItem({ line, layout = 'compact', onNavigate }: CartLineItemProps) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const { product, variant, quantity, key } = line;
  const full = layout === 'full';
  const variantText = variantLabel(variant);

  return (
    <li className={cn('flex gap-4 sm:gap-6', full ? 'p-5 sm:p-6' : 'p-5')}>
      <Link
        href={productHref(product)}
        onClick={onNavigate}
        className={cn(
          'relative shrink-0 overflow-hidden bg-mist',
          full ? 'aspect-[4/5] w-24 sm:w-36' : 'aspect-[4/5] w-20',
        )}
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.images[0]}
          alt=""
          fill
          sizes={full ? '(min-width: 641px) 144px, 96px' : '80px'}
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={productHref(product)}
              onClick={onNavigate}
              className={cn(
                'display link-draw block leading-[1.1] tracking-[-0.01em]',
                full ? 'text-base sm:text-xl' : 'text-[0.9375rem]',
              )}
            >
              {product.name}
            </Link>
            {variantText ? <p className="label mt-2 text-ink-soft">{variantText}</p> : null}
          </div>
          <p className="shrink-0 text-sm font-bold tabular-nums">
            {formatPrice(product.price * quantity)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <QuantityStepper
            size="sm"
            value={quantity}
            label={product.name}
            onChange={(next) => setQuantity(key, next)}
          />
          <button
            type="button"
            onClick={() => remove(key)}
            aria-label={`Remove ${product.name} from bag`}
            className="link-draw min-h-9 text-xs font-bold uppercase tracking-[0.1em]"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
