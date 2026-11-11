import { FadeIn } from '@/components/ui/FadeIn';
import { Label } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { RevealText } from '@/components/ui/RevealText';
import { ScrollFillText } from '@/components/ui/ScrollFillText';

const SPECS = [
  {
    figure: '20×',
    label: 'Reusable',
    body: 'Up to twenty wears from a single pair, with proper care.',
  },
  {
    figure: '100%',
    label: 'Vegan & cruelty-free',
    body: 'Synthetic fibres, never mink. Never tested on animals.',
  },
  { figure: '0%', label: 'Latex', body: 'Every adhesive is latex-free, clear-drying and gentle.' },
  {
    figure: 'Pro',
    label: 'Salon-grade',
    body: 'Extension trays built for artists and the particular.',
  },
] as const;

/**
 * The brand promise: one big sentence whose words ink in as you scroll, set on a lavender field,
 * with the four hard facts underneath as a ruled spec table.
 */
export function Statement() {
  return (
    <Panel tone="lavender" aria-label="Our promise">
      <div className="p-5 pb-14 sm:p-8 sm:pb-20 lg:p-12 lg:pb-28">
        <Label tone="ink">03 / The promise</Label>
        <ScrollFillText
          text="Designed for everyday wear. Engineered to disappear."
          className="display mt-10 max-w-[22ch] text-title sm:mt-16 lg:mt-24"
        />
      </div>

      <ul className="grid border-t border-ink sm:grid-cols-2 lg:grid-cols-4">
        {SPECS.map((spec, i) => (
          <li
            key={spec.label}
            className="border-b border-ink/25 p-5 sm:p-8 lg:border-b-0 lg:border-r lg:p-10 lg:last:border-r-0"
          >
            <RevealText as="p" text={spec.figure} className="display text-title" delay={i * 0.08} />
            <FadeIn delay={0.2 + i * 0.08} y={12}>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.1em]">{spec.label}</p>
              <p className="mt-2 max-w-[22ch] text-[0.9375rem]">{spec.body}</p>
            </FadeIn>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
