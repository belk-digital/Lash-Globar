import type { Metadata } from 'next';
import Link from 'next/link';
import { Accordion, type AccordionItem } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { FAQS, faqJsonLd } from '@/lib/faqs';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about Lash Globar lashes: reuse, curls, adhesive, removal, shipping and returns.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  const items: AccordionItem[] = FAQS.map((item, i) => ({
    id: `faq-${i}`,
    title: item.q,
    content: <p>{item.a}</p>,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Help"
        meta={`${FAQS.length} questions`}
        title="Good questions"
        intro="Everything you might want to know about wearing, caring for and reusing your lashes."
      />
      <div className="grid gap-frame lg:grid-cols-12">
        <Panel className="px-5 sm:px-8 lg:col-span-8 lg:px-12">
          <Accordion items={items} size="lg" defaultOpen={['faq-0']} className="border-y-0" />
        </Panel>
        <aside className="lg:col-span-4">
          <Panel
            tone="lavender"
            className="p-5 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+var(--frame)*2)] lg:p-10"
          >
            <Label tone="ink">Still curious?</Label>
            <p className="statement mt-8 text-[clamp(1.5rem,2.4vw,2.25rem)]">
              We’re happy to help with anything.
            </p>
            <p className="mt-4">
              Order questions, product advice, or the perfect first set. We read every message.
            </p>
            <Button href="/contact" className="mt-8">
              Contact us
            </Button>
            <p className="label mt-8 text-ink">
              Delivery details?{' '}
              <Link href="/shipping-returns" className="link-draw">
                Shipping &amp; returns
              </Link>
            </p>
          </Panel>
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(FAQS)).replace(/</g, '\\u003c'),
        }}
      />
    </>
  );
}
