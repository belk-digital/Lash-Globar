'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

type ParallaxImageProps = {
  src: string;
  alt: string;
  /** `sizes` attribute for next/image - be accurate, it drives download size. */
  sizes: string;
  /** CSS object-position, from the IMAGES manifest. */
  position?: string;
  /** Parallax travel as a % of the frame height (brief: 8–12). */
  strength?: number;
  /** Preload (use only for the above-the-fold hero). */
  preload?: boolean;
  /** Wrapper classes - must give the frame a size (aspect ratio or height). */
  className?: string;
  imageClassName?: string;
};

/**
 * Image that drifts slowly against the scroll. The inner layer is oversized by
 * `strength`% top and bottom so the frame never shows an edge while it moves.
 * Falls back to a static image when the user prefers reduced motion.
 */
export function ParallaxImage({
  src,
  alt,
  sizes,
  position = 'center center',
  strength = 10,
  preload = false,
  className,
  imageClassName,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Overscan is `strength`% each side; translating by this much never exposes an edge.
  const shift = strength / (1 + (2 * strength) / 100);
  const y = useTransform(scrollYProgress, [0, 1], [`${-shift}%`, `${shift}%`]);

  const overscan = reduce ? 0 : strength;
  // Default to `relative`, but let callers pass absolute/fixed/sticky without a CSS-order clash.
  const positioned = /(^|\s)(absolute|fixed|sticky|relative)(\s|$)/.test(className ?? '');

  return (
    <div ref={ref} className={cn(!positioned && 'relative', 'overflow-hidden', className)}>
      <motion.div
        className="absolute inset-x-0"
        style={{ top: `-${overscan}%`, bottom: `-${overscan}%`, y: reduce ? 0 : y }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          className={cn('object-cover', imageClassName)}
          style={{ objectPosition: position }}
        />
      </motion.div>
    </div>
  );
}
