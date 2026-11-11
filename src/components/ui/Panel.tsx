import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PanelTone = 'white' | 'mist' | 'lavender' | 'ink' | 'bare';

type PanelProps<T extends ElementType> = {
  as?: T;
  tone?: PanelTone;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

const TONES: Record<PanelTone, string> = {
  white: 'bg-white border border-line',
  mist: 'bg-mist border border-line',
  lavender: 'bg-lavender',
  ink: 'bg-ink text-white',
  bare: '',
};

/**
 * A panel: the unit of the layout. Pages are a stack of rectangles sitting on the white canvas,
 * separated by the same `--frame` gap. Square corners, 1px hairlines, flat fills - no shadows.
 */
export function Panel<T extends ElementType = 'section'>({
  as,
  tone = 'white',
  className,
  children,
  ...rest
}: PanelProps<T>) {
  const Tag = (as ?? 'section') as ElementType;
  return (
    <Tag className={cn('relative', TONES[tone], className)} {...rest}>
      {children}
    </Tag>
  );
}
