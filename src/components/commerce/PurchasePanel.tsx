'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCheckout } from '@/hooks/use-checkout';
import { useCartStore } from '@/lib/cart-store';
import { defaultVariant, type Product, type VariantSelection } from '@/lib/products';
import { AddToBagButton } from './AddToBagButton';
import { VariantSelector } from './VariantSelector';

/** The interactive part of the product page: options, quantity, Add to bag, Buy now. */
export function PurchasePanel({ product }: { product: Product }) {
  const [variant, setVariant] = useState<VariantSelection | undefined>(() =>
    defaultVariant(product),
  );
  const [quantity, setQuantity] = useState(1);
  const { checkout, loading } = useCheckout();

  return (
    <div className="space-y-6">
      {product.variants && variant ? (
        <VariantSelector
          variants={product.variants}
          value={variant}
          onChange={(name, option) => setVariant((prev) => ({ ...prev, [name]: option }))}
        />
      ) : null}

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em]">Quantity</p>
        <div className="flex gap-2">
          <QuantityStepper value={quantity} onChange={setQuantity} label={product.name} />
          <AddToBagButton
            productId={product.id}
            variant={variant}
            quantity={quantity}
            size="lg"
            block
            className="!h-12 flex-1"
          />
        </div>
      </div>

      <Button
        variant="outline"
        size="lg"
        block
        loading={loading}
        onClick={() => {
          // "Buy now" puts this item in the bag and goes straight to the on-site checkout.
          useCartStore.getState().add({ id: product.id, quantity, variant });
          checkout();
        }}
      >
        Buy now
      </Button>
    </div>
  );
}
