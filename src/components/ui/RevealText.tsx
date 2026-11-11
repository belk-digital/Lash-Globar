'use client';

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, type ElementType } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

// Layout effects warn during SSR; fall back to a plain effect on the server.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type RevealTextProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Start as soon as the page loads instead of waiting to scroll into view. */
  immediate?: boolean;
};

/**
 * Headline reveal. The text is split into LINES (measured after layout, so it follows the real
 * wrapping at every breakpoint); each word rises from behind an overflow-hidden mask, staggered
 * word-by-word along a line and line-by-line down the block. Exposed to screen readers via a
 * single aria-label; respects prefers-reduced-motion (globals.css).
 */
export function RevealText({
  text,
  as = 'h2',
  className,
  delay = 0,
  immediate = false,
}: RevealTextProps) {
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const rootRef = useRef<HTMLElement | null>(null);
  const maskRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const inView = useInView(rootRef, { once: true, margin: '-6% 0px' });
  const show = immediate || inView;

  // Work out which visual line each word landed on, and its position within that line,
  // and hand both to CSS as custom properties (--line, --w).
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const els = maskRefs.current.filter((el): el is HTMLSpanElement => el !== null);
      const lineTops: number[] = [];
      const counts: number[] = [];
      for (const el of els) {
        const top = el.offsetTop;
        let idx = lineTops.findIndex((t) => Math.abs(t - top) < 6);
        if (idx === -1) {
          lineTops.push(top);
          counts.push(0);
          idx = lineTops.length - 1;
        }
        el.style.setProperty('--line', String(idx));
        el.style.setProperty('--w', String(counts[idx]++));
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    // Web fonts change glyph widths → re-measure once they're ready.
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [words]);

  const Tag = as as ElementType;

  return (
    <Tag ref={rootRef} className={className} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={i}>
          {/* The mask - padded so ascenders/descenders and accents are never clipped. */}
          <span
            ref={(el) => {
              maskRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="-my-[0.1em] inline-block overflow-hidden py-[0.1em] align-bottom"
          >
            <span
              className={cn(
                'reveal-word inline-block will-change-transform',
                show ? 'translate-y-0' : 'translate-y-[112%]',
              )}
              style={{
                transitionProperty: 'transform',
                transitionDuration: '1100ms',
                transitionTimingFunction: 'var(--ease-expo)',
                transitionDelay: `calc(var(--line, 0) * 0.14s + var(--w, 0) * 0.05s + ${delay}s)`,
              }}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
