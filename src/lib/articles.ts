/**
 * Hardcoded journal articles. Bodies are structured blocks (not raw HTML) so the
 * reader can style them consistently - see src/components/journal/ArticleBody.tsx.
 * Cover imagery comes from the IMAGES manifest (journal array, same order as below).
 */
import { IMAGES, type ImageRef, type ProductSlug } from './images';

export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string };

export type Article = {
  slug: string;

  title: string;
  excerpt: string;
  category: string;
  /** Minutes. */
  readTime: number;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  cover: ImageRef;
  body: ArticleBlock[];
  /** Products to feature at the end of the article. */
  products: ProductSlug[];
};

export const ARTICLES: readonly Article[] = [
  // 1 - care --------------------------------------------------------------
  {
    slug: 'how-to-care-for-your-lashes',
    title: 'How to care for your lashes, gently',
    excerpt:
      'Five quiet habits that keep strip lashes and clusters soft, shapely and ready to wear again.',
    category: 'Lash care',
    readTime: 5,
    date: '2026-10-28',
    cover: IMAGES.journal[0],
    products: ['precision-applicator', 'lash-lift-comb', 'travel-case'],
    body: [
      {
        type: 'p',
        text: 'Good lashes are rarely about the lashes themselves. They are about what happens in the minutes before and after you wear them. A little care is the difference between a set that lasts two wears and one that lasts twenty.',
      },
      { type: 'h2', text: 'Start with a clean lash line' },
      {
        type: 'p',
        text: 'Oil is the quiet enemy of any bond. Before you apply anything, cleanse your lids and lash line, rinse well and pat completely dry. If you wear makeup, finish your eye look first, skipping anything oil-based close to the lash line.',
      },
      { type: 'h2', text: 'Handle by the band, never the fibres' },
      {
        type: 'p',
        text: 'Lift strip lashes from the case by the band, or by the base of a cluster, using your applicator. Pulling on the fibres bends and breaks them and shortens the life of a pair. A slow, deliberate hand gives you a more accurate placement, too.',
      },
      { type: 'h2', text: 'The five habits' },
      {
        type: 'ol',
        items: [
          'Brush your natural lashes with a clean spoolie before you begin.',
          'Wait for the adhesive to turn tacky (twenty to thirty seconds) before placing.',
          'Press the band or cluster down and hold it for five full seconds.',
          'Keep steam, oils and heavy cleansers away from the bond for the first hour.',
          'At the end of the day, remove gently and clean before storing.',
        ],
      },
      { type: 'h2', text: 'Clean between wears' },
      {
        type: 'p',
        text: 'Residue builds up on the band and makes the next application feel less secure. Use a cotton swab or the tip of your applicator with a drop of lash cleaner to lift the old adhesive away, then let the lashes air-dry on a clean surface.',
      },
      {
        type: 'quote',
        text: 'The best lashes are the ones you look after like jewellery: lightly, regularly, and with a proper home to return to.',
      },
      { type: 'h2', text: 'Give them a proper home' },
      {
        type: 'p',
        text: 'Store lashes in their case, band-side down, away from steam and sunlight. A tidy case keeps the curl in place and stops fibres from crushing in a makeup bag.',
      },
    ],
  },

  // 2 - curl --------------------------------------------------------------
  {
    slug: 'how-to-choose-your-curl',
    title: 'Choosing your curl: C or D?',
    excerpt:
      'The difference between a C curl and a D curl is small on paper and dramatic on the eye. Here is how to decide.',
    category: 'Guide',
    readTime: 4,
    date: '2026-10-14',
    cover: IMAGES.journal[1],
    products: ['pro-extension-trays', 'everyday-clusters', 'cloud-wisp'],
    body: [
      {
        type: 'p',
        text: 'Curl is the quiet decision behind every lash look. It decides how open your eye appears, how much lift you get at the outer corner, and how natural the whole thing reads in photographs and in person.',
      },
      { type: 'h2', text: 'C curl: the natural lift' },
      {
        type: 'p',
        text: 'A C curl follows the arc of a natural lash. It opens the eye gently and blends easily with the lashes you already have, which makes it our recommendation for everyday wear, for hooded lids, and for anyone trying lashes for the first time.',
      },
      { type: 'h2', text: 'D curl: the dramatic open eye' },
      {
        type: 'p',
        text: 'A D curl lifts more sharply from the base, creating a wider, more open eye with a dolled-up finish. It works beautifully on straighter natural lashes, deeper-set eyes and evenings when you want more drama from the same weight of fibre.',
      },
      { type: 'h2', text: 'How to choose' },
      {
        type: 'ul',
        items: [
          'Natural lashes already curl upward → C curl will blend seamlessly.',
          'Natural lashes grow straight or downward → D curl gives you lift.',
          'Hooded or downturned eyes → D curl opens the eye; C curl keeps it soft.',
          'Not sure → start with C. You can always layer a D at the outer corner.',
        ],
      },
      {
        type: 'quote',
        text: 'If you are torn, mix them: C through the middle for softness and a few D clusters at the outer corner for lift.',
      },
      { type: 'h2', text: 'A note on length' },
      {
        type: 'p',
        text: 'Curl and length work together. A longer length in D curl will feel dramatic quickly; a shorter length in C curl is almost invisible. Mixed-length trays are a safe place to start while you learn what your eyes like.',
      },
    ],
  },

  // 3 - cluster vs strip --------------------------------------------------
  {
    slug: 'clusters-vs-strip-lashes',
    title: 'Clusters or strip lashes? Choose your finish',
    excerpt:
      'Both are weightless and reusable. They differ in control, speed and how long they last on your lids.',
    category: 'Guide',
    readTime: 5,
    date: '2026-09-30',
    cover: IMAGES.journal[2],
    products: ['cloud-wisp', 'everyday-clusters', 'featherlight-bond'],
    body: [
      {
        type: 'p',
        text: 'Strip lashes and clusters get you to the same place (fuller, more defined lashes) by quite different roads. Understanding the difference makes the choice simple.',
      },
      { type: 'h2', text: 'Strip lashes: fast and finished' },
      {
        type: 'p',
        text: 'A strip is a complete, ready-made row you apply in a single move. They are the quickest way to a defined look, forgiving for beginners, and ideal for a single day or evening. Most wear well for up to a day and can be reused around twenty times with good care.',
      },
      { type: 'h2', text: 'Clusters: custom and lived-in' },
      {
        type: 'p',
        text: 'Clusters are small groups of fibres you place one at a time, wherever you want them. You decide where volume goes and how long each section is, which makes the finish more personal and more like salon extensions. They also hold longer (up to three days with a sealant) because each cluster bonds to your own lashes rather than lying over them.',
      },
      { type: 'h2', text: 'The comparison' },
      {
        type: 'ul',
        items: [
          'Time to apply: strips ≈ 2 minutes · clusters ≈ 10–15 minutes.',
          'Control: strips are one-size · clusters are fully customisable.',
          'Wear: strips ≈ one day · clusters ≈ up to three days.',
          'Feel: strips are a band you may notice · clusters feel like your own lashes.',
        ],
      },
      { type: 'h2', text: 'Our recommendation' },
      {
        type: 'p',
        text: 'If you are new to lashes, start with a strip. Cloud Wisp is the gentlest introduction. If you already know what you like and want something bespoke, step into clusters. Many of our customers keep both: strips for busy mornings, clusters for weekends.',
      },
    ],
  },

  // 4 - removal -----------------------------------------------------------
  {
    slug: 'how-to-remove-lashes-safely',
    title: 'How to remove lashes safely',
    excerpt:
      'Never pull, never rush. A calm, sixty-second routine that protects your natural lashes.',
    category: 'Lash care',
    readTime: 3,
    date: '2026-09-16',
    cover: IMAGES.journal[3],
    products: ['gentle-remover', 'lash-lift-comb', 'travel-case'],
    body: [
      {
        type: 'p',
        text: 'Removal is where most lash damage happens, and almost all of it is avoidable. The rule is simple: lashes should release, not be removed. If you feel a tug, stop.',
      },
      { type: 'h2', text: 'What you need' },
      {
        type: 'ul',
        items: [
          'A gentle, oil-free lash remover',
          'Cotton pads or a soft cotton swab',
          'A clean spoolie',
          'A minute of calm',
        ],
      },
      { type: 'h2', text: 'The routine' },
      {
        type: 'ol',
        items: [
          'Wash your hands and sit somewhere well-lit with a mirror.',
          'Close your eyes and apply a small amount of Gentle Remover along the lash line.',
          'Wait 60 seconds so the bond has time to soften.',
          'Starting at the outer corner, let the lashes slide away with a cotton pad. If anything resists, apply a little more remover and wait.',
          'Cleanse the lids and lash line, then pat dry.',
        ],
      },
      {
        type: 'quote',
        text: 'If a lash does not slide away freely, it is not ready. More remover and a little patience will always beat force.',
      },
      { type: 'h2', text: 'After removal' },
      {
        type: 'p',
        text: 'Clean the band or clusters of any leftover adhesive, let them dry fully, and return them to their case. Give your natural lashes a rest day with a clean spoolie and, if you like, a nourishing serum.',
      },
    ],
  },

  // 5 - reuse -------------------------------------------------------------
  {
    slug: 'how-to-reuse-your-lashes',
    title: 'Twenty wears: how to reuse your lashes',
    excerpt:
      'Reusable only works if you treat them well. A simple clean-dry-store routine gets you to twenty.',
    category: 'Lash care',
    readTime: 4,
    date: '2026-09-02',
    cover: IMAGES.journal[4],
    products: ['travel-case', 'gentle-remover', 'precision-applicator'],
    body: [
      {
        type: 'p',
        text: 'Our lashes are designed to be worn up to twenty times, which makes them better for your wallet and the planet. Getting there takes less effort than you might think: it comes down to what you do in the five minutes after they come off.',
      },
      { type: 'h2', text: 'Clean off the old adhesive' },
      {
        type: 'p',
        text: 'Place the lash on a clean surface and use the tip of a cotton swab or your applicator to roll residue from the band. Never scrape with a fingernail, which can tear the band or bend the fibres.',
      },
      { type: 'h2', text: 'Let them dry completely' },
      {
        type: 'p',
        text: 'Moisture trapped in a closed case can dull the curl and encourage bacteria. Let the lashes air-dry for a few minutes before you put them away.',
      },
      { type: 'h2', text: 'Store with care' },
      {
        type: 'ul',
        items: [
          'Always return lashes to their own case, band-side down.',
          'Keep the case away from steam, heat and direct sun.',
          'Use a travel case with a soft interior if you are carrying them in a bag.',
        ],
      },
      { type: 'h2', text: 'Know when to retire a pair' },
      {
        type: 'p',
        text: 'If the band has stiffened, the fibres no longer hold their curl or the lashes feel uncomfortable, it is time for a new pair. Replace them rather than push for twenty-one. Your eyes will thank you.',
      },
    ],
  },
];

export const getArticle = (slug: string): Article | undefined =>
  ARTICLES.find((a) => a.slug === slug);

/** The next article in the list (wraps around) - used for "Continue reading". */
export function getNextArticle(slug: string): Article | undefined {
  const i = ARTICLES.findIndex((a) => a.slug === slug);
  if (i === -1) return undefined;
  return ARTICLES[(i + 1) % ARTICLES.length];
}

export const articleHref = (a: Pick<Article, 'slug'>): string => `/journal/${a.slug}`;

/** "28 Oct 2026" */
export function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}
