import { CategoryIndex } from '@/components/sections/CategoryIndex';
import { CurlGuide } from '@/components/sections/CurlGuide';
import { EditorialBand } from '@/components/sections/EditorialBand';
import { FaqSection } from '@/components/sections/FaqSection';
import { FeaturedProducts } from '@/components/sections/FeaturedProducts';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { JournalPreview } from '@/components/sections/JournalPreview';
import { NewsletterPanel } from '@/components/sections/NewsletterPanel';
import { Reviews } from '@/components/sections/Reviews';
import { Statement } from '@/components/sections/Statement';
import { StoryBlock } from '@/components/sections/StoryBlock';
import { TickerBand } from '@/components/sections/TickerBand';
import { FAQ_SETS, faqsById } from '@/lib/faqs';
import { ROUTES } from '@/lib/site';

// Home inherits the title/description from the root layout metadata.
export default function HomePage() {
  return (
    <>
      <Hero />
      <TickerBand />
      <CategoryIndex />
      <FeaturedProducts />
      <Statement />
      <HowItWorks />
      <CurlGuide />
      <EditorialBand
        label="The ritual"
        title="Slow mornings. Soft lashes."
        body="Five minutes, a steady hand and the quiet satisfaction of a finished look. We design every lash to make that moment feel easy."
        cta={{ label: 'Shop clusters', href: ROUTES.extensions }}
      />
      <Reviews />
      <StoryBlock />
      <JournalPreview />
      <FaqSection label="09 / FAQ" items={faqsById(FAQ_SETS.home)} />
      <NewsletterPanel />
    </>
  );
}
