/**
 * Hardcoded product catalog (no database). All prices are in integer CENTS (USD).
 * The Stripe route looks prices up from here server-side - never from the client.
 *
 * NOTE: `rating` / `reviewCount` are placeholder figures for the demo storefront.
 * Replace them with real review data (or remove the aggregateRating JSON-LD) before launch.
 */
import { productImages, type ProductSlug } from './images';

export type Category = 'strip-lashes' | 'clusters' | 'extensions' | 'adhesives' | 'tools' | 'kits';
export type LashStyle = 'natural' | 'wispy' | 'volume' | 'dramatic';

export type Product = {
  id: string;
  slug: ProductSlug;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number; // cents
  category: Category;
  style?: LashStyle;
  images: string[]; // from the IMAGES manifest
  variants?: { name: string; options: string[] }[];
  badges?: string[];
  rating: number;
  reviewCount: number;
  details: string[];
  howToApply: string[];
  materials: string[];
  featured?: boolean;
};

/** A chosen option per variant group, e.g. `{ Length: '12mm', Curl: 'C' }`. */
export type VariantSelection = Record<string, string>;

// ---------------------------------------------------------------------------
// Category metadata (drives /shop/[category] headers and filters)
// ---------------------------------------------------------------------------
export type CategoryMeta = {
  slug: Category;
  label: string;

  headline: string;
  intro: string;
  description: string;
};

export const CATEGORIES: readonly CategoryMeta[] = [
  {
    slug: 'strip-lashes',
    label: 'Strip Lashes',
    headline: 'Strip lashes',
    intro:
      'Featherweight bands you can wear again and again. Choose your mood, press, and go. No mirror marathon required.',
    description:
      'Weightless, reusable strip lashes in natural, wispy and dramatic styles. Vegan, cruelty-free and salon-grade.',
  },
  {
    slug: 'clusters',
    label: 'Clusters',
    headline: 'Clusters',
    intro:
      'Individual clusters for a custom, lived-in finish. Mix lengths, layer where you want volume, and wear them all day.',
    description:
      'DIY lash clusters in everyday and volume styles. Mix, layer and customise for a seamless, lived-in finish.',
  },
  {
    slug: 'extensions',
    label: 'Extensions',
    headline: 'Extensions',
    intro:
      'Salon-grade extension trays for artists and the very particular. Choose your curl, choose your length, build your look.',
    description:
      'Professional extension trays in C and D curls with mixed or single lengths for salon-grade results.',
  },
  {
    slug: 'adhesives',
    label: 'Adhesives & Removers',
    headline: 'Adhesives',
    intro:
      'Clear-drying, latex-free formulas that hold through the day, and let go gently when you ask them to.',
    description:
      'Latex-free lash adhesive, sealant and gentle remover for a secure hold and an easy, kind release.',
  },
  {
    slug: 'tools',
    label: 'Tools & Cases',
    headline: 'Tools & cases',
    intro:
      'The small, considered things that make application easier and keep your lashes beautiful between wears.',
    description:
      'Precision applicators, lash combs and travel cases that make application effortless.',
  },
  {
    slug: 'kits',
    label: 'Kits',
    headline: 'Kits',
    intro:
      'Everything you need in one box, thoughtfully paired, and priced below the sum of its parts.',
    description:
      'Complete lash kits with lashes, adhesive and tools, bundled for less than buying separately.',
  },
];

export const STYLE_LABELS: Record<LashStyle, string> = {
  natural: 'Natural',
  wispy: 'Wispy',
  volume: 'Volume',
  dramatic: 'Dramatic',
};

export const PRICE_RANGES = [
  { id: 'under-25', label: 'Under $25', min: 0, max: 2500 },
  { id: '25-50', label: '$25 – $50', min: 2500, max: 5000 },
  { id: '50-plus', label: '$50 & over', min: 5000, max: Number.POSITIVE_INFINITY },
] as const;

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';

export const SORT_OPTIONS: readonly { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name: A–Z' },
];

