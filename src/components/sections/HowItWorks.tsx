import { HairlineGrid } from '@/components/ui/HairlineGrid';
import { FadeIn } from '@/components/ui/FadeIn';
import { Panel } from '@/components/ui/Panel';
import { RevealImage } from '@/components/ui/RevealImage';
import { SectionHead } from '@/components/ui/SectionHead';
import { IMAGES } from '@/lib/images';
import { pad2 } from '@/lib/utils';

const STEPS = [
  {
    title: 'Prep',
    body: 'Cleanse the lash line and brush your natural lashes with a clean spoolie. A dry, oil-free base is the secret to a bond that lasts.',
  },
  {
    title: 'Place',
    body: 'Pick up a cluster with the applicator and set it just beneath your natural lashes, as close to the lash line as feels comfortable.',
  },
  {
    title: 'Press',
    body: 'Hold gently for five seconds while the adhesive sets. No tugging, no stinging, just a soft press with a fingertip.',
  },
  {
    title: 'Perfect',
    body: 'Layer lengths where you want more lift, comb through to blend, and head out the door. Remove gently at night, and wear them again.',
  },
] as const;

/** Four steps as four ruled cells - the photograph above, the instruction below. */
export function HowItWorks() {
  return (
    <Panel aria-label="How it works">
      <div className="p-5 pb-8 sm:p-8 sm:pb-10 lg:p-12 lg:pb-12">
        <SectionHead
          label="04 / How it works"
          title="Four steps. Zero fuss."
          description="From bare lashes to finished look in about ten minutes. No salon, no special skills."
        />
      </div>
      <div className="border-t border-ink">
        <HairlineGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const image = IMAGES.steps[i];
            return (
              <li key={step.title} className="group">
                <RevealImage
                  src={image.src}
                  alt={image.alt}
                  sizes="(min-width: 1025px) 24vw, (min-width: 641px) 48vw, 100vw"
                  position={image.position}
                  delay={(i % 4) * 0.08}
                  imageClassName="group-hover:scale-[1.04]"
                  className="aspect-[5/4] border-b border-line"
                />
                <FadeIn delay={0.15} y={12} className="p-5 sm:p-6 lg:p-8">
                  <div className="flex items-baseline justify-between">
                    <h3 className="display text-[clamp(1.5rem,2.6vw,2.5rem)] leading-none tracking-[-0.02em]">
                      {step.title}
                    </h3>
                    <span className="label text-ink-soft">{pad2(i + 1)} / 04</span>
                  </div>
                  <p className="mt-5 max-w-xs text-[0.9375rem] text-ink-soft">{step.body}</p>
                </FadeIn>
              </li>
            );
          })}
        </HairlineGrid>
      </div>
    </Panel>
  );
}
