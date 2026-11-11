'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';
import { useCartStore } from '@/lib/cart-store';
import type { VariantSelection } from '@/lib/products';

type AddToBagButtonProps = {
  productId: string;
  variant?: VariantSelection;
  quantity?: number;
  size?: ButtonSize;
  buttonVariant?: ButtonVariant;
  block?: boolean;
  className?: string;
  label?: string;
};

/** Adds to the bag, opens the drawer, and briefly confirms. */
export function AddToBagButton({
  productId,
  variant,
  quantity = 1,
  size = 'md',
  buttonVariant = 'solid',
  block,
  className,
  label = 'Add to bag',
}: AddToBagButtonProps) {
  const add = useCartStore((s) => s.add);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = () => {
    add({ id: productId, quantity, variant }, { openDrawer: true });
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Button
      size={size}
      variant={buttonVariant}
      block={block}
      className={className}
      onClick={onClick}
      aria-live="polite"
    >
      {added ? 'Added' : label}
    </Button>
  );
}
