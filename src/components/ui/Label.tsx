import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Spec-sheet micro label: DM Mono, 11px, uppercase, tracked. */
export function Label({
  children,
  className,
  as: Tag = 'p',
  tone = 'soft',
}: {
  children: ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div';
  /** `soft` = secondary text · `ink` = full strength. */
  tone?: 'soft' | 'ink';
}) {
  return (
    <Tag className={cn('label', tone === 'soft' ? 'text-ink-soft' : 'text-ink', className)}>
      {children}
    </Tag>
  );
}

/** A boxed label (badge): hairline border, no fill unless asked. Square. */
export function Tag({
  children,
  className,
  tone = 'outline',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'outline' | 'solid' | 'lavender' | 'white';
}) {
  return (
    <span
      className={cn(
        'label inline-flex h-6 items-center px-2',
        tone === 'outline' && 'border border-ink text-ink',
        tone === 'solid' && 'bg-ink text-white',
        tone === 'lavender' && 'bg-lavender text-ink',
        tone === 'white' && 'bg-white text-ink',
        className,
      )}
    >
      {children}
    </span>
  );
}
