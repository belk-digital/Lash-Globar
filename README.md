# Lash Globar

A premium lash & lash-extension storefront.
Next.js 16 (App Router) · TypeScript · Tailwind CSS 3 · Framer Motion · Lenis · Zustand · Stripe Checkout.

No database: the catalog lives in [`src/lib/products.ts`](src/lib/products.ts), journal articles in
[`src/lib/articles.ts`](src/lib/articles.ts), and the cart in the browser (Zustand + `localStorage`).

---

## Quick start

```bash
npm install
cp .env.example .env.local      # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev                     # http://localhost:3000
```

The site runs with **zero errors and no Stripe keys** — checkout simply shows a clear
"Checkout is not configured yet" toast until you add test keys (below).

| Script                                    | What it does                                      |
| ----------------------------------------- | ------------------------------------------------- |
| `npm run dev`                             | Dev server (Turbopack)                            |
| `npm run build` / `npm start`             | Production build / serve it                       |
| `npm run lint`                            | ESLint (flat config, `eslint-config-next`)        |
| `npm run typecheck`                       | `tsc --noEmit`                                    |
| `npm run format` / `npm run format:check` | Prettier (with the Tailwind class-sorting plugin) |

Requires Node ≥ 20.9.

> **Dev-server quirk:** Tailwind v3's JIT sometimes doesn't see _new_ classes added while
> `npm run dev` is running under Turbopack. If a freshly-added class does nothing, restart the dev
> server. Production builds are unaffected.

---

## Design direction — "composed canvas"

The site is built as a set of rectangles on a white canvas, not a scroll of centred sections.

- **Panels.** The header, hero, product areas and footer are discrete panels inset from the viewport by
  one `--frame` (12 / 16 / 20px by breakpoint) and separated by that same gap, so the white canvas
  reads as a consistent margin. Sections run the full width of the frame — there is no max-width column.
- **Hard edges.** Square corners everywhere (the Tailwind radius scale is zeroed), 1px hairlines, flat
  fills, no shadows, no gradients. Product areas are ruled sheets (`HairlineGrid`), not floating cards.
- **Palette.** White canvas · `#F7F4FB` mist panels · `#D4C4EC` lavender blocks (announcement bar,
  promise, newsletter, CTAs) · ink `#2C142C`, sampled from the logo artwork itself.
- **Type.** One family, two voices. **Archivo** is a variable font with a _width_ axis: set wide
  (114%), heavy (800) and uppercase for display — echoing the wide-set caps of the logo — and left at
  normal width for text. **DM Mono** is used only for micro-labels, numbering and spec data. There is
  no italic anywhere (a global guard in `globals.css` forces `font-style: normal`).
- **Hero.** The headline is the hero: sized from its measured width so it spans the panel on one line
  at ≥1025px, two lines on tablet, three on phones.
- **Contrast.** Primary text is AAA (ink on white 16.9:1, on lavender 10.4:1); secondary text
  (`ink-soft` `#6B5F73`) is AA (6.0:1 on white, 5.5:1 on mist).

References studied: rhodeskin.com (inset composition, oversized type, tinted product tiles) and
global.typology.com (square corners, hairline-divided product cells, uppercase grotesk + mono labels),
plus lash-category conventions from Velour and Lilly Lashes (format-first navigation, styles
communicated as spec text).

### Motion (each one earns its place)

| Where          | What                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Headlines      | Line-masked reveal: words rise from behind a mask, staggered word-by-word and line-by-line (measured)  |
| Photographs    | "Shutter" clip-path wipe + settle from a slight over-scale (CSS-driven, so the hero never waits on JS) |
| Hairlines      | Section rules draw in from the left                                                                    |
| The promise    | Words ink in as you scroll (scroll-scrubbed; reverses on scroll up)                                    |
| Buttons        | Fill wipes up from the base and the label rolls on hover                                               |
| Header         | Tucks away on scroll down, returns on scroll up; "Shop" opens a category mega-menu                     |
| Category index | Hovering a row wipes that category's photograph into a pinned stage                                    |
| Product cards  | 2+ images → crossfade; 1 image → slow zoom; add-to-bag bar rises from the photograph's foot            |
| Overlays       | Menu, search and drawers open with a shutter / slide; Lenis smooth scroll site-wide                    |
| Pages          | Content eases in on every navigation (CSS-only `template.tsx`)                                         |

