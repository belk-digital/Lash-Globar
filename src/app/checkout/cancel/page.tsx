import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = {
  title: 'Checkout cancelled',
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <PageHeader
      eyebrow="No worries"
      title="Checkout paused"
      intro="You weren’t charged, and everything you picked is still in your bag. Come back whenever you’re ready."
    >
      <div className="flex flex-wrap gap-2">
        <Button href="/cart" size="lg">
          Back to bag
        </Button>
        <Button href="/shop" variant="outline" size="lg">
          Keep shopping
        </Button>
      </div>
    </PageHeader>
  );
}
