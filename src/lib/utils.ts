/** Tiny class-name joiner (avoids a dependency for something this small). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Format integer cents as a USD string, e.g. 2400 → "$24" or 2450 → "$24.50". */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/** Clamp a number into [min, max]. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Zero-pad an index for the spec-sheet numbering: 3 → "03". */
export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
