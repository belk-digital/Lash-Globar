'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StickyPanelProps = {
  children: ReactNode;
  className?: string;
  /** Gap kept below the navbar / above the viewport bottom, in px. */
  gap?: number;
};

/**
 * Desktop-only sticky column that is safe for panels taller than the viewport.
 *
 * A plain `position: sticky; top: X` pins the panel's TOP, so a tall panel's bottom
 * becomes unreachable until the column ends. Instead we set
 *   top = min(navHeight + gap, viewportHeight − panelHeight − gap)
 * so a short panel pins under the navbar, while a tall one scrolls naturally until its
 * bottom edge is visible and then pins there. It re-measures on resize and whenever the
 * panel's own height changes (e.g. an accordion opens). No inner scrollbars involved.
 */
export function StickyPanel({ children, className, gap = 24 }: StickyPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const navVar = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
      const navPx = navVar.endsWith('rem')
        ? parseFloat(navVar) * rootFont
        : parseFloat(navVar) || 72;
      const fits = window.innerHeight - el.offsetHeight - gap;
      el.style.top = `${Math.min(navPx + gap, fits)}px`;
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [gap]);

  // `lg:sticky` only - below 1025px the panel flows normally and `top` is ignored.
  return (
    <div ref={ref} className={cn('lg:sticky', className)}>
      {children}
    </div>
  );
}
