'use client';

import { useSyncExternalStore } from 'react';

/**
 * True once the page has scrolled past `threshold` px.
 * Built on useSyncExternalStore so it's hydration-safe (server snapshot is always `false`).
 */
export function useScrolled(threshold = 80): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener('scroll', onChange, { passive: true });
      return () => window.removeEventListener('scroll', onChange);
    },
    () => window.scrollY > threshold,
    () => false,
  );
}
