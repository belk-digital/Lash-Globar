/**
 * Image manifest - the single source of truth for every image path on the site.
 *
 * Rules:
 *  - Components import from `IMAGES`; they never hardcode `/images/...` paths.
 *  - Originals are untouched PNGs in /public/images (only the Tutorial and Collage
 *    composites were cropped - see scripts/crop-images.mjs).
 *  - `position` is the CSS `object-position` chosen so eyes / faces / products are
 *    never cropped out on mobile (portraits default to `center 30%`).
 */

import type { Category } from './products';

export type ImageRef = {
  /** Public URL path, e.g. `/images/hero/hero-main.png` */
  readonly src: string;
  /** Descriptive alt text (decorative uses pass `alt=""` at the call site). */
  readonly alt: string;
  /** CSS object-position that keeps the subject in frame. */
  readonly position: string;
  /** Natural pixel size - lets us derive aspect ratios without layout shift. */
  readonly width: number;
  readonly height: number;
};

const ref = (
  src: string,
  alt: string,
  width: number,
  height: number,
  position = 'center center',
): ImageRef => ({ src, alt, width, height, position });

// ---- Raw files (named once, reused everywhere) -----------------------------
const FILES = {
  // Logo variants derived from /images/lash_globar_logo.webp by scripts/make-logo-variants.mjs
  logoPrimary: '/images/logo/logo-primary.webp',
  logoCompact: '/images/logo/logo-compact.webp',
  heroMain: '/images/hero/hero-main.png',
  heroTrio: '/images/hero/hero-trio.png',
  categoryStrip: '/images/sections/category-strip-lashes.png',
  categoryExtensions: '/images/sections/category-extensions.png',
  stripLashCase: '/images/products/strip-lash-case.png',
  clusterTray: '/images/products/cluster-tray.png',
  adhesiveBottle: '/images/products/adhesive-bottle.png',
  applicator: '/images/products/applicator.png',
  kitFlatlay: '/images/products/kit-flatlay.png',
  travelCase: '/images/products/travel-case.png',
  editorialChiffon: '/images/sections/editorial-chiffon.png',
  lifestyleCafe: '/images/sections/lifestyle-cafe.png',
  newsletterPetals: '/images/sections/newsletter-petals.png',
  step1: '/images/sections/steps/step-1.png',
  step2: '/images/sections/steps/step-2.png',
  step3: '/images/sections/steps/step-3.png',
  step4: '/images/sections/steps/step-4.png',
  journal1: '/images/journal/journal-1.png',
  journal2: '/images/journal/journal-2.png',
  journal3: '/images/journal/journal-3.png',
} as const;

/** Every product slug - keeps the `products` map exhaustive and typo-proof. */
export type ProductSlug =
  | 'cloud-wisp'
  | 'soft-volume'
  | 'night-out'
  | 'everyday-clusters'
  | 'volume-clusters'
  | 'pro-extension-trays'
  | 'featherlight-bond'
  | 'seal-and-hold'
  | 'gentle-remover'
  | 'precision-applicator'
  | 'lash-lift-comb'
  | 'the-starter-kit'
  | 'the-volume-kit'
  | 'travel-case';

// Products share imagery by type. Types with a second distinct photo get a
// hover-swap; single-image types get a graceful zoom instead (see ProductCard).
const STRIP = [FILES.stripLashCase, FILES.categoryStrip] as const;
const CLUSTERS = [FILES.clusterTray, FILES.categoryExtensions] as const;
const ADHESIVE = [FILES.adhesiveBottle] as const;
const TOOL = [FILES.applicator] as const;
const KIT = [FILES.kitFlatlay] as const;
const TRAVEL = [FILES.travelCase] as const;

