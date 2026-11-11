import { ProductGrid } from '@/components/commerce/ProductGrid';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Panel } from '@/components/ui/Panel';
import { SectionHead } from '@/components/ui/SectionHead';
import { FEATURED_PRODUCTS } from '@/lib/products';

/** "The Essentials": four bestsellers as ruled product cells. */
export function FeaturedProducts() {
  return (
    <Panel aria-label="The essentials">
      <div className="p-5 pb-8 sm:p-8 sm:pb-10 lg:p-12 lg:pb-12">
        <SectionHead
          label="02 / The essentials"
          title="The essentials"
          description="Four quiet bestsellers: the lashes, bond and kit we reach for every week."
          action={<ArrowLink href="/shop">Shop all</ArrowLink>}
        />
      </div>
      <div className="border-t border-ink">
        <ProductGrid
          bare
          products={FEATURED_PRODUCTS}
          cols="grid-cols-2 lg:grid-cols-4"
          sizes="(min-width: 1025px) 24vw, 50vw"
        />
      </div>
    </Panel>
  );
}
