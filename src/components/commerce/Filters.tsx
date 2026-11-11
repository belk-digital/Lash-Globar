'use client';

import { Check } from 'lucide-react';
import { PRICE_RANGES, STYLE_LABELS, type LashStyle } from '@/lib/products';
import type { PriceRangeId, ShopFilters } from '@/lib/shop-filters';
import { cn } from '@/lib/utils';

type FiltersProps = {
  filters: ShopFilters;
  onChange: (patch: Partial<ShopFilters>) => void;
  /** Prefix so ids stay unique when rendered twice (sidebar + drawer). */
  idPrefix: string;
  className?: string;
};

/** Toggle `value` in a list (immutably). */
function toggle<T extends string>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function CheckOption({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li>
      <label
        htmlFor={id}
        className="group flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem] sm:min-h-9"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            'flex size-[18px] shrink-0 items-center justify-center border border-ink bg-white transition-colors duration-300',
            'group-hover:bg-lavender peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink',
          )}
        >
          <Check
            className={cn(
              'size-3 text-white transition-opacity',
              checked ? 'opacity-100' : 'opacity-0',
            )}
            strokeWidth={3}
          />
        </span>
        <span>{label}</span>
      </label>
    </li>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-ink pt-4">
      <legend className="sr-only">{title}</legend>
      <p className="label mb-3 text-ink" aria-hidden="true">
        {title}
      </p>
      <ul>{children}</ul>
    </fieldset>
  );
}

/** Style and Price filter groups. Controlled - state lives in the URL. */
export function Filters({ filters, onChange, idPrefix, className }: FiltersProps) {
  return (
    <div className={cn('space-y-8', className)}>
      <Group title="Style">
        {(Object.keys(STYLE_LABELS) as LashStyle[]).map((style) => (
          <CheckOption
            key={style}
            id={`${idPrefix}-style-${style}`}
            label={STYLE_LABELS[style]}
            checked={filters.styles.includes(style)}
            onChange={() => onChange({ styles: toggle<LashStyle>(filters.styles, style) })}
          />
        ))}
      </Group>

      <Group title="Price">
        {PRICE_RANGES.map((range) => (
          <CheckOption
            key={range.id}
            id={`${idPrefix}-price-${range.id}`}
            label={range.label}
            checked={filters.prices.includes(range.id)}
            onChange={() => onChange({ prices: toggle<PriceRangeId>(filters.prices, range.id) })}
          />
        ))}
      </Group>
    </div>
  );
}
