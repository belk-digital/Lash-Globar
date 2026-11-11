import { Star } from 'lucide-react';
import { clamp, cn } from '@/lib/utils';

type StarsProps = {
  rating: number;
  /** When provided, shows "4.8 (412)" after the stars. */
  reviewCount?: number;
  size?: 'sm' | 'md';
  className?: string;
  /** Extra classes for the numeric label (e.g. hide it on small screens). */
  labelClassName?: string;
};

/** Five ink stars with fractional fill (4.8 fills the last star 80%). */
export function Stars({ rating, reviewCount, size = 'md', className, labelClassName }: StarsProps) {
  const dim = size === 'sm' ? 'size-3' : 'size-3.5';
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5`}
        className="flex items-center gap-px"
      >
        {Array.from({ length: 5 }, (_, i) => {
          const fill = clamp(rating - i, 0, 1) * 100;
          return (
            <span key={i} className="relative inline-block" aria-hidden="true">
              <Star className={cn(dim, 'text-lavender')} strokeWidth={1.5} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
                <Star className={cn(dim, 'fill-ink text-ink')} strokeWidth={1.5} />
              </span>
            </span>
          );
        })}
      </span>
      {reviewCount !== undefined ? (
        <span className={cn('label whitespace-nowrap text-ink-soft', labelClassName)}>
          {rating.toFixed(1)} ({reviewCount.toLocaleString('en-US')})
        </span>
      ) : null}
    </div>
  );
}
