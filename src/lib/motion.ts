/** Shared motion constants so every reveal on the site feels like the same hand. */

/** Expo-out: fast departure, long calm settle. Matches --ease-expo in globals.css. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Whole-site viewport settings for `whileInView` reveals: once, 8% inset. */
export const VIEWPORT = { once: true, margin: '-8%' } as const;

/** Default rise distance (px) for fade-up reveals. */
export const REVEAL_DISTANCE = 24;
