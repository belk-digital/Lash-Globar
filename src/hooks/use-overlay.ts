'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { getLenis } from '@/lib/lenis';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared behaviour for drawers, menus and modal overlays while `active`:
 *  - Escape closes
 *  - Tab / Shift+Tab are trapped inside `containerRef`
 *  - page scroll (native + Lenis) is locked
 *  - focus moves in on open and returns to the trigger on close
 */
export function useOverlay(
  active: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>,
): void {
  // Keep the latest onClose without re-running the effect on every render.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = (): HTMLElement[] =>
      container
        ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (el) => el.getClientRects().length > 0,
          )
        : [];

    // Move focus into the overlay once it has mounted/animated in.
    const focusTimer = window.setTimeout(() => {
      (getFocusable()[0] ?? container)?.focus();
    }, 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        container?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || !container?.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !container?.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    // Lock scroll (native + Lenis).
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    getLenis()?.stop();

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      html.style.overflow = previousOverflow;
      getLenis()?.start();
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef]);
}
