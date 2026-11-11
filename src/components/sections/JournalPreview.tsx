import { ArticleCard } from '@/components/journal/ArticleCard';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { HairlineGrid } from '@/components/ui/HairlineGrid';
import { Panel } from '@/components/ui/Panel';
import { SectionHead } from '@/components/ui/SectionHead';
import { ARTICLES } from '@/lib/articles';
import { ROUTES } from '@/lib/site';

/** Three journal articles as ruled cells. */
export function JournalPreview() {
  const articles = ARTICLES.slice(0, 3);
  return (
    <Panel aria-label="From the journal">
      <div className="p-5 pb-8 sm:p-8 sm:pb-10 lg:p-12 lg:pb-12">
        <SectionHead
          label="08 / Journal"
          title="Lash care, simply"
          action={<ArrowLink href={ROUTES.journal}>All articles</ArrowLink>}
        />
      </div>
      <div className="border-t border-ink">
        <HairlineGrid className="grid-cols-1 sm:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} />
            </li>
          ))}
        </HairlineGrid>
      </div>
    </Panel>
  );
}
