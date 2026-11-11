import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FadeIn } from './FadeIn';
import { Label } from './Label';
import { RevealText } from './RevealText';
import { Rule } from './Rule';

type SectionHeadProps = {
  /** Mono label above the title; usually carries the section's index, e.g. "02 - The Essentials". */
  label: string;
  title: string;
  /** Short supporting copy, set in the right-hand column on desktop. */
  description?: ReactNode;
  /** Optional link/button under the description. */
  action?: ReactNode;
  as?: 'h1' | 'h2';
  className?: string;
};

/**
 * Section header used inside panels: a drawn hairline, a mono label, and a big wide-caps title,
 * with an optional supporting paragraph set against it in a second column.
 */
export function SectionHead({
  label,
  title,
  description,
  action,
  as = 'h2',
  className,
}: SectionHeadProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <Rule strong />
      <FadeIn y={12} className="pt-4">
        <Label tone="ink">{label}</Label>
      </FadeIn>
      <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-12 lg:items-end lg:gap-12">
        <RevealText as={as} text={title} className="display text-title lg:col-span-8" />
        {description || action ? (
          <FadeIn delay={0.2} y={16} className="lg:col-span-4">
            {description ? <div className="text-lead text-ink-soft">{description}</div> : null}
            {action ? <div className={cn(Boolean(description) && 'mt-6')}>{action}</div> : null}
          </FadeIn>
        ) : null}
      </div>
    </div>
  );
}
