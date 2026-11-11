import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';
import { Label } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { RevealImage } from '@/components/ui/RevealImage';
import { RevealText } from '@/components/ui/RevealText';
import { IMAGES } from '@/lib/images';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

/** Custom 404 - a type-led panel beside the petals photograph. */
export default function NotFound() {
  const image = IMAGES.sections.newsletter;
  return (
    <div className="grid gap-frame lg:grid-cols-12">
      <Panel
        tone="lavender"
        className="flex min-h-[28rem] flex-col justify-between gap-14 p-5 sm:p-8 lg:col-span-7 lg:min-h-[34rem] lg:p-12"
      >
        <Label tone="ink">Error 404</Label>
        <div>
          <RevealText as="h1" text="Page not found" immediate className="display text-display" />
          <FadeIn delay={0.3} y={16}>
            <p className="mt-6 max-w-md text-lead">
              The link may be old, or the page may have moved. Let’s get you back to something soft.
            </p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <Button href="/" size="lg">
                Back home
              </Button>
              <Button href="/shop" variant="white" size="lg">
                Shop all
              </Button>
            </div>
          </FadeIn>
        </div>
      </Panel>
      <RevealImage
        src={image.src}
        alt=""
        sizes="(min-width: 1025px) 40vw, 100vw"
        position={image.position}
        trigger="load"
        preload
        className="aspect-[4/3] lg:col-span-5 lg:aspect-auto"
      />
    </div>
  );
}
