'use client';

import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type AccordionProps = {
  items: readonly AccordionItem[];
  /** Ids open on first render. */
  defaultOpen?: readonly string[];
  /** Allow several panels open at once (default: one at a time). */
  multiple?: boolean;
  className?: string;
  /** `lg` = large sentence-case questions (FAQ) · `md` = compact uppercase rows (product page). */
  size?: 'md' | 'lg';
};

/**
 * Accessible disclosure list of hairline-divided rows. Headings are buttons with
 * aria-expanded/aria-controls; closed panels are `inert`. The plus is two drawn lines that
 * rotate into a minus. Height animates in pure CSS (grid-template-rows 0fr → 1fr).
 */
export function Accordion({
  items,
  defaultOpen = [],
  multiple = false,
  className,
  size = 'md',
}: AccordionProps) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set(defaultOpen));
  const baseId = useId();

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const buttonId = `${baseId}-${item.id}-button`;
        const panelId = `${baseId}-${item.id}-panel`;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={cn(
                  'group flex w-full items-center justify-between gap-6 text-left',
                  size === 'lg' ? 'min-h-20 py-6 sm:py-8' : 'min-h-14 py-4',
                )}
              >
                <span
                  className={cn(
                    size === 'lg'
                      ? 'statement text-[clamp(1.25rem,2.4vw,2.25rem)]'
                      : 'text-xs font-bold uppercase tracking-[0.1em]',
                  )}
                >
                  {item.title}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative flex shrink-0 items-center justify-center border border-line transition-colors duration-500 group-hover:border-ink',
                    size === 'lg' ? 'size-11' : 'size-8',
                    isOpen && 'border-ink bg-ink',
                  )}
                >
                  <span
                    className={cn(
                      'absolute h-px w-3.5 transition-colors',
                      isOpen ? 'bg-white' : 'bg-ink',
                    )}
                  />
                  <span
                    className={cn(
                      'absolute h-3.5 w-px transition-all duration-500 ease-expo',
                      isOpen ? 'rotate-90 bg-white' : 'bg-ink',
                    )}
                  />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={cn(
                'grid transition-[grid-template-rows] duration-500 ease-expo',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div
                  className={cn(
                    'pb-6 text-ink-soft',
                    size === 'lg'
                      ? 'max-w-3xl text-lead sm:pb-8'
                      : 'text-[0.9375rem] leading-relaxed',
                  )}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
