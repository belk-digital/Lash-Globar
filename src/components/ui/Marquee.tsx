import { cn } from '@/lib/utils';

type MarqueeProps = {
  items: readonly string[];
  className?: string;
};

/**
 * A utilitarian ticker: small mono caps separated by slashes. Two identical halves slide left
 * by exactly 50% for a seamless loop (pure CSS). Pauses on hover; static and scrollable for
 * reduced-motion users.
 */
export function Marquee({ items, className }: MarqueeProps) {
  // Repeat inside each half so very wide screens never show a gap.
  const half = [...items, ...items];

  return (
    <div
      className={cn('group relative overflow-hidden motion-reduce:overflow-x-auto', className)}
      role="group"
      aria-label={items.join(', ')}
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {half.map((phrase, i) => (
              <li
                key={`${phrase}-${i}`}
                className="label flex items-center gap-8 whitespace-nowrap pr-8 text-ink sm:gap-12 sm:pr-12"
              >
                <span>{phrase}</span>
                <span aria-hidden="true" className="text-ink-soft">
                  /
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
