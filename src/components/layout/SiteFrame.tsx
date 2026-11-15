'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type Props = {
  announcement: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
  drawer: ReactNode;
  children: ReactNode;
};

/** Pages that stand alone: no announcement bar, header, footer or bag drawer. */
const BARE_PREFIXES = ['/pay/'];

/**
 * The page frame around every route. On the payment pages the announcement bar, header, footer and
 * bag drawer are left out, so the customer sees only the payment. (A layout does not re-render on
 * navigation, so the path is read here, in a Client Component, as the Next.js docs advise.)
 */
export function SiteFrame({ announcement, navbar, footer, drawer, children }: Props) {
  const pathname = usePathname() ?? '';
  const bare = BARE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (bare) {
    return (
      <div className="mx-auto w-full max-w-frame p-frame">
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </div>
    );
  }

  return (
    <>
      {announcement}

      {/* The canvas. Everything below is a panel inset by --frame, separated by the same gap. */}
      <div className="mx-auto w-full max-w-frame p-frame">
        {navbar}
        <main id="main" tabIndex={-1} className="pt-frame outline-none">
          {children}
        </main>
        {footer}
      </div>

      {drawer}
    </>
  );
}
