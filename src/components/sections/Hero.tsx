import Image from 'next/image';
import Link from 'next/link';
import { AddToBagButton } from '@/components/commerce/AddToBagButton';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/FadeIn';
import { Label } from '@/components/ui/Label';
import { Panel } from '@/components/ui/Panel';
import { RevealImage } from '@/components/ui/RevealImage';
import { RevealText } from '@/components/ui/RevealText';
import { IMAGES } from '@/lib/images';
import { getProduct, productHref } from '@/lib/products';
import { ROUTES } from '@/lib/site';
import { formatPrice } from '@/lib/utils';

/**
 * Home hero - typography first.
 * Row 1: the headline, set full-width in wide heavy caps. Row 2: the close-up photograph beside a
 * copy panel and a shoppable bestseller. The whole block is exactly one screen tall (viewport minus
 * announcement bar, header and the canvas gaps), so it is fully visible without scrolling: the
 * photograph is the flexible part and takes whatever height the headline and copy leave over.
 * On short screens the block grows past one screen rather than crush its content.
 */
export function Hero() {
  const image = IMAGES.hero.main;
  const feature = getProduct('cloud-wisp');

  return (
    <div className="flex min-h-[calc(100svh_-_2.25rem_-_var(--header-h)_-_2px_-_var(--frame)*3)] flex-col gap-frame">
      <Panel
        aria-label="Introduction"
        className="shrink-0 px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-7 lg:px-12 lg:pb-9"
      >
        <div className="flex items-center justify-between gap-6">
          <Label tone="ink">Weightless · Reusable · Vegan</Label>
          <Label className="hidden sm:block">Lash &amp; Extensions</Label>
        </div>
        <RevealText
          as="h1"
          text="Lashes that linger."
          immediate
          // Sized from the measured width of "LASHES THAT LINGER." in the display voice (~13em incl. spaces, tracked):
          //  ≥1025px → exactly one full-width line · 641–1024 → two lines · phones → three stacked lines.
          className="display mt-7 text-[clamp(2.5rem,15.6vw,5rem)] leading-[0.92] tracking-[-0.03em] sm:mt-9 sm:text-[min(10.5vw,9svh)] lg:mt-10 lg:text-[min(calc((min(100vw,2000px)_-_8.5rem)/13.5),9.5rem)]"
        />
      </Panel>

      <div className="flex flex-1 flex-col gap-frame lg:grid lg:min-h-[18rem] lg:grid-cols-12">
        <RevealImage
          src={image.src}
          alt={image.alt}
          sizes="(min-width: 1025px) 58vw, 100vw"
          position={image.position}
          trigger="load"
          preload
          className="min-h-[10rem] flex-1 lg:col-span-7 lg:min-h-0"
        />

        <div className="flex shrink-0 flex-col gap-frame lg:col-span-5 lg:shrink">
          <Panel
            tone="mist"
            className="flex flex-1 flex-col justify-between gap-6 p-5 sm:gap-10 sm:p-8"
          >
            <FadeIn delay={0.5} y={16} className="max-sm:[@media(max-height:899px)]:hidden">
              <p className="max-w-md text-lead">
                Featherlight lashes made for everyday wear. Soft enough to forget, beautiful enough
                to remember.
              </p>
            </FadeIn>
            <FadeIn delay={0.65} y={16}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button href={ROUTES.lashes} size="lg">
                  Shop lashes
                </Button>
                <Button href={ROUTES.extensions} variant="outline" size="lg">
                  Explore extensions
                </Button>
              </div>
            </FadeIn>
          </Panel>

          {feature ? (
            <Panel
              tone="lavender"
              className="hidden p-5 sm:p-6 lg:[@media(min-height:821px)]:block"
            >
              <FadeIn delay={0.8} y={16}>
                <div className="flex items-stretch gap-4">
                  <Link
                    href={productHref(feature)}
                    aria-label={`View ${feature.name}`}
                    className="relative block aspect-[4/5] w-24 shrink-0 overflow-hidden bg-mist sm:w-28"
                  >
                    <Image
                      src={feature.images[0]}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <Label tone="ink">Bestseller</Label>
                      <p className="display mt-2 text-lg leading-none tracking-[-0.01em]">
                        {feature.name}
                      </p>
                      <p className="mt-1.5 text-[0.8125rem] leading-snug">{feature.tagline}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold">{formatPrice(feature.price)}</span>
                      <AddToBagButton productId={feature.id} size="sm" buttonVariant="solid" />
                    </div>
                  </div>
                </div>
              </FadeIn>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
