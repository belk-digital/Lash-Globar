/**
 * Tiny registry so any component (overlays, anchors) can pause or drive Lenis
 * without prop-drilling. Set by <SmoothScroll/>.
 */
import type Lenis from 'lenis';

let instance: Lenis | null = null;

export function setLenis(next: Lenis | null): void {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}
