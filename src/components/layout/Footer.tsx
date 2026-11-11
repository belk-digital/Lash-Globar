import Link from 'next/link';
import { Label, Tag } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { Wordmark } from './Wordmark';
import { FOOTER_COLUMNS, SITE_NAME, SOCIAL_LINKS } from '@/lib/site';

const PAYMENT_METHODS = ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'] as const;

const linkClass = 'link-draw inline-flex min-h-11 items-center text-[0.9375rem] sm:min-h-9';

/** The footer is a panel too: a brand cell, ruled link columns, and a base row. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <Panel as="footer" tone="mist" className="mt-frame">
      <div className="grid lg:grid-cols-12">
        <div className="border-b border-line p-5 sm:p-8 lg:col-span-4 lg:border-b-0 lg:border-r lg:p-12">
          <Wordmark imageClassName="h-12 sm:h-14 lg:h-16" className="-ml-1" />
          <p className="mt-6 max-w-xs text-ink-soft">
            Weightless, reusable, vegan and cruelty-free lashes, made to feel like nothing at all.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:col-span-8">
          {FOOTER_COLUMNS.map((column) => (
            <nav
              key={column.title}
              aria-label={column.title}
              className="border-b border-r border-line p-5 sm:p-8 lg:border-b-0 lg:p-10"
            >
              <h2 className="label mb-5 text-ink-soft">{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <nav
            aria-label="Social"
            className="border-b border-line p-5 sm:border-b-0 sm:p-8 lg:p-10"
          >
            <h2 className="label mb-5 text-ink-soft">Social</h2>
            <ul>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
          {PAYMENT_METHODS.map((method) => (
            <li key={method}>
              <Tag className="h-7 border-line text-ink-soft">{method}</Tag>
            </li>
          ))}
        </ul>
        <Label className="leading-relaxed">
          &copy; {year} {SITE_NAME}. All rights reserved.
        </Label>
      </div>
    </Panel>
  );
}
