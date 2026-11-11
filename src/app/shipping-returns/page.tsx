import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqSection } from '@/components/sections/FaqSection';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { FAQ_SETS, faqsById } from '@/lib/faqs';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/site';
import { formatPrice, pad2 } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Shipping & returns',
  description:
    'Shipping times, rates and our 30-day returns policy for Lash Globar orders to the US, Canada, UK, Australia and India.',
  alternates: { canonical: '/shipping-returns' },
};

/**
 * PLACEHOLDER policy - keep in sync with src/app/api/checkout/route.ts (shipping rates and
 * delivery estimate) and review with your own legal/ops requirements before launch.
 */
const SECTIONS = [
  {
    id: 'shipping',
    title: 'Shipping',
    body: [
      'Orders are processed within 1–2 business days. You’ll receive an email with tracking as soon as your parcel is on its way.',
      `Standard shipping is a flat $5.99, and free on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}. Delivery typically takes 3–7 business days once shipped.`,
      'We ship to the United States, Canada, the United Kingdom, Australia and India. Duties and import taxes, where they apply, are the responsibility of the recipient.',
    ],
  },
  {
    id: 'returns',
    title: 'Returns',
    body: [
      'You can return unopened, unused products in their original packaging within 30 days of delivery for a full refund of the product price.',
      'For hygiene reasons we are unable to accept returns on opened lashes, adhesives, sealants, removers or tools that have been used.',
      'To start a return, contact us with your order number and we’ll send return instructions. Refunds are issued to your original payment method within 5–10 business days of us receiving the parcel.',
    ],
  },
  {
    id: 'damaged',
    title: 'Damaged or faulty items',
    body: [
      'If something arrives damaged or doesn’t perform as it should, email us within 14 days with your order number and a photo. We’ll replace it or refund you, whichever you prefer.',
    ],
  },
  {
    id: 'exchanges',
    title: 'Exchanges',
    body: [
      'Ordered the wrong length or curl? If the product is unopened, we’re happy to exchange it within 30 days. Just get in touch.',
    ],
  },
] as const;

export default function ShippingReturnsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Help"
        title="Shipping & returns"
        intro="Clear, simple and fair. Here’s how delivery and returns work at Lash Globar."
      />
      <Panel>
        {SECTIONS.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            className="grid scroll-mt-header gap-6 border-b border-line p-5 last:border-b-0 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-12"
          >
            <div className="lg:col-span-4">
              <p className="label text-ink-soft">{pad2(i + 1)}</p>
              <h2 className="display mt-4 text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[0.98] tracking-[-0.03em]">
                {section.title}
              </h2>
            </div>
            <div className="max-w-prose space-y-5 text-lead text-ink-soft lg:col-span-8">
              {section.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
        <p className="border-t border-ink p-5 text-ink-soft sm:px-8 lg:px-12">
          Questions? Visit our{' '}
          <Link href="/faq" className="link-draw text-ink">
            FAQ
          </Link>{' '}
          or{' '}
          <Link href="/contact" className="link-draw text-ink">
            get in touch
          </Link>
          .
        </p>
      </Panel>
      <FaqSection
        label="Delivery FAQ"
        title="Quick answers"
        description="The questions we hear most about delivery, tracking and returns."
        items={faqsById(FAQ_SETS.shipping)}
        showAllLink
      />
    </>
  );
}
