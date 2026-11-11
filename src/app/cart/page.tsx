import type { Metadata } from 'next';
import { CartView } from '@/components/commerce/CartView';

export const metadata: Metadata = {
  title: 'Your bag',
  description: 'Review the items in your bag and check out securely with Stripe.',
  robots: { index: false, follow: true },
};

export default function CartPage() {
  // CartView renders its own title band so the heading can reflect the empty / filled state.
  return <CartView />;
}
