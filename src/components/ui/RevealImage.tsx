'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

type RevealImageProps = {
  src: string;
  alt: string;
  /** Accurate `sizes` - it drives download size. */
  sizes: string;
  /** CSS object-position from the IMAGES manifest. */
  position?: string;
  /** `load`: plays immediately (above the fold, CSS-only). `view`: plays when scrolled into view. */
  trigger?: 'load' | 'view';
  /** Seconds. */
  delay?: number;
  preload?: boolean;
  /** Wrapper classes - must size the frame (aspect ratio or height). */
  className?: string;
  /** Extra classes on the <img> (e.g. `group-hover:scale-[1.04]`). */
  imageClassName?: string;
};

/**
 * Image reveal: the frame opens like a shutter (clip-path wipe from the top) while the photograph
 * settles from a slight over-scale. CSS-driven, so above-the-fold images animate without waiting
 * for hydration (and a hero image is never withheld from LCP behind JS).
 */
export function RevealImage({
  src,
  alt,
  sizes,
  position = 'center center',
  trigger = 'view',
  delay = 0,
  preload = false,
  className,
  imageClassName,
}: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });
  const active = trigger === 'load' || inView;
  const style = { animationDelay: `${delay}s` };

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <div
        className={cn(
          'reveal-clip absolute inset-0',
          active ? 'animate-reveal-up' : '[clip-path:inset(0_0_100%_0)]',
        )}
        style={style}
      >
        <div
          className={cn('absolute inset-0', active ? 'animate-reveal-scale' : 'scale-[1.18]')}
          style={style}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            preload={preload}
            className={cn(
              'object-cover transition-transform duration-[1200ms] ease-expo',
              imageClassName,
            )}
            style={{ objectPosition: position }}
          />
        </div>
      </div>
    </div>
  );
}
