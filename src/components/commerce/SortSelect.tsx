'use client';

import { ChevronDown } from 'lucide-react';
import { SORT_OPTIONS, type SortKey } from '@/lib/products';
import { cn } from '@/lib/utils';

type SortSelectProps = {
  value: SortKey;
  onChange: (value: SortKey) => void;
  className?: string;
};

/** Native <select> (best accessibility + mobile pickers), drawn as a square control. */
export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <label htmlFor="shop-sort" className="sr-only">
        Sort products
      </label>
      <select
        id="shop-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as SortKey)}
        className="h-10 cursor-pointer appearance-none border border-ink bg-white py-2 pl-4 pr-10 text-xs font-bold uppercase tracking-[0.08em] transition-colors hover:bg-mist"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4" aria-hidden="true" />
    </div>
  );
}
