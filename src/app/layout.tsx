import type { Metadata, Viewport } from 'next';
import { Archivo, DM_Mono } from 'next/font/google';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/layout/Providers';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { IMAGES } from '@/lib/images';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site';
import './globals.css';

// One family, two voices. Archivo is a variable font with a WIDTH axis: we set it wide + heavy
// for display (echoing the wide-set caps of the logo) and leave it at normal width for text.
// next/font self-hosts it and generates a size-adjusted fallback → no layout shift.
const sans = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-sans',
  display: 'swap',
});

// Micro labels, numbering and spec data only.
const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: IMAGES.hero.main.src, width: 1672, height: 941, alt: IMAGES.hero.main.alt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [IMAGES.hero.main.src],
  },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}${IMAGES.logo.primary.src}`,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        {/* Without JS the reveal masks would leave content hidden - show it. */}
        <noscript>
          <style>
            {'.reveal-word{transform:none!important}.reveal-clip{clip-path:none!important}'}
          </style>
        </noscript>

        <Providers>
          <SmoothScroll />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:bg-ink focus:px-5 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest focus:text-white"
          >
            Skip to content
          </a>

          <AnnouncementBar />

          {/* The canvas. Everything below is a panel inset by --frame, separated by the same gap. */}
          <div className="mx-auto w-full max-w-frame p-frame">
            <Navbar />
            <main id="main" tabIndex={-1} className="pt-frame outline-none">
              {children}
            </main>
            <Footer />
          </div>

          <CartDrawer />
        </Providers>

        <script
          type="application/ld+json"
          // JSON-LD must be a raw string; the data is static and server-built.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
