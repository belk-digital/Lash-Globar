import { FadeIn } from '@/components/ui/FadeIn';
import { Label } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { RevealImage } from '@/components/ui/RevealImage';
import { RevealText } from '@/components/ui/RevealText';
import { IMAGES } from '@/lib/images';
import { NewsletterForm } from './NewsletterForm';

/** "Join the list": a lavender sign-up panel beside the petals photograph. */
export function NewsletterPanel() {
  const image = IMAGES.sections.newsletter;
  return (
    <div
      className="grid grid-cols-1 gap-frame lg:grid-cols-12"
      role="region"
      aria-label="Newsletter"
    >
      <Panel
        tone="lavender"
        className="flex min-h-[26rem] flex-col justify-between gap-14 p-5 sm:p-8 lg:col-span-7 lg:p-12"
      >
        <Label tone="ink">10 / Newsletter</Label>
        <div>
          <RevealText as="h2" text="Join the list" className="display text-display" />
          <FadeIn delay={0.2} y={16}>
            <p className="mb-8 mt-6 max-w-md text-lead">
              First looks, lash-care notes and 10% off your first order. Never more than a whisper
              in your inbox.
            </p>
            <NewsletterForm />
          </FadeIn>
        </div>
      </Panel>
      <RevealImage
        src={image.src}
        alt={image.alt}
        sizes="(min-width: 1025px) 40vw, 100vw"
        position={image.position}
        className="aspect-[4/3] lg:col-span-5 lg:aspect-auto"
      />
    </div>
  );
}
