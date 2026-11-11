'use client';

import { motion } from 'framer-motion';
import { EASE, VIEWPORT } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** A 1px rule that draws itself in from the left as it enters the viewport. */
export function Rule({
  className,
  strong = false,
  delay = 0,
}: {
  className?: string;
  /** Ink instead of the soft lavender hairline. */
  strong?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={cn('h-px w-full origin-left', strong ? 'bg-ink' : 'bg-line', className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.4, ease: EASE, delay }}
    />
  );
}
