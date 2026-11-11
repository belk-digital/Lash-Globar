/** Shape returned by GET /api/checkout/session - shared by the route and the success page. */
export type CheckoutSessionSummary = {
  id: string;
  status: string | null;
  paymentStatus: string;
  currency: string | null;
  customerEmail: string | null;
  /** All amounts are integer cents. */
  amountSubtotal: number | null;
  amountShipping: number | null;
  amountTax: number | null;
  amountTotal: number | null;
  items: { name: string; quantity: number; amountTotal: number }[];
};
