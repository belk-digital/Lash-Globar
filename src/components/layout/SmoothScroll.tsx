'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { getLenis, setLenis } from '@/lib/lenis';

/**
 * Lenis smooth scrolling, site-wide.
 *
 * Easy to disable:
 *  - set NEXT_PUBLIC_SMOOTH_SCROLL=false, or
 *  - remove <SmoothScroll/> from src/app/layout.tsx.
 * It is also skipped automatically for visitors who prefer reduced motion.
 */
const ENABLED = process.env.NEXT_PUBLIC_SMOOTH_SCROLL !== 'false';

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (!ENABLED) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      // Exponential ease-out: quick start, long calm tail.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true,
    });
    setLenis(lenis);

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // New page → start at the top (Lenis keeps its own scroll target).
  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
