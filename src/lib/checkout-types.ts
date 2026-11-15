/** Shapes shared by the checkout API routes and the pages that show them. */

/** Returned by POST /api/checkout/intent: what the embedded card form needs. */
export type IntentResponse = {
  clientSecret: string;
  /** All amounts are integer cents, priced on the server from the catalog. */
  subtotal: number;
  shipping: number;
  total: number;
};

/** Returned by GET /api/checkout/order - shown on the "Thank you" page. */
export type CheckoutSummary = {
  id: string;
  /** paid = money received · processing = the bank is still confirming · unpaid = not paid. */
  state: 'paid' | 'processing' | 'unpaid';
  currency: string | null;
  customerEmail: string | null;
  /** All amounts are integer cents. */
  amountSubtotal: number | null;
  amountShipping: number | null;
  amountTotal: number | null;
  items: { name: string; quantity: number; amountTotal: number }[];
};
