import { ArrowLink } from '@/components/ui/ArrowLink';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';
import { Label, Tag } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { RevealImage } from '@/components/ui/RevealImage';
import { RevealText } from '@/components/ui/RevealText';
import { IMAGES } from '@/lib/images';

const CURLS = [
  { key: 'c', name: 'C curl', note: 'The natural lift', image: IMAGES.curl.c },
  { key: 'd', name: 'D curl', note: 'The dramatic open eye', image: IMAGES.curl.d },
] as const;

/**
 * Product discovery, not decoration: the single decision that changes how a lash looks, shown as
 * the two real eye close-ups side by side, with a route straight into the trays.
 */
export function CurlGuide() {
  return (
    <div className="grid gap-frame lg:grid-cols-12" aria-label="Find your curl" role="region">
      <Panel
        tone="mist"
        className="flex flex-col justify-between gap-12 p-5 sm:p-8 lg:col-span-5 lg:p-12"
      >
        <Label tone="ink">05 / Find your curl</Label>
        <div>
          <RevealText as="h2" text="C or D?" className="display text-display" />
          <FadeIn delay={0.2} y={16}>
            <p className="mt-8 max-w-md text-lead text-ink-soft">
              A C curl follows the arc of a natural lash. A D curl lifts sharply from the base for a
              wider, more dramatic eye. Not sure? Start with C. You can always layer a D at the
              outer corner.
            </p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
              <Button href="/products/pro-extension-trays" size="lg">
                Shop extension trays
              </Button>
              <ArrowLink href="/journal/how-to-choose-your-curl">Read the guide</ArrowLink>
            </div>
          </FadeIn>
        </div>
      </Panel>

      <ul className="grid grid-cols-2 gap-frame lg:col-span-7">
        {CURLS.map((curl, i) => (
          <li key={curl.key}>
            <figure className="relative max-lg:border max-lg:border-line max-lg:bg-white">
              <RevealImage
                src={curl.image.src}
                alt={curl.image.alt}
                sizes="(min-width: 1025px) 29vw, 46vw"
                position={`${curl.key === 'c' ? '0%' : '100%'} 0%`}
                delay={i * 0.12}
                className="aspect-[9/10]"
              />
              <figcaption className="flex items-center gap-2 p-3 sm:gap-3 lg:absolute lg:bottom-0 lg:left-0 lg:bg-white lg:py-3 lg:pl-4 lg:pr-5">
                <Tag tone="solid">{curl.key.toUpperCase()}</Tag>
                <span className="text-[0.6875rem] font-bold uppercase leading-tight tracking-[0.08em] sm:text-xs sm:tracking-[0.1em]">
                  {curl.note}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
