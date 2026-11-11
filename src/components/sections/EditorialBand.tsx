import type { ReactNode } from 'react';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { FadeIn } from '@/components/ui/FadeIn';
import { Label } from '@/components/ui/Label';
import { ParallaxImage } from '@/components/ui/ParallaxImage';
import { IMAGES } from '@/lib/images';

type EditorialBandProps = {
  label: string;
  title: string;
  body: ReactNode;
  cta?: { label: string; href: string };
};

/**
 * A full-width photograph with a square caption plate. On large screens the plate is anchored to
 * the photograph's lower-left corner; below that it sits underneath, so it never covers the lashes.
 */
export function EditorialBand({ label, title, body, cta }: EditorialBandProps) {
  const image = IMAGES.sections.editorial;
  return (
    <section aria-label={label} className="relative">
      <ParallaxImage
        src={image.src}
        alt={image.alt}
        sizes="100vw"
        position={image.position}
        strength={9}
        className="aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-auto lg:h-[80svh] lg:min-h-[30rem]"
      />
      <FadeIn
        y={20}
        className="border border-t-0 border-line bg-white p-5 sm:p-8 lg:absolute lg:bottom-0 lg:left-0 lg:w-full lg:max-w-[34rem] lg:border-0 lg:p-10"
      >
        <Label tone="ink">{label}</Label>
        <h2 className="display mt-6 text-[clamp(1.75rem,3.2vw,3.25rem)] leading-[0.98] tracking-[-0.03em]">
          {title}
        </h2>
        <div className="mt-5 text-[0.9375rem] text-ink-soft">{body}</div>
        {cta ? (
          <ArrowLink href={cta.href} className="mt-3">
            {cta.label}
          </ArrowLink>
        ) : null}
      </FadeIn>
    </section>
  );
}
