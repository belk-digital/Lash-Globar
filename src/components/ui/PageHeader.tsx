import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FadeIn } from './FadeIn';
import { Label } from './Label';
import { Panel } from './Panel';
import { RevealText } from './RevealText';

type PageHeaderProps = {
  /** Mono label, top-left (e.g. "Shop", "Journal"). */
  eyebrow?: string;
  /** Mono label, top-right (e.g. "14 products"). */
  meta?: ReactNode;
  title: string;
  /** Intro paragraph, set in the right-hand column beneath the title. */
  intro?: ReactNode;
  /** Optional extra content under the intro (links, breadcrumb, tabs). */
  children?: ReactNode;
  className?: string;
};

/**
 * Page title band: a panel with a mono label row, an oversized wide-caps title, and the intro set
 * in a second column against a hairline. On inner pages the type IS the hero.
 */
export function PageHeader({ eyebrow, meta, title, intro, children, className }: PageHeaderProps) {
  return (
    <Panel as="header" className={cn('p-5 sm:p-8 lg:p-12', className)}>
      <div className="flex items-start justify-between gap-6">
        {eyebrow ? <Label tone="ink">{eyebrow}</Label> : <span />}
        {meta ? <Label>{meta}</Label> : null}
      </div>
      <RevealText
        as="h1"
        text={title}
        immediate
        className="display mt-10 text-display sm:mt-16 lg:mt-24"
      />
      {intro || children ? (
        <FadeIn delay={0.25} y={16}>
          <div className="mt-8 grid gap-6 border-t border-line pt-6 sm:mt-12 lg:grid-cols-12 lg:gap-12">
            {intro ? (
              <div className="text-lead text-ink-soft lg:col-span-5 lg:col-start-8">{intro}</div>
            ) : null}
            {children ? (
              <div className={cn(intro ? 'lg:col-span-5 lg:col-start-8' : 'lg:col-span-12')}>
                {children}
              </div>
            ) : null}
          </div>
        </FadeIn>
      ) : null}
    </Panel>
  );
}
