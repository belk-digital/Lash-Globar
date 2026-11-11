'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { RevealImage } from '@/components/ui/RevealImage';
import { Stars } from '@/components/ui/Stars';
import { IMAGES } from '@/lib/images';
import { EASE } from '@/lib/motion';
import { pad2 } from '@/lib/utils';

/** PLACEHOLDER reviews - replace with real, attributed customer reviews before launch. */
const REVIEWS = [
  {
    quote:
      'I genuinely forgot I was wearing them. Cloud Wisp is the first strip that feels like my own lashes.',
    name: 'Amara K.',
    product: 'Cloud Wisp',
  },
  {
    quote:
      'The clusters took me two tries to learn and now I do a full set in ten minutes. They lasted three days.',
    name: 'Priya S.',
    product: 'Everyday Clusters',
  },
  {
    quote:
      'Sensitive eyes, never a problem with the Featherlight Bond. The remover is unbelievably gentle.',
    name: 'Jess M.',
    product: 'Featherlight Bond',
  },
  {
    quote: 'The Travel Case lives in my bag now. Twelve wears from one pair and counting.',
    name: 'Chloe R.',
    product: 'The Starter Kit',
  },
  {
    quote:
      'Night Out is dramatic without being heavy. Dinner to midnight, not a single lift at the corners.',
    name: 'Danielle T.',
    product: 'Night Out',
  },
] as const;

/**
 * Reviews as one large quote at a time - type-led, with a numbered pager. No autoplay: the reader
 * controls the pace. Each quote lifts out from behind a mask as it arrives.
 */
export function Reviews() {
  const [index, setIndex] = useState(0);
  const image = IMAGES.sections.lifestyle;
  const review = REVIEWS[index];
  const go = (delta: number) => setIndex((i) => (i + delta + REVIEWS.length) % REVIEWS.length);

  return (
    <div className="grid gap-frame lg:grid-cols-12" role="region" aria-label="Customer reviews">
      <RevealImage
        src={image.src}
        alt={image.alt}
        sizes="(min-width: 1025px) 32vw, 100vw"
        position={image.position}
        className="aspect-[4/5] lg:col-span-4 lg:aspect-auto lg:min-h-[34rem]"
      />

      <Panel
        tone="mist"
        className="flex flex-col justify-between gap-12 p-5 sm:p-8 lg:col-span-8 lg:p-12"
      >
        <div className="flex items-center justify-between gap-6">
          <Label tone="ink">06 / Reviews</Label>
          <Stars rating={5} size="sm" />
        </div>

        <div className="min-h-[14rem] overflow-hidden sm:min-h-[16rem]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={index}
              initial={{ y: '40%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-30%', opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <p className="statement text-[clamp(1.5rem,3.2vw,3.5rem)]">“{review.quote}”</p>
              <footer className="mt-8 flex items-baseline gap-4">
                <span className="text-xs font-bold uppercase tracking-[0.1em]">{review.name}</span>
                <Label>{review.product}</Label>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-ink pt-5">
          <Label tone="ink">
            {pad2(index + 1)} / {pad2(REVIEWS.length)}
          </Label>
          <div className="flex">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous review"
              className="flex size-12 items-center justify-center border border-ink transition-colors duration-300 hover:bg-lavender"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next review"
              className="-ml-px flex size-12 items-center justify-center border border-ink transition-colors duration-300 hover:bg-lavender"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
