'use client';

import { useMemo, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

type ScrollFillTextProps = {
  text: string;
  className?: string;
  as?: 'h2' | 'p' | 'div';
};

/**
 * A statement whose words "ink in" as you scroll: each word moves from a faint tint to full
 * ink in sequence, driven by scroll position (scrubbed - it reverses when you scroll back up).
 * Used once, for the brand promise. Static for reduced-motion users.
 */
export function ScrollFillText({ text, className, as: Tag = 'h2' }: ScrollFillTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.55'] });

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((word, i) => (
        <Word
          key={i}
          word={word}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          still={Boolean(reduce)}
          last={i === words.length - 1}
        />
      ))}
    </Tag>
  );
}

function Word({
  word,
  progress,
  range,
  still,
  last,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  still: boolean;
  last: boolean;
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <>
      <motion.span
        aria-hidden="true"
        className={cn('inline-block')}
        style={{ opacity: still ? 1 : opacity }}
      >
        {word}
      </motion.span>
      {last ? null : ' '}
    </>
  );
}
