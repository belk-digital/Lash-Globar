'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAX_QTY } from '@/lib/site';

type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** Label used for screen readers, e.g. the product name. */
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
};

/** Square −/+ stepper with 44px-friendly hit areas. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = MAX_QTY,
  label = 'quantity',
  size = 'md',
  className,
}: QuantityStepperProps) {
  const btn = cn(
    'flex items-center justify-center text-ink transition-colors hover:bg-lavender disabled:opacity-30 disabled:hover:bg-transparent',
    size === 'md' ? 'size-12' : 'size-9',
  );
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className={cn('inline-flex items-center border border-ink bg-white', className)}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease quantity of ${label}`}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={cn('text-center text-sm font-bold tabular-nums', size === 'md' ? 'w-9' : 'w-7')}
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
