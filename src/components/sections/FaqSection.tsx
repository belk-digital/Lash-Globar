import type { ReactNode } from 'react';
import { Accordion, type AccordionItem } from '@/components/ui/Accordion';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';
import { Label } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { RevealText } from '@/components/ui/RevealText';
import { faqJsonLd, type Faq } from '@/lib/faqs';
import { cn } from '@/lib/utils';

type FaqSectionProps = {
  items: readonly Faq[];
  /** Mono label, usually carrying the section index on the home page. */
  label?: string;
  title?: string;
  description?: ReactNode;
  /** Link out to the full FAQ page (hide it on the FAQ page itself). */
  showAllLink?: boolean;
  /** Emit FAQPage structured data for these questions (one block per page). */
  jsonLd?: boolean;
  /** Id of the question open on first render; `null` keeps every row closed. */
  defaultOpenId?: string | null;
  className?: string;
};

/**
 * Frequently asked questions as one ruled panel: a mist column with the heading and a way to
 * reach us, beside a hairline-divided accordion. Used on home, shop and product pages.
 */
export function FaqSection({
  items,
  label = 'FAQ',
  title = 'Good questions',
  description = 'Everything you might want to know about wearing, caring for and reusing your lashes.',
  showAllLink = true,
  jsonLd = true,
  defaultOpenId,
  className,
}: FaqSectionProps) {
  if (items.length === 0) return null;

  const rows: AccordionItem[] = items.map((item) => ({
    id: item.id,
    title: item.q,
    content: <p>{item.a}</p>,
  }));
  const open = defaultOpenId === undefined ? items[0].id : defaultOpenId;

  return (
    <Panel
      aria-label="Frequently asked questions"
      className={cn('grid grid-cols-1 lg:grid-cols-12', className)}
    >
      <div className="flex flex-col justify-between gap-12 border-b border-ink bg-mist p-5 sm:p-8 lg:col-span-4 lg:border-b-0 lg:border-r lg:p-10">
        <div>
          <Label tone="ink">{label}</Label>
          <RevealText
            as="h2"
            text={title}
            className="display mt-8 text-[clamp(2rem,9vw,3.5rem)] lg:mt-12 lg:text-[clamp(1.75rem,2.6vw,2.75rem)]"
          />
          <FadeIn delay={0.2} y={16}>
            <div className="mt-6 max-w-sm text-lead text-ink-soft">{description}</div>
          </FadeIn>
        </div>
        <FadeIn delay={0.3} y={12} className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <Button href="/contact" size="sm">
            Ask us
          </Button>
          {showAllLink ? <ArrowLink href="/faq">All questions</ArrowLink> : null}
        </FadeIn>
      </div>
      <div className="px-5 sm:px-8 lg:col-span-8 lg:px-12">
        <Accordion items={rows} size="lg" defaultOpen={open ? [open] : []} className="border-y-0" />
      </div>

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd(items)).replace(/</g, '\\u003c'),
          }}
        />
      ) : null}
    </Panel>
  );
}
