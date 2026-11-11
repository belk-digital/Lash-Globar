'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type ProductGalleryProps = {
  images: readonly string[];
  name: string;
};

/**
 * Product photography as ruled cells.
 *  - Desktop (≥1025px): the images stack edge to edge, divided by hairlines.
 *  - Mobile / tablet: a swipeable scroll-snap strip with a segmented position indicator.
 * Same markup both ways - only the layout classes change.
 */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const scroller = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const multiple = images.length > 1;

  const onScroll = () => {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const goTo = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="border border-line bg-white">
      <ul
        ref={scroller}
        onScroll={onScroll}
        aria-label={`${name} images`}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto lg:block lg:overflow-visible"
      >
        {images.map((src, i) => (
          <li
            key={src}
            className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-mist lg:border-b lg:border-line lg:last:border-b-0"
          >
            <Image
              src={src}
              alt={multiple ? `${name}, image ${i + 1} of ${images.length}` : name}
              fill
              sizes="(min-width: 1025px) 58vw, 100vw"
              preload={i === 0}
              className="object-cover"
            />
          </li>
        ))}
      </ul>

      {multiple ? (
        <div className="flex border-t border-line lg:hidden" role="group" aria-label="Choose image">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className="group flex h-11 flex-1 items-center justify-center"
            >
              <span
                className={cn(
                  'block h-[3px] w-full transition-colors duration-500',
                  i === index ? 'bg-ink' : 'bg-line group-hover:bg-lavender',
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
