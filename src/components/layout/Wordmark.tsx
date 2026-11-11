import Image from 'next/image';
import Link from 'next/link';
import { IMAGES } from '@/lib/images';
import { cn } from '@/lib/utils';

type WordmarkProps = {
  className?: string;
  /** Tailwind height classes for the artwork (width follows the intrinsic aspect ratio). */
  imageClassName?: string;
  onClick?: () => void;
};

/**
 * The Lash Globar logo as a home link. Uses the compact lockup (swoosh + name) because the
 * tagline in the full lockup is an unreadable speck at header size.
 * Height drives size; width follows the logo's aspect ratio, so there's no layout shift.
 */
export function Wordmark({ className, imageClassName, onClick }: WordmarkProps) {
  const logo = IMAGES.logo.compact;
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Lash Globar, home"
      className={cn('inline-flex min-h-11 items-center', className)}
    >
      <Image
        src={logo.src}
        // The link carries the accessible name; the image is decorative within it.
        alt=""
        width={logo.width}
        height={logo.height}
        sizes="140px"
        loading="eager"
        className={cn('h-10 w-auto sm:h-11 lg:h-12', imageClassName)}
      />
    </Link>
  );
}