export const IMAGES = {
  /**
   * Brand logo (dark aubergine on transparent - made for the white canvas). Derived from the
   * supplied artwork by scripts/make-logo-variants.mjs; a compact version (tagline removed)
   * stays legible at header size.
   */
  logo: {
    /** Full lockup: swoosh + LASH GLOBAR + LASH & EXTENSIONS. */
    primary: ref(FILES.logoPrimary, 'Lash Globar, Lash & Extensions', 1524, 694),
    /** Swoosh + LASH GLOBAR (no tagline) - header, menu, footer. */
    compact: ref(FILES.logoCompact, 'Lash Globar', 1524, 584),
  },

  hero: {
    // Face sits on the LEFT, empty lavender on the RIGHT → headline goes right.
    // The closed eye + lashes sit at ~24% / 55%, so mobile keeps that in frame.
    main: ref(
      FILES.heroMain,
      'Close-up of a closed eye wearing soft, feathery lashes against a lavender backdrop',
      1672,
      941,
      '24% 55%',
    ),
    trio: ref(
      FILES.heroTrio,
      'Three friends laughing together in lavender knitwear',
      1536,
      1024,
      'center 30%',
    ),
  },

  /**
   * One distinct photograph per category - drives the category index and the shop mega-menu.
   * (Strip + clusters reuse the macro lash photography; the rest are product compositions.)
   */
  categoryIndex: {
    'strip-lashes': ref(
      FILES.categoryStrip,
      'A pair of wispy strip lashes on lavender marble',
      1086,
      1448,
      'center 58%',
    ),
    clusters: ref(
      FILES.categoryExtensions,
      'Lash clusters on a curved glass tray',
      1086,
      1448,
      'center 50%',
    ),
    extensions: ref(
      FILES.clusterTray,
      'A tray of professional extension fans arranged by length',
      1122,
      1402,
      'center 50%',
    ),
    adhesives: ref(
      FILES.adhesiveBottle,
      'A frosted adhesive bottle on a lavender plinth',
      1122,
      1402,
      'center 50%',
    ),
    tools: ref(
      FILES.applicator,
      'A rose-gold precision applicator on lilac silk',
      1122,
      1402,
      'center 50%',
    ),
    kits: ref(
      FILES.kitFlatlay,
      'A flat lay of lashes, adhesive, tweezers and a travel pouch',
      1122,
      1402,
      'center 45%',
    ),
  } satisfies Record<Category, ImageRef>,

  /** The two halves of the C-curl / D-curl comparison photograph. */
  curl: {
    c: ref(FILES.journal2, 'A close-up of an eye wearing a C curl lash', 766, 508, '0% 50%'),
    d: ref(FILES.journal2, 'A close-up of an eye wearing a D curl lash', 766, 508, '100% 50%'),
  },

  /** Product imagery keyed by slug. First image is the primary. */
  products: {
    'cloud-wisp': STRIP,
    'soft-volume': STRIP,
    'night-out': STRIP,
    'everyday-clusters': CLUSTERS,
    'volume-clusters': CLUSTERS,
    'pro-extension-trays': CLUSTERS,
    'featherlight-bond': ADHESIVE,
    'seal-and-hold': ADHESIVE,
    'gentle-remover': ADHESIVE,
    'precision-applicator': TOOL,
    'lash-lift-comb': TOOL,
    'the-starter-kit': KIT,
    'the-volume-kit': KIT,
    'travel-case': TRAVEL,
  } satisfies Record<ProductSlug, readonly string[]>,

  /** Used as the "Pairs well with" visual on product pages. */
  pairsWith: ref(
    FILES.kitFlatlay,
    'Flat lay of strip lashes, adhesive, tweezers and a lilac pouch',
    1122,
    1402,
    'center 40%',
  ),

  sections: {
    editorial: ref(
      FILES.editorialChiffon,
      'Delicate lash clusters resting on flowing lilac chiffon',
      1914,
      822,
      '55% 50%',
    ),
    // Face is in the upper-left third; keep it clear of the crop on mobile.
    lifestyle: ref(
      FILES.lifestyleCafe,
      'A smiling woman in a lavender blouse holding a latte at a café table',
      1122,
      1402,
      '40% 22%',
    ),
    newsletter: ref(
      FILES.newsletterPetals,
      'Soft lavender petals with a delicate lash cluster',
      1914,
      822,
      '62% 55%',
    ),
  },

  /** How-it-works crops: Prep, Place, Press, Perfect. */
  steps: [
    ref(FILES.step1, 'Brushing natural lashes with a spoolie to prep', 623, 528, '30% 40%'),
    ref(FILES.step2, 'Placing a lash cluster with rose-gold tweezers', 623, 528, '55% 40%'),
    ref(
      FILES.step3,
      'Gently pressing the cluster into place with a fingertip',
      623,
      528,
      '40% 40%',
    ),
    ref(FILES.step4, 'Smiling with the finished, feathery lash look', 623, 528, '55% 35%'),
  ] as readonly ImageRef[],

  /**
   * Journal covers, ordered to match `src/lib/articles.ts`:
   * care · curl · cluster-vs-strip · removal · reuse
   */
  journal: [
    ref(
      FILES.journal1,
      'Lash cleaner, spoolie, tweezers and cotton pads on lavender linen',
      759,
      508,
      'center 50%',
    ),
    ref(FILES.journal2, 'C-curl and D-curl lashes compared side by side', 766, 508, 'center 50%'),
    ref(
      FILES.categoryExtensions,
      'Lash clusters on a lavender glass tray',
      1086,
      1448,
      'center 45%',
    ),
    ref(
      FILES.journal3,
      'A woman gently wiping her eye with a cotton pad in a bright bathroom',
      1536,
      506,
      '50% 40%',
    ),
    ref(FILES.travelCase, 'A lilac travel case holding lash clusters', 1122, 1402, 'center 55%'),
  ] as readonly ImageRef[],
} as const;

/** Convenience: build a product's `images` array (string paths) from the manifest. */
export const productImages = (slug: ProductSlug): string[] => [...IMAGES.products[slug]];
