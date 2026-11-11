'use client';

import { useId } from 'react';
import type { Product, VariantSelection } from '@/lib/products';

type VariantSelectorProps = {
  variants: NonNullable<Product['variants']>;
  value: VariantSelection;
  onChange: (name: string, option: string) => void;
};

/**
 * One radio group per variant (e.g. Length, Curl), drawn as a row of square options. Native radio
 * inputs underneath, so arrow-key navigation, focus and screen-reader semantics come for free.
 */
export function VariantSelector({ variants, value, onChange }: VariantSelectorProps) {
  const baseId = useId();
  return (
    <div className="space-y-6">
      {variants.map((variant) => (
        <fieldset key={variant.name}>
          <legend className="mb-3 flex items-baseline gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.1em]">{variant.name}</span>
            <span className="label text-ink-soft">{value[variant.name]}</span>
          </legend>
          <div className="flex flex-wrap">
            {variant.options.map((option) => {
              const id = `${baseId}-${variant.name}-${option}`;
              return (
                <div key={option} className="-mr-px">
                  <input
                    id={id}
                    type="radio"
                    name={`${baseId}-${variant.name}`}
                    value={option}
                    checked={value[variant.name] === option}
                    onChange={() => onChange(variant.name, option)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={id}
                    className="flex h-12 min-w-16 cursor-pointer items-center justify-center border border-line bg-white px-5 text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-300 hover:border-ink hover:bg-mist peer-checked:relative peer-checked:z-10 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
                  >
                    {option}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
