import type { Config } from 'tailwindcss';

/**
 * Lash Globar design tokens - "composed canvas".
 * A white canvas; panels in mist (#F7F4FB) and lavender (#D4C4EC); ink pulled from the logo itself.
 * Corners are square. Hex values are mirrored as CSS variables in src/app/globals.css.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    // Mobile ≤640 (base) · Tablet 641–1024 (sm, md) · Desktop >1024 (lg+)
    screens: {
      sm: '641px',
      md: '768px',
      lg: '1025px',
      xl: '1280px',
      '2xl': '1536px',
    },
    // The brand is square. The only circles are the cart-count badge and radio dots.
    borderRadius: {
      none: '0',
      DEFAULT: '0',
      full: '9999px',
    },
    extend: {
      colors: {
        ink: { DEFAULT: '#2C142C', soft: '#6B5F73' }, // soft = secondary text, AA on white + mist
        mist: '#F7F4FB',
        lavender: '#D4C4EC',
        line: '#E2D9EE',
      },
      fontFamily: {
        // One family, two voices: wide + heavy for display, normal width for text (see globals.css).
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        display: ['clamp(2.5rem, 7.2vw, 9rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        title: ['clamp(2rem, 4.6vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.025em' }],
        heading: ['clamp(1.25rem, 2vw, 2rem)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        lead: ['clamp(1.0625rem, 1.3vw, 1.25rem)', { lineHeight: '1.5' }],
      },
      maxWidth: {
        frame: '2000px',
        prose: '680px',
      },
      spacing: {
        frame: 'var(--frame)',
        header: 'var(--header-h)',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'reveal-up': {
          from: { clipPath: 'inset(0 0 100% 0)' },
          to: { clipPath: 'inset(0 0 0% 0)' },
        },
        'reveal-scale': { from: { transform: 'scale(1.18)' }, to: { transform: 'scale(1)' } },
        'page-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 44s linear infinite',
        'reveal-up': 'reveal-up 1.3s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'reveal-scale': 'reveal-scale 1.6s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'page-in': 'page-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) backwards',
      },
    },
  },
  plugins: [],
};

export default config;