// ---------------------------------------------------------------------------
// The catalog
// ---------------------------------------------------------------------------
export const PRODUCTS: readonly Product[] = [
  // ----- Strip lashes -------------------------------------------------------
  {
    id: 'LG-STR-001',
    slug: 'cloud-wisp',
    name: 'Cloud Wisp',
    tagline: 'Barely-there, feathery lift.',
    description:
      'Our everyday strip lash. Cloud Wisp is cut from ultra-fine, cruelty-free fibres that taper to a whisper, so the look is soft, open and unmistakably yours. The flexible cotton-thread band follows your lash line and disappears the moment it touches down.',
    price: 2400,
    category: 'strip-lashes',
    style: 'natural',
    images: productImages('cloud-wisp'),
    badges: ['Bestseller'],
    rating: 4.8,
    reviewCount: 412,
    featured: true,
    details: [
      'Natural, feathery finish with a gentle outward flare',
      'Ultra-thin 0.07mm cotton-thread band that bends with your lid',
      'Weightless: most wearers forget they have them on',
      'Reusable up to 20 times with proper care',
      'One pair per case, in a protective reusable lash case',
    ],
    howToApply: [
      'Measure the band against your lash line and trim from the outer edge if needed.',
      'Apply a thin line of Featherlight Bond along the band and wait 20–30 seconds until tacky.',
      'Using the Precision Applicator, set the band as close to your natural lash line as you can.',
      'Press the inner, middle and outer corners gently for five seconds.',
      'Blend with your natural lashes using a clean spoolie.',
    ],
    materials: [
      'Cruelty-free, vegan synthetic fibres',
      'Cotton-thread band, latex-free',
      'Reusable lash case made with recycled plastic',
    ],
  },
  {
    id: 'LG-STR-002',
    slug: 'soft-volume',
    name: 'Soft Volume',
    tagline: 'Fluttery layers, softly full.',
    description:
      'A step up from natural without ever feeling heavy. Soft Volume layers short and mid-length fibres in a wispy criss-cross for a fluttery, textured finish that photographs beautifully and still looks like lashes.',
    price: 2600,
    category: 'strip-lashes',
    style: 'wispy',
    images: productImages('soft-volume'),
    rating: 4.7,
    reviewCount: 286,
    details: [
      'Wispy, textured finish with criss-cross layering',
      'Medium volume that builds without weight',
      'Soft, flexible band, comfortable for long wear',
      'Reusable up to 20 times',
      'One pair per case',
    ],
    howToApply: [
      'Remove the lashes from the case with the applicator, holding by the band.',
      'Trim the band to fit your eye shape, starting from the outer corner.',
      'Apply Featherlight Bond to the band and let it set until tacky.',
      'Place at the base of your natural lashes, starting at the centre.',
      'Press each end down and hold for five seconds.',
    ],
    materials: [
      'Cruelty-free, vegan synthetic fibres',
      'Cotton-thread band, latex-free',
      'Reusable lash case made with recycled plastic',
    ],
  },
  {
    id: 'LG-STR-003',
    slug: 'night-out',
    name: 'Night Out',
    tagline: 'Full, defined, unmistakably you.',
    description:
      'For the evenings that ask a little more. Night Out is a dense, defined strip with a dramatic curl, built from longer fibres that frame the eye and catch the light. Still light enough to wear from dinner to last call.',
    price: 2800,
    category: 'strip-lashes',
    style: 'dramatic',
    images: productImages('night-out'),
    badges: ['New'],
    rating: 4.6,
    reviewCount: 198,
    details: [
      'Dramatic, defined finish with a pronounced curl',
      'Dense, full band for maximum impact',
      'Still lightweight and comfortable for hours of wear',
      'Reusable up to 20 times',
      'One pair per case',
    ],
    howToApply: [
      'Trim the band so the outer edge sits just past your natural lash line.',
      'Apply Featherlight Bond and wait until tacky.',
      'Place at the centre first, then secure the outer and inner corners.',
      'Seal the edges with a touch of Seal & Hold for all-night wear.',
    ],
    materials: [
      'Cruelty-free, vegan synthetic fibres',
      'Cotton-thread band, latex-free',
      'Reusable lash case made with recycled plastic',
    ],
  },

  // ----- Clusters -----------------------------------------------------------
  {
    id: 'LG-CLU-001',
    slug: 'everyday-clusters',
    name: 'Everyday Clusters',
    tagline: 'Soft clusters for a lived-in look.',
    description:
      'Short, feathery clusters you place exactly where you want them. Everyday Clusters give you a custom, lash-extension finish in minutes. Layer a few for subtle definition or a full row for a fuller fan.',
    price: 3200,
    category: 'clusters',
    style: 'natural',
    images: productImages('everyday-clusters'),
    variants: [{ name: 'Length', options: ['10mm', '12mm', '14mm'] }],
    badges: ['Bestseller'],
    rating: 4.9,
    reviewCount: 623,
    featured: true,
    details: [
      '60 individual clusters in a tidy, reusable tray',
      'Soft, flexible fibres with a natural taper',
      'Wear alone or layered for more volume',
      'Holds up to 3 days with Featherlight Bond + Seal & Hold',
      'Reusable with proper care',
    ],
    howToApply: [
      'Clean the lash line and brush your natural lashes with a spoolie.',
      'Pick up a cluster with the Precision Applicator, holding it by the base.',
      'Dip the base in Featherlight Bond and let it set for a few seconds.',
      'Place under your natural lashes, as close to the lash line as comfortable.',
      'Press gently for five seconds. Repeat across the lash line, outer corner first.',
    ],
    materials: [
      'Cruelty-free, vegan synthetic fibres',
      'Soft, flexible fused bases',
      'Reusable lilac cluster tray',
    ],
  },
  {
    id: 'LG-CLU-002',
    slug: 'volume-clusters',
    name: 'Volume Clusters',
    tagline: 'Fanned, fuller, still weightless.',
    description:
      'Handmade-look fans with more density at the root and a feather-soft tip. Volume Clusters are for when you want a fuller, glossier look without the heaviness. A mixed-length tray lets you build a natural gradient.',
    price: 3600,
    category: 'clusters',
    style: 'volume',
    images: productImages('volume-clusters'),
    rating: 4.7,
    reviewCount: 241,
    details: [
      '48 fanned clusters in mixed lengths (9–13mm)',
      'Denser root for a full, glossy finish',
      'Wear a single row or double-layer for drama',
      'Holds up to 3 days with proper aftercare',
      'Reusable tray included',
    ],
    howToApply: [
      'Prep your lashes and lash line: clean, dry and oil-free.',
      'Place shorter clusters at the inner corner and longer at the outer.',
      'Apply a thin bead of Featherlight Bond to the base of each cluster.',
      'Press under the natural lash line and hold for five seconds.',
      'Finish with Seal & Hold for extra staying power.',
    ],
    materials: [
      'Cruelty-free, vegan synthetic fibres',
      'Soft, flexible fused bases',
      'Reusable lilac cluster tray',
    ],
  },

  // ----- Extensions ---------------------------------------------------------
  {
    id: 'LG-EXT-001',
    slug: 'pro-extension-trays',
    name: 'Pro Extension Trays',
    tagline: 'Salon-grade, in your hands.',
    description:
      'Our professional extension trays, designed for lash artists and the very particular. Each tray holds precision-cut, ultra-light fibres in perfectly graded lengths, so you can build a look strand by strand with total control.',
    price: 4800,
    category: 'extensions',
    style: 'volume',
    images: productImages('pro-extension-trays'),
    variants: [
      { name: 'Curl', options: ['C', 'D'] },
      { name: 'Length', options: ['Mixed', '10mm', '12mm', '14mm'] },
    ],
    badges: ['Pro'],
    rating: 4.8,
    reviewCount: 154,
    details: [
      '0.07mm ultra-light fibres with a soft, natural taper',
      'C curl for a natural lift · D curl for a dramatic open eye',
      'Mixed trays hold 8–14mm; single-length trays hold 100+ fans',
      'Easy-grab tray layout for fast, accurate isolation',
      'Compatible with professional-grade adhesives',
    ],
    howToApply: [
      'Isolate a single natural lash using fine-tip isolation tweezers.',
      'Pick up an extension with the Precision Applicator, 1–2mm from the base.',
      'Dip in adhesive and place 0.5–1mm from the lash line.',
      'Hold until set, then check the bond before moving on.',
      'Use the Gentle Remover for safe, painless removal when needed.',
    ],
    materials: [
      'Cruelty-free, vegan synthetic fibres',
      'Latex-free, formaldehyde-free base bonding',
      'Reusable lilac tray, recyclable packaging',
    ],
  },

  // ----- Adhesives ----------------------------------------------------------
  {
    id: 'LG-ADH-001',
    slug: 'featherlight-bond',
    name: 'Featherlight Bond',
    tagline: 'Clear-drying, flexible hold.',
    description:
      'A latex-free adhesive that sets clear and stays flexible, so lashes move with your lid instead of against it. Featherlight Bond is gentle on sensitive eyes, precise to apply, and strong enough for a full day (and then some).',
    price: 1800,
    category: 'adhesives',
    images: productImages('featherlight-bond'),
    badges: ['Latex-free'],
    rating: 4.8,
    reviewCount: 530,
    featured: true,
    details: [
      '5ml precision-tip bottle',
      'Latex-free · Formaldehyde-free · Vegan',
      'Sets clear, with no white residue',
      'All-day hold, up to 72 hours with clusters',
      'Fine applicator tip for accurate placement',
    ],
    howToApply: [
      'Shake gently and wipe the tip on a clean tissue before use.',
      'Apply a thin, even line to the lash band or cluster base.',
      'Wait 20–30 seconds until it turns tacky, then place.',
      'Close the cap tightly after use and store upright, away from heat.',
    ],
    materials: [
      'Water-resistant, latex-free polymer adhesive',
      'Glass-free, recyclable bottle',
      'Ophthalmologist-tested, vegan formula',
    ],
  },
  {
    id: 'LG-ADH-002',
    slug: 'seal-and-hold',
    name: 'Seal & Hold',
    tagline: 'A quiet top coat for staying power.',
    description:
      'A clear, lightweight sealant that locks clusters and band edges in place and protects the bond from steam, sweat and sleep. Apply it once, and your lashes keep their lift for days.',
    price: 1600,
    category: 'adhesives',
    images: productImages('seal-and-hold'),
    rating: 4.6,
    reviewCount: 177,
    details: [
      '5ml fine-brush bottle',
      'Extends wear by up to 48 hours',
      'Dries clear, matte and flexible',
      'Latex-free · Vegan',
    ],
    howToApply: [
      'Once lashes are placed and set, close your eyes for 30 seconds.',
      'Lightly sweep Seal & Hold along the base of the lashes with the brush.',
      'Let dry fully before applying any eye makeup or water.',
    ],
    materials: ['Clear, flexible polymer sealant', 'Recyclable bottle', 'Vegan formula'],
  },
  {
    id: 'LG-ADH-003',
    slug: 'gentle-remover',
    name: 'Gentle Remover',
    tagline: 'Lets go when you ask it to.',
    description:
      'A soft, conditioning gel remover that dissolves the bond without tugging at your natural lashes. Apply, wait a minute, and the lashes slide off, leaving your own lashes just as you left them.',
    price: 1500,
    category: 'adhesives',
    images: productImages('gentle-remover'),
    rating: 4.7,
    reviewCount: 205,
    details: [
      '10ml tube with a soft-tip applicator',
      'Oil-free, fragrance-free and gentle on sensitive eyes',
      'Dissolves adhesive in under 60 seconds',
      'Conditioning with panthenol and aloe',
    ],
    howToApply: [
      'Close your eyes and apply a small amount along the lash line.',
      'Wait 60 seconds. Never pull or tug at the lashes.',
      'Wipe away gently with a cotton pad, then rinse with water.',
    ],
    materials: ['Oil-free gel base with panthenol and aloe', 'Fragrance-free', 'Recyclable tube'],
  },

  // ----- Tools --------------------------------------------------------------
  {
    id: 'LG-TLS-001',
    slug: 'precision-applicator',
    name: 'Precision Applicator',
    tagline: 'Rose-gold control at the tip.',
    description:
      'A fine, angled tweezer in polished rose-gold stainless steel, balanced for effortless placement. Its slim tip grips a single cluster or a full band with equal confidence. It is the one tool we think every kit deserves.',
    price: 2200,
    category: 'tools',
    images: productImages('precision-applicator'),
    badges: ['Essential'],
    rating: 4.9,
    reviewCount: 318,
    details: [
      'Medical-grade stainless steel with rose-gold finish',
      'Angled 45° tip for visibility and control',
      'Anti-slip serrated grip',
      'Comes with a soft protective pouch',
    ],
    howToApply: [
      'Hold the applicator like a pen, close to the tip.',
      'Pick up lashes by the band or base, never by the fibres.',
      'Wipe clean with a damp cotton pad after each use.',
    ],
    materials: ['Medical-grade stainless steel', 'Rose-gold PVD finish', 'Soft microfibre pouch'],
  },
  {
    id: 'LG-TLS-002',
    slug: 'lash-lift-comb',
    name: 'Lash Lift Comb',
    tagline: 'For separation and the final blend.',
    description:
      'A fine-toothed comb that separates, lifts and blends natural lashes with your applied clusters or strips. A single stroke finishes the look with clean, even definition.',
    price: 1200,
    category: 'tools',
    images: productImages('lash-lift-comb'),
    rating: 4.5,
    reviewCount: 96,
    details: [
      'Fine, rounded-tip teeth that never snag',
      'Separates and lifts without clumping',
      'Slim, travel-friendly handle',
    ],
    howToApply: [
      'Once lashes have set, hold the comb at the base of the lashes.',
      'Sweep gently upward through the tips to separate and lift.',
      'Clean with a damp cotton pad after use.',
    ],
    materials: ['Lilac-tone resin handle', 'Rounded stainless-steel teeth'],
  },

  // ----- Kits ---------------------------------------------------------------
  {
    id: 'LG-KIT-001',
    slug: 'the-starter-kit',
    name: 'The Starter Kit',
    tagline: 'Everything for your first (and next) set.',
    description:
      'A thoughtfully edited kit for anyone new to lashes: one pair of Cloud Wisp, Featherlight Bond, the Precision Applicator and a Travel Case. Everything you need to go from box to beautiful, for less than the pieces apart.',
    price: 6800,
    compareAtPrice: 9000,
    category: 'kits',
    style: 'natural',
    images: productImages('the-starter-kit'),
    badges: ['Save $22'],
    rating: 4.9,
    reviewCount: 387,
    featured: true,
    details: [
      '1 pair Cloud Wisp strip lashes',
      '1 Featherlight Bond adhesive (5ml)',
      '1 Precision Applicator',
      '1 Travel Case',
      'Free shipping over $60',
    ],
    howToApply: [
      'Follow the Cloud Wisp steps: trim, apply adhesive, wait until tacky, place and press.',
      'Use the Precision Applicator to set the band close to your natural lash line.',
      'After wear, clean the band and store lashes in the Travel Case.',
    ],
    materials: [
      'Cruelty-free, vegan synthetic fibres',
      'Latex-free adhesive',
      'Stainless steel applicator',
      'Vegan-leather travel case',
    ],
  },
  {
    id: 'LG-KIT-002',
    slug: 'the-volume-kit',
    name: 'The Volume Kit',
    tagline: 'The full DIY set, beautifully paired.',
    description:
      'For the look that makes everyone ask. A tray of Volume Clusters, Featherlight Bond, Seal & Hold, the Precision Applicator and Gentle Remover. A complete DIY system for a fuller, longer-lasting finish.',
    price: 8400,
    compareAtPrice: 10700,
    category: 'kits',
    style: 'volume',
    images: productImages('the-volume-kit'),
    badges: ['New'],
    rating: 4.8,
    reviewCount: 122,
    details: [
      '1 tray Volume Clusters (48 clusters, mixed lengths)',
      '1 Featherlight Bond adhesive (5ml)',
      '1 Seal & Hold sealant (5ml)',
      '1 Precision Applicator',
      '1 Gentle Remover (10ml)',
    ],
    howToApply: [
      'Prep lashes and lash line: clean, dry and oil-free.',
      'Place clusters one at a time with the applicator, using Featherlight Bond.',
      'Seal the bond with Seal & Hold after placement.',
      'Remove with Gentle Remover. Never pull.',
    ],
    materials: [
      'Cruelty-free, vegan synthetic fibres',
      'Latex-free adhesive & sealant',
      'Stainless steel applicator',
      'Recyclable packaging',
    ],
  },

  // ----- Travel Case --------------------------------------------------------
  {
    id: 'LG-TLS-003',
    slug: 'travel-case',
    name: 'Travel Case',
    tagline: 'A soft little home for your lashes.',
    description:
      'A compact, mirror-lined case that holds clusters or a pair of strips and your applicator. Soft vegan-leather exterior, a magnetic closure and a gentle foam bed keep every lash in its shape between wears.',
    price: 2600,
    category: 'tools',
    images: productImages('travel-case'),
    rating: 4.7,
    reviewCount: 143,
    details: [
      'Fits strip lashes, clusters and a mini applicator',
      'Built-in mirror for on-the-go touch-ups',
      'Soft vegan-leather exterior with magnetic closure',
      'Pocket-sized: 11 × 6.5 × 2.5 cm',
    ],
    howToApply: [
      'After wear, clean lashes gently and let them dry fully.',
      'Place into the case, band-side down, and close the lid.',
      'Store away from heat and direct sunlight.',
    ],
    materials: ['Vegan leather exterior', 'Soft foam interior', 'Magnetic closure, mirror lid'],
  },
];

