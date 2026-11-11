/**
 * Single source of truth for every FAQ on the site.
 *
 * Answers are plain text so the same data feeds the accordion UI and the
 * FAQPage JSON-LD. Pages choose their questions through `FAQ_SETS` + `faqsById`.
 */

export type Faq = {
  id: string;
  q: string;
  a: string;
};

export const FAQS: readonly Faq[] = [
  {
    id: 'reuse',
    q: 'How many times can I reuse my lashes?',
    a: 'Up to 20 wears with proper care. After each wear, gently clean the band or cluster base of adhesive, let the lashes dry completely and store them in their case.',
  },
  {
    id: 'vegan',
    q: 'Are your lashes vegan and cruelty-free?',
    a: 'Yes. Our lashes are made from synthetic fibres, never mink or any animal hair, and neither we nor our suppliers test on animals.',
  },
  {
    id: 'latex',
    q: 'Is the adhesive latex-free?',
    a: 'Yes. Featherlight Bond and Seal & Hold are latex-free and formaldehyde-free. As with any cosmetic, we recommend a patch test, and stopping use if you notice irritation.',
  },
  {
    id: 'longevity',
    q: 'How long do clusters and strip lashes last?',
    a: 'Strip lashes are designed for a full day of wear. Clusters bond to your own lashes and can last up to three days when applied with Featherlight Bond and sealed with Seal & Hold.',
  },
  {
    id: 'curl',
    q: 'Should I choose a C curl or a D curl?',
    a: 'C curl is a natural lift that blends easily, ideal for everyday wear and for first-timers. D curl lifts more sharply for a wider, more dramatic eye. Not sure? Start with C. Our curl guide in the Journal walks you through it.',
  },
  {
    id: 'sensitive',
    q: 'Can I wear them with sensitive eyes?',
    a: 'Many customers with sensitive eyes love our latex-free adhesive and soft cotton-thread bands. Patch test first, keep adhesive away from your waterline, and consult a professional if you have an eye condition or are unsure.',
  },
  {
    id: 'removal',
    q: 'How do I remove them?',
    a: 'Apply a little Gentle Remover along the lash line, wait 60 seconds and let the lashes slide away. Never pull. If a lash resists, add a little more remover and wait.',
  },
  {
    id: 'shipping',
    q: 'Do you ship internationally?',
    a: 'We ship to the United States, Canada, the United Kingdom, Australia and India. Shipping options and delivery estimates are shown at checkout.',
  },
  {
    id: 'returns',
    q: 'What is your returns policy?',
    a: 'Unopened, unused products can be returned within 30 days. For hygiene reasons we cannot accept returns on opened lash products, adhesives or removers, but we will always make it right if something arrives damaged or faulty.',
  },
  {
    id: 'tracking',
    q: 'How do I track my order?',
    a: 'Once your order ships we email a tracking link to the address you used at checkout. Can’t find it? Check your spam folder, or get in touch and we’ll resend it.',
  },
];

/** Every id in order, for pages that want an explicit short list. */
export const FAQ_BY_ID: Record<string, Faq> = Object.fromEntries(FAQS.map((f) => [f.id, f]));

/** The questions to show on a page, in the order given. Unknown ids are skipped. */
export function faqsById(ids: readonly string[]): Faq[] {
  return ids.map((id) => FAQ_BY_ID[id]).filter((f): f is Faq => Boolean(f));
}

/** FAQPage structured data for a set of questions. */
export function faqJsonLd(items: readonly Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/** Which questions each page asks, in reading order. */
export const FAQ_SETS = {
  home: ['reuse', 'vegan', 'latex', 'curl', 'removal', 'returns'],
  shop: ['reuse', 'curl', 'vegan', 'shipping', 'returns', 'tracking'],
  story: ['vegan', 'latex', 'sensitive', 'reuse'],
  shipping: ['shipping', 'tracking', 'returns'],
  contact: ['tracking', 'returns', 'shipping', 'sensitive'],
  category: {
    'strip-lashes': ['reuse', 'longevity', 'curl', 'sensitive', 'removal', 'vegan'],
    clusters: ['longevity', 'curl', 'latex', 'removal', 'reuse', 'sensitive'],
    extensions: ['longevity', 'curl', 'latex', 'removal', 'sensitive', 'reuse'],
    adhesives: ['latex', 'sensitive', 'removal', 'longevity', 'returns', 'vegan'],
    tools: ['reuse', 'removal', 'longevity', 'shipping', 'returns'],
    kits: ['longevity', 'latex', 'removal', 'reuse', 'shipping', 'returns'],
  },
} as const satisfies {
  home: readonly string[];
  shop: readonly string[];
  story: readonly string[];
  shipping: readonly string[];
  contact: readonly string[];
  category: Record<
    'strip-lashes' | 'clusters' | 'extensions' | 'adhesives' | 'tools' | 'kits',
    readonly string[]
  >;
};
