'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE, REVEAL_DISTANCE, VIEWPORT } from '@/lib/motion';

type FadeInProps = {
  children: ReactNode;
  className?: string;
  /** Seconds. */
  delay?: number;
  /** Start offset in px (12–28 reads best on a ruled layout). */
  y?: number;
  duration?: number;
};

/** Fade + short rise when scrolled into view (once, 8% inset). Used for body copy and captions. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = REVEAL_DISTANCE,
  duration = 1,
}: FadeInProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
