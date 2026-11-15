/**
 * WooCommerce payment bridge - server-side helpers. Import ONLY from route handlers / server code;
 * the shared secret must never reach the browser.
 *
 * How the pieces talk (every hop between servers is HMAC-SHA256 signed):
 *
 *   WooCommerce plugin ──signed POST──▶ /api/woo/checkout   (creates the Stripe payment page)
 *   Stripe webhook / /woo/return ─────▶ WooCommerce plugin  (signed "paid" confirmation)
 *   /woo/return ──signed redirect─────▶ WooCommerce "order received" page
 *
 * Signature scheme (must match wordpress-plugin/lg-payment-bridge/includes/class-lgpb-signature.php):
 *   requests:  hex( HMAC_SHA256( secret, `${timestamp}.${rawBody}` ) )   + X-LGPB-Timestamp header
 *   redirects: hex( HMAC_SHA256( secret, `return.${orderId}.${status}.${timestamp}` ) )
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export const WOO_SIGNATURE_HEADER = 'x-lgpb-signature';
export const WOO_TIMESTAMP_HEADER = 'x-lgpb-timestamp';

/** A signed request is rejected when its timestamp is further than this from "now" (seconds). */
export const WOO_MAX_SKEW_SECONDS = 300;

const PLACEHOLDER = /x{3,}/i;

export type WooConfig = {
  secret: string;
  /** WordPress site origin (plus sub-folder, if any), no trailing slash. */
  siteUrl: string;
  /** Where signed "payment confirmed" messages are POSTed. Uses ?rest_route= so it works with any permalink setting. */
  confirmUrl: string;
  /** Base of the WooCommerce return handler (`?wc-api=lgpb_return`). */
  returnUrl: string;
};

export const WOO_NOT_CONFIGURED_MESSAGE =
  'The WooCommerce bridge is not configured. Set WOO_BRIDGE_SECRET and WOO_SITE_URL (see README).';

let warned = false;

/** Reads and validates the bridge settings. Returns `null` (never throws) when they are missing or unsafe. */
export function getWooConfig(): WooConfig | null {
  const secret = process.env.WOO_BRIDGE_SECRET?.trim();
  const site = process.env.WOO_SITE_URL?.trim();
  if (!secret || !site || PLACEHOLDER.test(secret) || PLACEHOLDER.test(site)) return null;

  const problem = (message: string) => {
    if (!warned) {
      warned = true;
      console.error(`[woo-bridge] ${message}`);
    }
    return null;
  };

  if (secret.length < 32) return problem('WOO_BRIDGE_SECRET must be at least 32 characters.');

  let url: URL;
  try {
    url = new URL(site);
  } catch {
    return problem('WOO_SITE_URL is not a valid URL.');
  }

  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname);
  if (url.protocol !== 'https:' && !(isLocal && process.env.NODE_ENV !== 'production')) {
    return problem(
      'WOO_SITE_URL must use https:// (plain http is only allowed for localhost in development).',
    );
  }
  if (url.username || url.password || url.search || url.hash) {
    return problem(
      'WOO_SITE_URL must be a plain address with no credentials, query string or fragment.',
    );
  }

  const siteUrl = `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
  return {
    secret,
    siteUrl,
    confirmUrl: `${siteUrl}/?rest_route=/lgpb/v1/payment-confirmed`,
    returnUrl: `${siteUrl}/?wc-api=lgpb_return`,
  };
}

export const hmacHex = (secret: string, message: string): string =>
  createHmac('sha256', secret).update(message).digest('hex');

/** Constant-time comparison of two hex strings. */
function safeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b.toLowerCase(), 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Verifies a signed server-to-server request (timestamp window + HMAC over `timestamp.body`). */
export function verifySignedRequest(
  secret: string,
  timestamp: string | null,
  signature: string | null,
  rawBody: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  if (!timestamp || !signature || !/^\d{1,12}$/.test(timestamp)) return false;
  if (Math.abs(nowSeconds - Number(timestamp)) > WOO_MAX_SKEW_SECONDS) return false;
  return safeEqualHex(hmacHex(secret, `${timestamp}.${rawBody}`), signature);
}

/**
 * WooCommerce order IDs are positive whole numbers, and the WordPress plugin only accepts digits, so
 * this site accepts exactly that (anything else could create a payment page that can never be confirmed).
 */
export function parseOrderId(value: unknown): string | null {
  const text =
    typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? String(value) : value;
  return typeof text === 'string' && /^[0-9]{1,20}$/.test(text) ? text : null;
}

export type WooConfirmation = {
  event: 'paid' | 'expired';
  order_id: string;
  session_id: string;
  /** Smallest currency unit (cents). */
  amount?: number;
  currency?: string;
  payment_intent?: string;
};

export type WooNotifyResult = {
  ok: boolean;
  status: number;
  /** True when retrying can never help (e.g. WooCommerce has no such order). */
  permanent: boolean;
  detail?: string;
};

/** Sends a signed confirmation to the WooCommerce plugin. Never throws. */
export async function notifyWoo(
  config: WooConfig,
  payload: WooConfirmation,
): Promise<WooNotifyResult> {
  const body = JSON.stringify(payload);
  const timestamp = String(Math.floor(Date.now() / 1000));
  try {
    const response = await fetch(config.confirmUrl, {
      method: 'POST',
      // Never follow a redirect: a signed message must only ever reach the configured address.
      redirect: 'manual',
      cache: 'no-store',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        [WOO_TIMESTAMP_HEADER]: timestamp,
        [WOO_SIGNATURE_HEADER]: hmacHex(config.secret, `${timestamp}.${body}`),
      },
      body,
      signal: AbortSignal.timeout(15_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const to = response.headers.get('location') ?? 'another address';
      return {
        ok: false,
        status: response.status,
        permanent: false,
        detail: `WordPress redirected the confirmation to ${to}. Set WOO_SITE_URL to the site's exact canonical address (check https, and www or not).`,
      };
    }
    const detail = (await response.text().catch(() => '')).slice(0, 300);
    return {
      ok: response.ok,
      status: response.status,
      permanent: response.status === 404 || response.status === 422,
      detail,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      permanent: false,
      detail: error instanceof Error ? error.message : 'request failed',
    };
  }
}

export type WooReturnStatus = 'paid' | 'pending' | 'cancelled';

/**
 * Builds the signed redirect that sends the customer back to WooCommerce.
 * `orderId` is only included for paid/pending (derived from the verified Stripe session);
 * "cancelled" carries no order at all, so it can never be used to look up someone's order.
 */
export function buildReturnRedirect(
  config: WooConfig,
  status: WooReturnStatus,
  orderId: string | null,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const id = status === 'cancelled' ? '' : (orderId ?? '');
  const ts = String(nowSeconds);
  const sig = hmacHex(config.secret, `return.${id}.${status}.${ts}`);
  const params = new URLSearchParams({ status, ts, sig });
  if (id) params.set('order_id', id);
  return `${config.returnUrl}&${params.toString()}`;
}
