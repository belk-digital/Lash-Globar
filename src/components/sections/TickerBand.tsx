import { Marquee } from '@/components/ui/Marquee';
import { Panel } from '@/components/ui/Panel';
import { MARQUEE_PHRASES } from '@/lib/site';

/** Brand-promise ticker: a single ruled strip between the hero and the first product area. */
export function TickerBand() {
  return (
    <Panel aria-label="Brand promises" className="flex h-12 items-center">
      <Marquee items={MARQUEE_PHRASES} className="w-full" />
    </Panel>
  );
}
