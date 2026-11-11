import type { Metadata } from 'next';
import { EditorialBand } from '@/components/sections/EditorialBand';
import { FaqSection } from '@/components/sections/FaqSection';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';
import { HairlineGrid } from '@/components/ui/HairlineGrid';
import { Label } from '@/components/ui/Label';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { RevealImage } from '@/components/ui/RevealImage';
import { RevealText } from '@/components/ui/RevealText';
import { SectionHead } from '@/components/ui/SectionHead';
import { FAQ_SETS, faqsById } from '@/lib/faqs';
import { IMAGES } from '@/lib/images';
import { pad2 } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Our story',
  description:
    'Lash Globar began with a simple idea: beautiful lashes should feel like nothing at all. Meet the brand, our values and how we got here.',
  alternates: { canonical: '/our-story' },
};

/** PLACEHOLDER copy - replace with the founder's real story and milestones. */
const VALUES = [
  {
    title: 'Quiet confidence',
    body: 'We design for the person who wants to look like herself, on her best day. Nothing loud, nothing fussy.',
  },
  {
    title: 'Kind by design',
    body: 'Vegan, cruelty-free and latex-free, because beautiful should never come at someone else’s expense.',
  },
  {
    title: 'Made to last',
    body: 'Lashes you can wear twenty times beat lashes you throw away after one. Better for you, kinder to the planet.',
  },
  {
    title: 'Open to everyone',
    body: 'Every eye shape, every lash line, every level of experience. If you can hold a tweezer, you can do this.',
  },
] as const;

const TIMELINE = [
  {
    year: '2021',
    title: 'An idea at the kitchen table',
    body: 'Frustrated by heavy, flimsy lashes, we started sketching a band that disappears.',
  },
  {
    year: '2022',
    title: 'Two hundred prototypes',
    body: 'Fibres, curls, bands and adhesives: tested, trimmed and tested again.',
  },
  {
    year: '2023',
    title: 'Cloud Wisp launches',
    body: 'Our first strip lash finds its people. Word spreads, quietly.',
  },
  {
    year: '2025',
    title: 'Clusters & extension trays',
    body: 'Salon-grade control, brought home, and into artists’ kits.',
  },
  {
    year: '2026',
    title: 'The Volume Kit',
    body: 'Our fullest, most complete system yet, and the start of what comes next.',
  },
] as const;

export default function OurStoryPage() {
  const trio = IMAGES.hero.trio;
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="Beauty, made easy"
        intro="Lash Globar is a small, obsessive team making lashes for everyday life: quiet enough for a Tuesday, beautiful enough for the best night of the year."
      />

      <RevealImage
        src={trio.src}
        alt={trio.alt}
        sizes="100vw"
        position={trio.position}
        trigger="load"
        preload
        className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
      />

      {/* Founder story */}
      <Panel aria-label="Why we started" className="p-5 sm:p-8 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Label tone="ink" className="lg:col-span-4">
            Why we started
          </Label>
          <div className="space-y-8 lg:col-span-8">
            <FadeIn>
              <p className="statement text-[clamp(1.5rem,3vw,3rem)]">
                We started Lash Globar because every lash we tried felt like a compromise: too
                heavy, too dramatic, or too much work.
              </p>
            </FadeIn>
            <FadeIn delay={0.1} className="max-w-2xl space-y-6 text-lead text-ink-soft">
              <p>
                Our founder spent years on both sides of the salon chair, and kept coming back to
                the same question: why can’t beautiful lashes feel like nothing at all? So we began
                with the feeling and worked backwards: the lightest band we could make, the softest
                fibres, an adhesive that was kind to sensitive eyes.
              </p>
              <p>
                Today, every band is trimmed by hand and every curl is checked against the last. We
                would rather launch late than launch something that isn’t quite soft enough.
              </p>
            </FadeIn>
          </div>
        </div>
      </Panel>

      {/* Values */}
      <Panel aria-label="Our values">
        <div className="p-5 pb-8 sm:p-8 sm:pb-10 lg:p-12 lg:pb-12">
          <SectionHead label="What we believe" title="Four quiet values" />
        </div>
        <div className="border-t border-ink">
          <HairlineGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => (
              <li
                key={value.title}
                className="flex min-h-[18rem] flex-col justify-between p-5 sm:p-6 lg:p-8"
              >
                <RevealText
                  as="p"
                  text={pad2(i + 1)}
                  className="display text-title"
                  delay={i * 0.06}
                />
                <div className="mt-12">
                  <h3 className="text-xs font-bold uppercase tracking-[0.1em]">{value.title}</h3>
                  <p className="mt-3 max-w-xs text-[0.9375rem] text-ink-soft">{value.body}</p>
                </div>
              </li>
            ))}
          </HairlineGrid>
        </div>
      </Panel>

      <EditorialBand
        label="Craft"
        title="Made with patience."
        body="Every lash starts as a sketch and ends as something you forget you’re wearing. That takes time, and we take it."
        cta={{ label: 'Shop the collection', href: '/shop' }}
      />

      {/* Timeline */}
      <Panel aria-label="Timeline">
        <div className="p-5 pb-8 sm:p-8 sm:pb-10 lg:p-12 lg:pb-12">
          <SectionHead label="Timeline" title="A short history" />
        </div>
        <ol className="border-t border-ink">
          {TIMELINE.map((item, i) => (
            <li key={item.year} className="border-b border-line last:border-b-0">
              <FadeIn y={16} delay={0.03 * i}>
                <div className="grid gap-3 p-5 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:py-8">
                  <p className="display text-[clamp(2rem,4vw,3.75rem)] leading-none tracking-[-0.03em] lg:col-span-3">
                    {item.year}
                  </p>
                  <h3 className="statement text-[clamp(1.25rem,1.8vw,1.625rem)] lg:col-span-5">
                    {item.title}
                  </h3>
                  <p className="text-ink-soft lg:col-span-4">{item.body}</p>
                </div>
              </FadeIn>
            </li>
          ))}
        </ol>
      </Panel>

      <FaqSection
        label="Brand FAQ"
        title="Asked often"
        description="What we make, what it is made from, and how to wear it well."
        items={faqsById(FAQ_SETS.story)}
      />

      <Panel
        tone="lavender"
        className="flex flex-col items-start justify-between gap-10 p-5 sm:p-8 lg:flex-row lg:items-end lg:p-12"
      >
        <RevealText
          as="h2"
          text="Meet the collection"
          className="display max-w-[14ch] text-title"
        />
        <Button href="/shop" size="lg" variant="solid">
          Shop Lash Globar
        </Button>
      </Panel>
    </>
  );
}
