'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { IMAGES } from '@/lib/images';
import { EASE } from '@/lib/motion';
import { CATEGORIES, getProduct, getProductsByCategory, productHref } from '@/lib/products';
import { formatPrice, pad2 } from '@/lib/utils';

/**
 * Shop mega-menu: every category as a photographed cell, plus the featured product.
 * Drops from the header with a shutter wipe; the cells then settle in one after another.
 */
export function MegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const feature = getProduct('the-volume-kit');

  return (
    <motion.div
      id="shop-menu"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.7, ease: EASE }}
      className="absolute inset-x-0 top-[calc(100%+var(--frame))] hidden border border-line bg-white lg:block"
    >
      <div className="grid grid-cols-12">
        <ul className="col-span-9 grid grid-cols-3 [&>li:nth-last-child(-n+3)]:border-b-0 [&>li]:border-b [&>li]:border-r [&>li]:border-line">
          {CATEGORIES.map((category, i) => (
            <motion.li
              key={category.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.12 + i * 0.05 }}
            >
              <Link
                href={`/shop/${category.slug}`}
                onClick={onNavigate}
                className="group flex items-stretch gap-0"
              >
                <span className="relative block aspect-[4/5] w-[38%] shrink-0 overflow-hidden bg-mist">
                  <Image
                    src={IMAGES.categoryIndex[category.slug].src}
                    alt=""
                    fill
                    sizes="140px"
                    className="object-cover transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.06]"
                    style={{ objectPosition: IMAGES.categoryIndex[category.slug].position }}
                  />
                </span>
                <span className="flex flex-1 flex-col justify-between p-5">
                  <span className="label text-ink-soft">{pad2(i + 1)}</span>
                  <span>
                    <span className="display block text-[1.0625rem] leading-[1.05] tracking-[-0.01em]">
                      {category.label}
                    </span>
                    <span className="label mt-2 flex items-center gap-2 text-ink-soft">
                      {getProductsByCategory(category.slug).length} products
                      <ArrowUpRight
                        className="size-3 -translate-x-1 opacity-0 transition-all duration-500 ease-expo group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>

        {feature ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="col-span-3 bg-lavender"
          >
            <Link
              href={productHref(feature)}
              onClick={onNavigate}
              className="group flex h-full flex-col p-5"
            >
              <span className="label">New</span>
              <span className="relative mt-4 block aspect-[4/5] overflow-hidden bg-mist">
                <Image
                  src={feature.images[0]}
                  alt=""
                  fill
                  sizes="260px"
                  className="object-cover transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.05]"
                />
              </span>
              <span className="mt-4 flex items-baseline justify-between gap-3">
                <span className="display text-[1.0625rem] leading-[1.05]">{feature.name}</span>
                <span className="text-sm font-bold">{formatPrice(feature.price)}</span>
              </span>
              <span className="link-draw-group mt-2 w-fit text-xs font-bold uppercase tracking-[0.1em]">
                Shop the kit
              </span>
            </Link>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
