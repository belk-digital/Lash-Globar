'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { SectionHead } from '@/components/ui/SectionHead';
import { IMAGES } from '@/lib/images';
import { CATEGORIES, getProductsByCategory } from '@/lib/products';
import { cn, pad2 } from '@/lib/utils';

/**
 * Shop by category, as an index. Six oversized names in a ruled list; hovering (or focusing) a row
 * wipes that category's photograph into the sticky stage beside it. The list is the navigation -
 * the photograph only confirms it - so touch and keyboard users lose nothing (below 1025px each row
 * carries its own thumbnail instead).
 */
export function CategoryIndex() {
  const [active, setActive] = useState(0);
  // Keep the previous image visible underneath so each new one wipes OVER it.
  const [previous, setPrevious] = useState<number | null>(null);

  const activate = (index: number) => {
    if (index === active) return;
    setPrevious(active);
    setActive(index);
  };

  return (
    <Panel aria-label="Shop by category">
      <div className="grid lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="p-5 pb-8 sm:p-8 sm:pb-10 lg:p-12 lg:pb-12">
            <SectionHead label="01 / Shop by category" title="Find your lash" />
          </div>

          <ul className="border-t border-ink">
            {CATEGORIES.map((category, i) => {
              const image = IMAGES.categoryIndex[category.slug];
              const count = getProductsByCategory(category.slug).length;
              return (
                <li key={category.slug} className="border-b border-line last:border-b-0">
                  <Link
                    href={`/shop/${category.slug}`}
                    onMouseEnter={() => activate(i)}
                    onFocus={() => activate(i)}
                    className="group flex items-center gap-4 px-5 py-4 transition-colors duration-500 hover:bg-mist focus-visible:bg-mist sm:gap-6 sm:px-8 sm:py-5 lg:px-12 lg:py-6"
                  >
                    <span className="label w-6 shrink-0 text-ink-soft">{pad2(i + 1)}</span>
                    <span className="display flex-1 text-[clamp(1.5rem,3.6vw,3.75rem)] leading-[1] tracking-[-0.03em] transition-transform duration-700 ease-expo group-hover:translate-x-3">
                      {category.headline}
                    </span>
                    <span className="label hidden text-ink-soft sm:block">{count} products</span>
                    <span className="relative block aspect-[4/5] w-14 shrink-0 overflow-hidden bg-mist sm:w-16 lg:hidden">
                      <Image src={image.src} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <ArrowUpRight
                      className="hidden size-5 shrink-0 -translate-x-2 opacity-0 transition-all duration-500 ease-expo group-hover:translate-x-0 group-hover:opacity-100 lg:block"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sticky stage (desktop) */}
        <div className="relative hidden border-l border-line lg:col-span-5 lg:block">
          <div className="sticky top-[calc(var(--header-h)+var(--frame)*2)] h-[min(80svh,46rem)]">
            {CATEGORIES.map((category, i) => {
              const image = IMAGES.categoryIndex[category.slug];
              const isActive = i === active;
              const isPrevious = i === previous;
              return (
                <div
                  key={category.slug}
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 transition-[clip-path] duration-[900ms] ease-expo',
                    isActive ? 'z-20' : isPrevious ? 'z-10' : 'z-0',
                  )}
                  style={{
                    clipPath: isActive || isPrevious ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
                  }}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    sizes="40vw"
                    className="object-cover"
                    style={{ objectPosition: image.position }}
                  />
                </div>
              );
            })}
            <p className="label absolute bottom-0 left-0 z-30 bg-white px-4 py-3 text-ink">
              {pad2(active + 1)} / {pad2(CATEGORIES.length)} · {CATEGORIES[active].headline}
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}