// ---------------------------------------------------------------------------
// Lookups & helpers
// ---------------------------------------------------------------------------
const bySlug = new Map(PRODUCTS.map((p) => [p.slug as string, p]));
const byId = new Map(PRODUCTS.map((p) => [p.id, p]));

export const getProduct = (slug: string): Product | undefined => bySlug.get(slug);
export const getProductById = (id: string): Product | undefined => byId.get(id);
export const getCategory = (slug: string): CategoryMeta | undefined =>
  CATEGORIES.find((c) => c.slug === slug);
export const getProductsByCategory = (category: Category): Product[] =>
  PRODUCTS.filter((p) => p.category === category);
export const FEATURED_PRODUCTS: readonly Product[] = PRODUCTS.filter((p) => p.featured);

export const hasVariants = (p: Product): boolean => Boolean(p.variants && p.variants.length > 0);

/** First option of every variant group - used when a product is added without a choice. */
export function defaultVariant(p: Product): VariantSelection | undefined {
  if (!p.variants?.length) return undefined;
  return Object.fromEntries(p.variants.map((v) => [v.name, v.options[0]]));
}

/**
 * Validate a client-supplied variant against the product definition.
 * Returns a clean selection (every group filled), or `null` if invalid.
 * Missing groups fall back to the default option.
 */