`prefers-reduced-motion` disables Lenis, the marquee, the headline mask, the image shutter and the
scroll-scrubbed text. To switch Lenis off: `NEXT_PUBLIC_SMOOTH_SCROLL=false`, or remove
`<SmoothScroll />` from `layout.tsx`.

---

## Environment variables

| Variable                             | Purpose                                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`               | Absolute origin — used for metadata, sitemap, JSON-LD, and Stripe success/cancel/image URLs   |
| `STRIPE_SECRET_KEY`                  | Server-only Stripe key (`sk_test_…`)                                                          |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key. Not used yet — hosted Checkout redirects, so no Stripe.js is needed          |
| `STRIPE_WEBHOOK_SECRET`              | Signing secret from `stripe listen` / the Stripe dashboard (`whsec_…`)                        |
| `WOO_BRIDGE_SECRET` _(opt.)_         | 32+ character shared secret for the WooCommerce bridge (must match the WordPress plugin)      |
| `WOO_SITE_URL` _(opt.)_              | The WooCommerce site, `https://` only (`http://localhost` allowed in dev). Enables the bridge |
| `NEXT_PUBLIC_CONTACT_EMAIL` _(opt.)_ | Inbox the `/contact` form opens a `mailto:` to (default `hello@lashglobar.com`)               |
| `NEXT_PUBLIC_SMOOTH_SCROLL` _(opt.)_ | `false` disables Lenis smooth scrolling site-wide                                             |

> **`NEXT_PUBLIC_*` values are inlined at build time.** Set `NEXT_PUBLIC_SITE_URL` to your real
> domain _before_ `npm run build` / deploying, or canonical URLs, the sitemap and Stripe redirect
> URLs will point at localhost.
>
> The `…_xxx` placeholder values from `.env.example` are detected as "not configured", so the
> Stripe routes return a friendly 503 instead of crashing.

---

## Stripe setup & testing

