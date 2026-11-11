'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion';
import { Search } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useCartCount, useCartStore } from '@/lib/cart-store';
import { NAV_LINKS } from '@/lib/site';
import { cn } from '@/lib/utils';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { SearchOverlay } from './SearchOverlay';
import { Wordmark } from './Wordmark';

const cell =
  'flex items-center whitespace-nowrap border-l border-line px-4 text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-500 hover:bg-lavender focus-visible:bg-lavender sm:px-5';

/**
 * The header is a ruled bar, a panel like any other: logo cell, nav, utility cells separated by
 * hairlines. It tucks away when you scroll down and returns the moment you scroll up (so it never
 * covers content you're reading). "Shop" opens a category mega-menu on desktop; below 1025px
 * navigation moves into a full-screen menu.
 */
export function Navbar() {
  const pathname = usePathname();
  const count = useCartCount();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { toast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Hide on scroll down, reveal on scroll up.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (y > previous && y > 260) setHidden(true);
    else if (y < previous) setHidden(false);
  });

  // Publish the header state so sticky bars elsewhere (the shop category bar) can sit directly
  // beneath it while it shows, and move up when it hides.
  const headerShown = !hidden || mega;
  useEffect(() => {
    document.documentElement.dataset.header = headerShown ? 'shown' : 'hidden';
  }, [headerShown]);
  useEffect(
    () => () => {
      delete document.documentElement.dataset.header;
    },
    [],
  );

  // Escape closes the mega-menu.
  useEffect(() => {
    if (!mega) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMega(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mega]);

  return (
    <>
      <div
        className="sticky top-frame z-50"
        onMouseLeave={() => setMega(false)}
        onBlur={(event) => {
          // Close when keyboard focus leaves the header entirely.
          if (!event.currentTarget.contains(event.relatedTarget)) setMega(false);
        }}
      >
        <header
          className={cn(
            'relative border border-ink bg-white transition-transform duration-700 ease-expo',
            hidden && !mega && '-translate-y-[calc(100%+var(--frame)*2)]',
          )}
        >
          <div className="flex h-header items-stretch">
            <div className="flex items-center pl-4 pr-5 sm:pl-5 lg:w-64">
              <Wordmark />
            </div>

            <nav aria-label="Primary" className="hidden flex-1 lg:block">
              <ul className="flex h-full items-stretch">
                {NAV_LINKS.map((link) => {
                  const base = link.href.split('?')[0];
                  const current = !link.href.includes('?') && pathname === base;
                  const isShop = link.label === 'Shop';
                  const itemClass =
                    'flex h-full items-center border-l border-line px-6 text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-500 hover:bg-mist';
                  return (
                    <li key={link.label} className="h-full">
                      {isShop ? (
                        <button
                          type="button"
                          aria-expanded={mega}
                          aria-controls="shop-menu"
                          onMouseEnter={() => setMega(true)}
                          onClick={() => setMega((v) => !v)}
                          className={cn(itemClass, mega && 'bg-mist')}
                        >
                          <span className="inline-flex items-center gap-2">
                            {link.label}
                            <span
                              aria-hidden="true"
                              className={cn(
                                'block size-1.5 border-b border-r border-ink transition-transform duration-500 ease-expo',
                                mega
                                  ? '-translate-y-px rotate-[225deg]'
                                  : '-translate-y-0.5 rotate-45',
                              )}
                            />
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          aria-current={current ? 'page' : undefined}
                          onMouseEnter={() => setMega(false)}
                          className={itemClass}
                        >
                          <span
                            className="link-draw pb-0.5"
                            style={current ? { backgroundSize: '100% 1px' } : undefined}
                          >
                            {link.label}
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="ml-auto flex items-stretch">
              <button
                type="button"
                className={cn(cell, 'hidden lg:flex')}
                aria-haspopup="dialog"
                onClick={() => setSearchOpen(true)}
              >
                Search
              </button>
              <button
                type="button"
                className={cn(cell, 'w-12 justify-center px-0 lg:hidden')}
                aria-label="Search"
                aria-haspopup="dialog"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="size-4" />
              </button>
              <button
                type="button"
                className={cn(cell, 'hidden lg:flex')}
                onClick={() =>
                  toast({
                    title: 'Accounts are coming soon',
                    description: 'Checkout works as a guest. No account needed.',
                  })
                }
              >
                Account
              </button>
              <button
                type="button"
                className={cell}
                aria-haspopup="dialog"
                aria-label={
                  count > 0 ? `Open bag, ${count} item${count === 1 ? '' : 's'}` : 'Open bag'
                }
                onClick={openDrawer}
              >
                <span aria-hidden="true">Bag ({count})</span>
              </button>
              <button
                type="button"
                className={cn(cell, 'lg:hidden')}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen(true)}
              >
                Menu
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mega ? <MegaMenu onNavigate={() => setMega(false)} /> : null}
          </AnimatePresence>
        </header>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
