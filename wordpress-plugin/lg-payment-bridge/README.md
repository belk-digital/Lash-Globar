# Card Payment Bridge for WooCommerce

Adds a **Credit / Debit Card** payment method to WooCommerce. At checkout the customer is sent to a
secure payment page hosted by the payment service (the Lash Globar site). When they pay, the service
sends a **signed confirmation** to this plugin, which completes the order the normal WooCommerce way.

Works with the classic checkout (`[woocommerce_checkout]`) and the block checkout, with HPOS on or off.
USD stores only. No card data ever touches WordPress.

## Install (use a staging copy first, and back up the live site)

1. Zip this folder as `lg-payment-bridge.zip` (the zip must contain the `lg-payment-bridge/` folder),
   then _Plugins, Add New, Upload Plugin_, **Activate**.
2. _WooCommerce, Settings, Payments, Card payment (secure payment page)_:
   - **Payment service address**: the https address of the payment service, for example
     `https://payments.example.com` (no trailing slash).
   - **Shared secret**: 32+ random characters. It must be **identical** to `WOO_BRIDGE_SECRET` on the payment
     service. Generate one with `openssl rand -hex 32`.
   - Tick **Enable card payments**.
   - Leave **Testing mode** ticked (it is on by default) while you test on the live site: the payment
     method is then shown **only to logged-in Administrators**. Customers and visitors never see it.
   - Save.
3. Prefer keeping the secret out of the database? Put these in `wp-config.php` (they override the fields):
   ```php
   define( 'LGPB_SHARED_SECRET', 'the-same-32-plus-character-secret' );
   define( 'LGPB_BRIDGE_URL', 'https://payments.example.com' );
   ```
4. Place a test order while logged in as an Administrator (Stripe test mode on the payment service) and
   check the order moves to _Processing_ with a "Card payment received" note.
5. When you are happy, go back to the payment settings, **untick Testing mode** and save. From then on
   every customer sees the method. (Switch Stripe from test to live keys on the payment service first.)

## Testing mode (admin only)

While **Testing mode** is ticked, the card method is offered only to a logged-in user who can
`manage_options` (an Administrator). Everyone else, including Shop Managers, guests and customers, does
not see it, and WooCommerce also refuses it if someone tries to submit it anyway. The administrator sees a
"Testing mode" reminder under the method at checkout.

- Log in as an Administrator in the **same browser** you use to check out. A private window where you are
  not logged in will not show the method.
- Orders placed in testing mode are real orders. Use a real low-value product, or cancel and refund them.
- The signed confirmation from the payment service and the customer return page do **not** depend on
  testing mode, so a test payment always completes correctly.
- To allow Shop Managers too, add this to a snippet or `functions.php`:
  `add_filter( 'lgpb_admin_capability', fn() => 'manage_woocommerce' );`

## What it does and does not do

- Sends the payment service only: the **order number**, the **total in cents**, **USD**, and the billing
  **email** (so the customer's receipt goes to the right address). No products, SKUs or addresses.
- Marks an order paid **only** from a correctly signed confirmation, only for orders placed with this
  payment method, and only if the paid amount and currency equal the order total (otherwise the order
  goes **On hold** with a note). Repeated confirmations are harmless.
- The customer's return trip (`/?wc-api=lgpb_return`) is also signed. It only chooses which page to
  show: the normal _Order received_ page, or back to checkout if they cancelled. It never completes an
  order by itself.
- Uses WooCommerce's own `payment_complete()`, so stock, emails, PDF invoices, affiliate tracking and the
  Thank You page plugin all react as usual.
- **Refunds are not automated** (version 1). Refund in the Stripe dashboard, then record it in WooCommerce.

## If your host or security plugins block it

The payment service calls this site at:
`https://YOUR-SITE/?rest_route=/lgpb/v1/payment-confirmed` (a signed `POST`).

- **Cloudflare**: add a WAF custom rule that **Skips** bot/security checks when the URI query contains
  `rest_route=/lgpb/v1/payment-confirmed`. Do the same for `wc-api=lgpb_return` (customer redirects, a `GET`).
- **Solid Security**: if _Restrict REST API access_ or similar is on, allow the `lgpb/v1` namespace.
- **WP Rocket / page caches**: exclude URLs containing `wc-api=lgpb_return` (the plugin also sends
  no-cache headers).
- Debug problems with _Debug log_ ticked on the payment settings, then _WooCommerce, Status, Logs_
  (source `lg-payment-bridge`).
