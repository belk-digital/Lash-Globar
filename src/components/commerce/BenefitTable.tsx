import { HairlineGrid } from '@/components/ui/HairlineGrid';
import { cn, pad2 } from '@/lib/utils';

const BENEFITS = [
  { title: 'Weightless', body: 'Feather-thin band, ultra-fine fibres' },
  { title: 'Reusable 20x', body: 'With proper care' },
  { title: 'Vegan & cruelty-free', body: 'Never tested on animals' },
  { title: 'Latex-free', body: 'Gentle, clear-drying bond' },
] as const;

/** The brand's four promises as a ruled 2×2 table (product page). */
export function BenefitTable({ className }: { className?: string }) {
  return (
    <div className={cn('border border-line', className)}>
      <HairlineGrid className="grid-cols-2">
        {BENEFITS.map((b, i) => (
          <li key={b.title} className="p-4">
            <span className="label text-ink-soft">{pad2(i + 1)}</span>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em]">{b.title}</p>
            <p className="mt-1 text-[0.8125rem] text-ink-soft">{b.body}</p>
          </li>
        ))}
      </HairlineGrid>
    </div>
  );
}
