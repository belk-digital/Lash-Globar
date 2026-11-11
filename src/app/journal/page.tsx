import type { Metadata } from 'next';
import { ArticleCard } from '@/components/journal/ArticleCard';
import { HairlineGrid } from '@/components/ui/HairlineGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { ARTICLES } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Lash care, curl guides and how-tos from Lash Globar. Quiet, useful advice for wearing, removing and reusing your lashes.',
  alternates: { canonical: '/journal' },
};

export default function JournalPage() {
  const [lead, ...rest] = ARTICLES;
  return (
    <>
      <PageHeader
        eyebrow="Journal"
        meta={`${ARTICLES.length} articles`}
        title="The journal"
        intro="Quiet, useful notes on wearing, caring for and reusing your lashes."
      />
      <Panel>
        <div className="border-b border-ink">
          <ArticleCard article={lead} size="large" />
        </div>
        <HairlineGrid className="grid-cols-1 sm:grid-cols-2">
          {rest.map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} sizes="(min-width: 641px) 50vw, 100vw" />
            </li>
          ))}
        </HairlineGrid>
      </Panel>
    </>
  );
}
