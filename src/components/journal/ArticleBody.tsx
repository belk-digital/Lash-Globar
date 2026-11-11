import type { ArticleBlock } from '@/lib/articles';

/**
 * Editorial typography for article blocks - a ~680px reading column (set by the parent), generous
 * leading, wide-caps subheads and bold pull-quotes. No italics anywhere.
 */
export function ArticleBody({ blocks }: { blocks: readonly ArticleBlock[] }) {
  return (
    <div className="space-y-6 text-[1.125rem] leading-[1.75] text-ink/85 sm:text-[1.1875rem]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2
                key={i}
                className="display pt-8 text-[clamp(1.375rem,2.4vw,2rem)] leading-[1.02] tracking-[-0.02em] text-ink sm:pt-10"
              >
                {block.text}
              </h2>
            );
          case 'ul':
            return (
              <ul key={i} className="list-[square] space-y-3 pl-6 marker:text-ink">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol
                key={i}
                className="list-decimal space-y-3 pl-6 marker:font-mono marker:text-sm marker:text-ink"
              >
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            );
          case 'quote':
            return (
              <blockquote
                key={i}
                className="statement my-10 border-l-[3px] border-ink bg-mist py-6 pl-6 pr-6 text-[clamp(1.25rem,2.2vw,1.75rem)] text-ink sm:pl-8"
              >
                {block.text}
              </blockquote>
            );
          default:
            return <p key={i}>{block.text}</p>;
        }
      })}
    </div>
  );
}