export function resolveVariant(p: Product, input: unknown): VariantSelection | undefined | null {
  if (!p.variants?.length) return undefined;
  const given = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const out: VariantSelection = {};
  for (const group of p.variants) {
    const value = given[group.name];
    if (value === undefined) {
      out[group.name] = group.options[0];
    } else if (typeof value === 'string' && group.options.includes(value)) {
      out[group.name] = value;
    } else {
      return null;
    }
  }
  return out;
}

/** "Length: 12mm · Curl: C" */
export function variantLabel(variant?: VariantSelection): string {
  if (!variant) return '';
  return Object.entries(variant)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}

/** Which products complete a purchase of each category ("Pairs well with"). */
const PAIRINGS: Record<Category, ProductSlug[]> = {
  'strip-lashes': ['featherlight-bond', 'precision-applicator', 'travel-case'],
  clusters: ['featherlight-bond', 'seal-and-hold', 'precision-applicator'],
  extensions: ['featherlight-bond', 'precision-applicator', 'gentle-remover'],
  adhesives: ['precision-applicator', 'cloud-wisp', 'everyday-clusters'],
  tools: ['cloud-wisp', 'featherlight-bond', 'everyday-clusters'],
  kits: ['gentle-remover', 'travel-case', 'seal-and-hold'],
};

export function getPairsWith(product: Product, limit = 3): Product[] {
  return PAIRINGS[product.category]
    .map((slug) => getProduct(slug))
    .filter((p): p is Product => p !== undefined && p.slug !== product.slug)
    .slice(0, limit);
}

/** Same-category products first, then top-rated others. */
export function getRelated(product: Product, limit = 4): Product[] {
  const others = PRODUCTS.filter((p) => p.slug !== product.slug);
  const same = others.filter((p) => p.category === product.category);
  const rest = others
    .filter((p) => p.category !== product.category)
    .sort((a, b) => b.rating - a.rating);
  return [...same, ...rest].slice(0, limit);
}

/** Absolute-ready path of a product page. */
export const productHref = (p: Pick<Product, 'slug'>): string => `/products/${p.slug}`;
