import type { ReactNode } from 'react';
import { FadeIn } from '@/components/ui/FadeIn';
import { HairlineGrid } from '@/components/ui/HairlineGrid';
import type { Product } from '@/lib/products';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';

type ProductGridProps = {
  products: readonly Product[];
  /** Column classes. Default: 2 (mobile) → 3 (tablet) → 4 (desktop). */
  cols?: string;
  /** Preload the first N images (above the fold). */
  preloadCount?: number;
  sizes?: string;
  /** Draw no outer frame (when the grid sits inside a bordered panel that supplies it). */
  bare?: boolean;
  /** Insert an editorial cell after the Nth product; it spans two columns. */
  promo?: { after: number; node: ReactNode };
  className?: string;
};

/** Product cells divided by hairlines - a ruled sheet, not a gallery of floating cards. */
export function ProductGrid({
  products,
  cols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  preloadCount = 0,
  sizes,
  bare = false,
  promo,
  className,
}: ProductGridProps) {
  const items: ReactNode[] = [];
  products.forEach((product, i) => {
    items.push(
      <li key={product.id}>
        <FadeIn delay={(i % 4) * 0.05} y={16} className="h-full">
          <ProductCard product={product} preload={i < preloadCount} sizes={sizes} index={i} />
        </FadeIn>
      </li>,
    );
    if (promo && i === promo.after - 1) {
      items.push(
        <li key="promo" className="col-span-2 bg-mist">
          {promo.node}
        </li>,
      );
    }
  });

  return (
    <div className={cn(!bare && 'border border-line bg-white', className)}>
      <HairlineGrid className={cols}>{items}</HairlineGrid>
    </div>
  );
}
