import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Understated text link: uppercase, an underline that draws in, and an arrow that nudges. */
export function ArrowLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group inline-flex min-h-11 items-center gap-3 text-xs font-bold uppercase tracking-[0.1em]',
        className,
      )}
    >
      <span className="link-draw-group pb-0.5">{children}</span>
      <ArrowRight
        className="size-4 transition-transform duration-500 ease-expo group-hover:translate-x-1"
        aria-hidden="true"
      />
    </Link>
  );
}
