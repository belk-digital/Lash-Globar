import Link from 'next/link';

/** Thin lavender strip above the canvas. Two messages (one on phones), no animation. */
export function AnnouncementBar() {
  return (
    <div className="bg-lavender text-ink">
      <p className="label mx-auto flex h-9 max-w-frame items-center justify-center gap-4 px-frame text-center">
        <span>Free shipping over $60</span>
        <span aria-hidden="true" className="hidden sm:inline">
          /
        </span>
        <span className="hidden sm:inline">New:</span>
        <Link
          href="/products/the-volume-kit"
          className="link-draw hidden h-9 items-center font-medium sm:inline-flex"
        >
          The Volume Kit
        </Link>
      </p>
    </div>
  );
}