1. Create a free Stripe account and switch to **Test mode**. Copy the keys from
   _Developers → API keys_ into `.env.local` (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
2. Restart `npm run dev` (env files are read at startup).
3. Add something to the bag → **Checkout** (or **Buy now** on a product page). You're redirected
   to Stripe-hosted Checkout. Pay with a test card:

   | Card                  | Result                        |
   | --------------------- | ----------------------------- |
   | `4242 4242 4242 4242` | Succeeds                      |
   | `4000 0025 0000 3155` | Requires 3-D Secure           |
   | `4000 0000 0000 9995` | Declined (insufficient funds) |

   Any future expiry, any CVC, any postcode.

4. You land on `/checkout/success?session_id=…`, which fetches the order summary from
   `/api/checkout/session`, shows items + total, and clears the cart. **Cancel** returns to
   `/checkout/cancel` with the bag intact.

### Webhook (logs completed orders to the console)

```bash
# Install the Stripe CLI, then:
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a signing secret (`whsec_…`) — put it in `STRIPE_WEBHOOK_SECRET` and restart the
dev server. Complete a test payment and the terminal running `npm run dev` prints a
`✨ NEW ORDER` block with the customer, shipping address, line items and totals. You can also
trigger one with `stripe trigger checkout.session.completed`.

The handler verifies the signature against the **raw** request body (`runtime = 'nodejs'`),
and returns 500 on processing errors so Stripe retries. To fulfil orders for real, replace
`logOrder()` in [`src/app/api/webhooks/stripe/route.ts`](src/app/api/webhooks/stripe/route.ts).

### How checkout stays safe

`POST /api/checkout` accepts only `{ id, quantity, variant }[]`. Names and prices are looked up
**server-side** from `products.ts` — a client-supplied price is never read. IDs, quantities
(1–10), variant options and line count are validated before Stripe is called. Shipping
(US / CA / GB / AU / IN) is a flat $5.99, free over $60 (`FLAT_SHIPPING_CENTS` in the route and
`FREE_SHIPPING_THRESHOLD` in `src/lib/site.ts`) — edit both to match your real rates.

---

## WooCommerce payment bridge

Lets a WooCommerce store take card payments through **this site's Stripe account**. The customer
pays on a Stripe-hosted page that shows one line, **Order #<number>**, quantity 1, for the order total.
Nothing about the products is sent to Stripe.

```
WooCommerce checkout ──(1) signed POST──▶  /api/woo/checkout      creates the Stripe payment page
        ▲                                         │
        │                                         ▼ (2) customer pays on the Stripe page
(5) signed redirect                         Stripe ──(3) webhook──▶ /api/webhooks/stripe
        │                                                              │
   /woo/return ◀──(4) Stripe sends the customer back                   │ (3b) signed "paid" message
        │                                                              ▼
        └──────── also sends the signed "paid" message ───────▶  WooCommerce plugin completes the order
```

Every hop between the two servers is signed with HMAC-SHA256 using a shared secret and a timestamp
(5 minute window), so neither side can be impersonated or replayed.

### What Stripe sees

- One line item: **`Order #<woo order id>`**, quantity 1, the order total in USD. No product names, SKUs or descriptions.
- Metadata: **only** `woo_order_id` (on the Checkout Session and on the PaymentIntent).
- Return links (`success_url` / `cancel_url`) point at **this** site (`/woo/return`); the customer is then redirected on to WordPress.
- The customer's email is prefilled so their receipt goes to the right address.
- The **card statement descriptor is untouched**: whatever is set in the Stripe dashboard applies.

### Set up

1. In `.env.local` (and your host's environment): `WOO_BRIDGE_SECRET` (`openssl rand -hex 32`) and `WOO_SITE_URL`
   (the WordPress site's exact canonical address, https, no trailing slash). Without them the bridge routes answer 503.
2. In Stripe, on the **same** webhook endpoint (`/api/webhooks/stripe`) enable:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`.
   Events that carry `woo_order_id` are forwarded to WordPress; this store's own orders are never touched by that path.
3. Install the WordPress plugin from [`wordpress-plugin/lg-payment-bridge/`](wordpress-plugin/lg-payment-bridge/README.md)
   (zip the folder), set the same secret and this site's address, enable it. **Try it on a staging copy first.**
   To test on the live site, leave **Testing mode** ticked (the default): the method is then shown only to logged-in
   Administrators. Untick it to open it to customers.
4. If Cloudflare / a security plugin blocks the calls, follow the "If your host or security plugins block it" notes in the plugin README.

### Behaviour worth knowing

- The WooCommerce order is completed **only** by the signed confirmation, never by the customer landing on a URL. The plugin
  also checks that the order was placed with this payment method and that the paid amount and currency equal the order total
  (otherwise the order goes **On hold**). Repeated confirmations are harmless.
- If WordPress is unreachable when a payment completes, the webhook returns 500 and Stripe retries for days. `/woo/return` also
  sends the confirmation when the customer comes back, so whichever arrives first wins.
- A cancelled return carries **no** order number, so it can't be used to look up someone's order.
- If a customer pays **twice** for one order (for example from two open payment pages after the total was edited), WooCommerce
  keeps the first payment and adds one order note: "A second card payment (...) was received ... Refund the extra payment in the
  Stripe Dashboard." Look for that note.
- Stripe's **Adaptive Pricing** (Dashboard, Settings, Payments, Adaptive pricing) shows visitors outside the US their local currency
  with a conversion fee. The order is still charged and confirmed as the USD total. Turn it off in Stripe if you want every
  customer to see dollars only.
- USD only. Refunds are not synced (refund in Stripe, then record it in WooCommerce).
- Metadata `woo_order_id` is the WooCommerce order **ID**; it equals the order number unless a sequential-order-number plugin is added.

### Compliance reminder

Processing another site's payments on this Stripe account needs Stripe's written approval, which the client reports having.
Keep it on file, and make sure the WooCommerce store is registered with Stripe the way that approval requires.
WooCommerce keeps the itemised order, so send customers an itemised receipt and keep it as dispute evidence: Stripe only sees
the order number and total.

### Testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe     # prints the whsec_ for STRIPE_WEBHOOK_SECRET
```

Place a test order on a staging WooCommerce site with the Stripe **test** keys here, pay with `4242 4242 4242 4242`, and check the
order turns **Processing** with a "Card payment received" note. A quick local setup without a real WordPress host:
[WordPress Playground](https://wordpress.org/playground/) can run WooCommerce plus the plugin folder from the command line.

---

## Image mapping (as implemented)

All imagery is referenced through the typed manifest [`src/lib/images.ts`](src/lib/images.ts)
(`IMAGES`) — components never hardcode a path. Images use `next/image` (`fill` + `sizes` +
`object-cover`) with a per-image `object-position` so eyes, faces and products are never cropped out on
mobile. The uncropped files are **moved and renamed only** — not resized, compressed or converted.

| File                                 | Role                                                                                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `hero/hero-main.png`                 | Home hero photograph (face left; `24% 55%`) · default Open Graph image                                                                         |
| `hero/hero-trio.png`                 | Home "For everyone" band · Our Story lead image                                                                                                |
| `sections/category-strip-lashes.png` | Category index + mega-menu (Strip lashes) · 2nd image on strip products                                                                        |
| `sections/category-extensions.png`   | Category index (Clusters) · 2nd image on cluster products · cluster-vs-strip article cover                                                     |
| `products/strip-lash-case.png`       | Cloud Wisp, Soft Volume, Night Out · hero bestseller                                                                                           |
| `products/cluster-tray.png`          | Everyday/Volume Clusters, Pro Extension Trays · category index (Extensions)                                                                    |
| `products/adhesive-bottle.png`       | Featherlight Bond, Seal & Hold, Gentle Remover · category index (Adhesives)                                                                    |
| `products/applicator.png`            | Precision Applicator, Lash Lift Comb · category index (Tools)                                                                                  |
| `products/kit-flatlay.png`           | Both kits · category index (Kits) · "Pairs well with" visual                                                                                   |
| `products/travel-case.png`           | Travel Case · "reuse" article cover                                                                                                            |
| `sections/editorial-chiffon.png`     | "The ritual" band (home) and "Craft" band (Our Story)                                                                                          |
| `sections/steps/step-1…4.png`        | How it works — **cropped** from the 2×2 tutorial image                                                                                         |
| `sections/lifestyle-cafe.png`        | Reviews portrait (`40% 22%`)                                                                                                                   |
| `journal/journal-1…3.png`            | Journal covers — **cropped** from the 3-panel collage. `journal-2` also feeds the C/D curl guide and the shop's editorial cell                 |
| `sections/newsletter-petals.png`     | Newsletter panel · 404 page                                                                                                                    |
| `assets-source/statement-velvet.png` | **Unused.** The dark plum velvet belonged to the old dark statement section; the lighter redesign doesn't use it, so it sits outside `public/` |

**Crops** ([`scripts/crop-images.mjs`](scripts/crop-images.mjs), lossless PNG extracts): the tutorial
(1254²) → four 623×528 panels with the baked-in step pills trimmed off; the collage (1536×1024) →
`journal-1` flat lay, `journal-2` C-curl vs D-curl, `journal-3` wide lifestyle. The two original
composites are kept in `assets-source/` (outside `public/`, never served).

**Journal covers** (5 articles, 3 crops): care → `journal-1` · curl → `journal-2` ·
cluster-vs-strip → `category-extensions` · removal → `journal-3` · reuse → `travel-case`.

> The photography is the weakest link of the design: several images are generated, low-resolution
> crops (the C/D comparison is 766×508). For a truly agency-grade result, commission or generate
> higher-resolution replacements — especially a macro lash set, an on-model campaign set and a
> consistent product packshot set — and drop them into the same paths.

### Logo

The supplied artwork is `public/images/lash_globar_logo.webp` (dark aubergine on transparent, with ~11%
empty padding). It is left untouched; [`scripts/make-logo-variants.mjs`](scripts/make-logo-variants.mjs)
derives lossless WebP variants in `public/images/logo/` — crops only, nothing redrawn — exposed as
`IMAGES.logo.*`:

| Variant   | File                | Used for                                                                      |
| --------- | ------------------- | ----------------------------------------------------------------------------- |
| `primary` | `logo-primary.webp` | Full lockup (swoosh + LASH GLOBAR + LASH & EXTENSIONS) — Organization JSON-LD |
| `compact` | `logo-compact.webp` | Swoosh + name, tagline removed — header, menu, footer                         |

The compact version exists because the tagline in the full lockup is an unreadable speck at header size
(~4px). To use the full lockup in the header instead, point `Wordmark.tsx` at `IMAGES.logo.primary`.
The script also writes the favicon and touch icon (`src/app/icon.png`, `apple-icon.png`: the swoosh on
ink). If you replace the logo file, re-run `node scripts/make-logo-variants.mjs`.

---

## Project structure

```
src/
├─ app/                      # App Router
│  ├─ page.tsx               # Home (hero + 11 sections)
│  ├─ template.tsx           # page-enter animation
│  ├─ shop/                  # /shop and /shop/[category]
│  ├─ products/[slug]/       # PDP (+ Product JSON-LD)
│  ├─ cart/ · checkout/{success,cancel}/
│  ├─ our-story/ · journal/[slug]/ · faq/ · shipping-returns/ · contact/
│  ├─ api/checkout/ · api/checkout/session/ · api/webhooks/stripe/ · api/newsletter/
│  ├─ api/woo/checkout/ · woo/return/     # WooCommerce payment bridge
│  └─ not-found.tsx · sitemap.ts · robots.ts · icon.png · apple-icon.png · layout.tsx · globals.css
├─ components/
│  ├─ layout/    Navbar, MegaMenu, MobileMenu, SearchOverlay, CartDrawer, AnnouncementBar, Footer,
│  │             Wordmark, SmoothScroll, Providers
│  ├─ ui/        Panel, Label/Tag, Button, ArrowLink, Rule, HairlineGrid, SectionHead, PageHeader,
│  │             RevealText, RevealImage, ScrollFillText, FadeIn, ParallaxImage, Marquee, Accordion,
│  │             Stars, QuantityStepper, Toast, StickyPanel, Loader
│  ├─ commerce/  ProductCard, ProductGrid, ProductGallery, VariantSelector, AddToBagButton, PurchasePanel,
│  │             BenefitTable, CartLineItem, OrderSummary, CartView, CheckoutSuccess,
│  │             ShopBrowser, Filters, SortSelect, ShopSkeleton
│  ├─ sections/  Hero, TickerBand, CategoryIndex, FeaturedProducts, Statement, HowItWorks, CurlGuide,
│  │             EditorialBand, Reviews, StoryBlock, JournalPreview, NewsletterPanel, NewsletterForm, ContactForm
│  └─ journal/   ArticleCard, ArticleBody
├─ hooks/        use-overlay (focus trap · Esc · scroll lock), use-checkout
└─ lib/          images.ts (manifest) · products.ts · articles.ts · cart-store.ts · shop-filters.ts
                 stripe.ts · woo-bridge.ts · checkout-client.ts · site.ts · motion.ts · utils.ts
scripts/{crop-images,make-logo-variants}.mjs      assets-source/      public/images/{…,logo/}
wordpress-plugin/lg-payment-bridge/              # the WooCommerce plugin (not part of the Next.js build)
```

Tokens live in `tailwind.config.ts` and as CSS variables in `globals.css` (keep both in sync). The
button, display, label and link styles are component classes in `globals.css`; button variant names are
written out in full in `Button.tsx` (Tailwind can't see class names built with template strings).

---

## Before you launch — replace the placeholders

- **Ratings & review counts** (`products.ts`), **reviews** (`Reviews.tsx`): illustrative only. Replace with
  real reviews, or remove `aggregateRating` from the product JSON-LD.
- **Founder story, values and timeline** (`our-story/page.tsx`), **FAQ**, **shipping & returns policy**,
  **journal articles**: written as realistic placeholders — have them reviewed.
- **Social links** (`SOCIAL_LINKS` in `src/lib/site.ts`) point at platform home pages.
- **Contact email** defaults to `hello@lashglobar.com`.
- **Shipping rates** (flat $5.99 / free over $60) are examples — match your real rates.
- **Newsletter** signups are validated and logged by `/api/newsletter`; connect your ESP there.
- The header **Account** link shows a "coming soon" notice (guest checkout only).

---

## Notes

- Products with variants (Everyday Clusters, Pro Extension Trays) show **Choose options** on cards
  instead of "Add to bag", so a customer never gets a default length or curl by accident.
- The PDP's sticky panel measures itself, so a panel taller than the viewport scrolls naturally
  until its bottom is visible and then pins — there is never hidden/clipped content.
- Next.js `next dev` writes an `AGENTS.md` into the project root; it's harmless and safe to commit.
