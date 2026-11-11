import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/sections/ContactForm';
import { FaqSection } from '@/components/sections/FaqSection';
import { Label } from '@/components/ui/Label';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { FAQ_SETS, faqsById } from '@/lib/faqs';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Lash Globar team: order questions, product advice and more.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Say hello"
        intro="Questions about an order, a curl, or the perfect first set? We read every message."
      />
      <div className="grid gap-frame lg:grid-cols-12">
        <Panel tone="mist" className="divide-y divide-line lg:col-span-4">
          <div className="p-5 sm:p-8">
            <Label>Email</Label>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="link-draw statement mt-4 inline-block break-all text-[clamp(1.25rem,2vw,1.75rem)]"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <div className="p-5 sm:p-8">
            <Label>Response time</Label>
            <p className="mt-4">We reply within one to two business days.</p>
          </div>
          <div className="p-5 sm:p-8">
            <Label>Quick answers</Label>
            <ul className="mt-3">
              <li>
                <Link href="/faq" className="link-draw inline-flex min-h-9 items-center">
                  Frequently asked questions
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-returns"
                  className="link-draw inline-flex min-h-9 items-center"
                >
                  Shipping &amp; returns
                </Link>
              </li>
            </ul>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-8 lg:col-span-8 lg:p-12">
          <ContactForm />
        </Panel>
      </div>
      <FaqSection
        label="Before you write"
        title="Might help"
        description="Your answer may already be here."
        items={faqsById(FAQ_SETS.contact)}
      />
    </>
  );
}
