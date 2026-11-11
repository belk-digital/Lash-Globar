import { ArrowLink } from '@/components/ui/ArrowLink';
import { FadeIn } from '@/components/ui/FadeIn';
import { Label } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { RevealImage } from '@/components/ui/RevealImage';
import { RevealText } from '@/components/ui/RevealText';
import { IMAGES } from '@/lib/images';
import { ROUTES } from '@/lib/site';

/** "For everyone": a short statement panel, then the trio portrait at full width. */
export function StoryBlock() {
  const image = IMAGES.hero.trio;
  return (
    <>
      <Panel aria-label="Our story" className="p-5 sm:p-8 lg:p-12">
        <Label tone="ink">07 / Our story</Label>
        <RevealText
          as="h2"
          text="For everyone."
          className="display mt-10 text-display sm:mt-16 lg:mt-24"
        />
        <div className="mt-8 grid gap-6 border-t border-line pt-6 sm:mt-12 lg:grid-cols-12 lg:gap-12">
          <FadeIn delay={0.2} y={16} className="lg:col-span-5 lg:col-start-8">
            <p className="text-lead text-ink-soft">
              Every eye shape, every lash line, every occasion. We started Lash Globar because
              beautiful lashes shouldn’t be fussy, heavy or reserved for a salon chair.
            </p>
            <ArrowLink href={ROUTES.story} className="mt-4">
              Read our story
            </ArrowLink>
          </FadeIn>
        </div>
      </Panel>
      <RevealImage
        src={image.src}
        alt={image.alt}
        sizes="100vw"
        position={image.position}
        className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
      />
    </>
  );
}
