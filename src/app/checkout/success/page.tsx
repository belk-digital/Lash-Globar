import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CheckoutSuccess } from '@/components/commerce/CheckoutSuccess';
import { Panel } from '@/components/ui/Panel';

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    // CheckoutSuccess reads ?session_id= via useSearchParams → needs Suspense.
    <Suspense fallback={<Panel aria-busy="true" className="h-64 animate-pulse bg-mist" />}>
      <CheckoutSuccess />
    </Suspense>
  );
}
