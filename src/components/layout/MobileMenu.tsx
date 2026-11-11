'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useOverlay } from '@/hooks/use-overlay';
import { EASE } from '@/lib/motion';
import { CATEGORIES } from '@/lib/products';
import { CONTACT_EMAIL, NAV_LINKS, ROUTES } from '@/lib/site';
import { pad2 } from '@/lib/utils';
import { Wordmark } from './Wordmark';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

const SECONDARY = [
  { label: 'FAQ', href: ROUTES.faq },
  { label: 'Shipping & returns', href: ROUTES.shipping },
  { label: 'Contact', href: ROUTES.contact },
] as const;

/**
 * Full-screen navigation for mobile + tablet. Big numbered links rise out of masks in sequence;
 * the categories are listed beneath. Escape closes, focus is trapped, scroll is locked.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useOverlay(open, onClose, ref);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={ref}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          tabIndex={-1}
          data-lenis-prevent
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white"
        >
          <div className="flex h-header shrink-0 items-stretch border-b border-line">
            <div className="flex items-center pl-4 sm:pl-6">
              <Wordmark onClick={onClose} />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="label ml-auto flex items-center border-l border-line px-6 text-ink transition-colors hover:bg-lavender"
            >
              Close
            </button>
          </div>

          <nav aria-label="Primary" className="flex-1 px-frame pt-8">
            <ul>
              {NAV_LINKS.map((link, i) => (
                <li key={link.label} className="overflow-hidden border-b border-line">
                  <motion.div
                    initial={{ y: '105%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.07 }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="display flex items-baseline gap-4 py-3 text-[clamp(2.25rem,12vw,5rem)] leading-none tracking-[-0.03em] transition-colors hover:bg-lavender"
                    >
                      <span className="label w-6 shrink-0 text-ink-soft">{pad2(i + 1)}</span>
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <p className="label text-ink-soft">Shop by category</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-6">
                {CATEGORIES.map((category) => (
                  <li key={category.slug} className="border-t border-line">
                    <Link
                      href={`/shop/${category.slug}`}
                      onClick={onClose}
                      className="flex min-h-12 items-center text-xs font-bold uppercase tracking-[0.1em]"
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="shrink-0 space-y-3 px-frame py-8">
            <ul className="flex flex-wrap gap-x-6">
              {SECONDARY.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="label inline-flex min-h-11 items-center text-ink-soft transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="label inline-flex min-h-11 items-center text-ink"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
