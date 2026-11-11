import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A grid whose cells are divided by 1px hairlines - Typology-style. Every child gets a right and
 * bottom border; the outer edge's extra borders are clipped by the negative margin + overflow, so
 * it works for any column count, a ragged last row, and cells that span columns.
 *
 * Put it inside a bordered <Panel> (which supplies the top/left edge).
 */
export function HairlineGrid({
  children,
  className,
  as: Tag = 'ul',
}: {
  children: ReactNode;
  /** Column classes, e.g. `grid-cols-2 lg:grid-cols-4`. */
  className?: string;
  as?: 'ul' | 'ol' | 'div';
}) {
  return (
    <div className="overflow-hidden">
      <Tag
        className={cn(
          '-mb-px -mr-px grid [&>*]:border-b [&>*]:border-r [&>*]:border-line',
          className,
        )}
      >
        {children}
      </Tag>
    </div>
  );
}
