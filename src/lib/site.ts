/** Site-wide constants: brand, URLs, navigation. Edit copy and links here. */

export const SITE_NAME = 'Lash Globar';

/**
 * The name shown to customers on the /pay page as how the charge will read on their card statement.
 * The statement text itself is set in the Stripe Dashboard (Settings → Business → Public details →
 * Statement descriptor), so keep the two in step.
 */
export const STATEMENT_NAME = 'LASHGLOBAR';
export const SITE_TAGLINE = 'Lashes that linger.';
export const SITE_DESCRIPTION =
  'Lash Globar makes weightless, reusable strip lashes, clusters and extension trays. Vegan, cruelty-free and designed for everyday wear.';

/** Absolute origin, no trailing slash. Used for metadata, sitemap and Stripe image URLs. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@lashglobar.com';

/** Free-shipping threshold in cents (matches the announcement bar copy). */
export const FREE_SHIPPING_THRESHOLD = 6000;

/** Countries the store ships to (also limits the address form at checkout). */
export const SHIPPING_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'IN'] as const;

/** Max units of a single product + variant per order (enforced in the cart AND server-side). */
export const MAX_QTY = 10;

/** Shared deep links so the nav, hero and category tiles never drift apart. */
export const ROUTES = {
  shop: '/shop',
  lashes: '/shop/strip-lashes',
  extensions: '/shop?category=clusters,extensions',
  story: '/our-story',
  journal: '/journal',
  cart: '/cart',
  checkout: '/checkout',
  faq: '/faq',
  shipping: '/shipping-returns',
  contact: '/contact',
} as const;

export type NavLink = { label: string; href: string };

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Shop', href: ROUTES.shop },
  { label: 'Lashes', href: ROUTES.lashes },
  { label: 'Extensions', href: ROUTES.extensions },
  { label: 'Our Story', href: ROUTES.story },
  { label: 'Journal', href: ROUTES.journal },
];

export const FOOTER_COLUMNS: readonly { title: string; links: readonly NavLink[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', href: '/shop' },
      { label: 'Strip lashes', href: '/shop/strip-lashes' },
      { label: 'Clusters', href: '/shop/clusters' },
      { label: 'Extension trays', href: '/shop/extensions' },
      { label: 'Adhesives', href: '/shop/adhesives' },
      { label: 'Tools', href: '/shop/tools' },
      { label: 'Kits', href: '/shop/kits' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'FAQ', href: ROUTES.faq },
      { label: 'Shipping & returns', href: ROUTES.shipping },
      { label: 'Contact', href: ROUTES.contact },
      { label: 'Your bag', href: ROUTES.cart },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our story', href: ROUTES.story },
      { label: 'Journal', href: ROUTES.journal },
    ],
  },
];

/** TODO: replace with the brand's real profile URLs before launch. */
export const SOCIAL_LINKS: readonly NavLink[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'TikTok', href: 'https://www.tiktok.com/' },
  { label: 'Pinterest', href: 'https://www.pinterest.com/' },
  { label: 'YouTube', href: 'https://www.youtube.com/' },
];

/** Marquee phrases (Section 4 of the brief). */
export const MARQUEE_PHRASES = [
  'Weightless',
  'Reusable up to 20x',
  'Vegan',
  'Cruelty-free',
  'Latex-free',
  'Salon-grade',
] as const;
