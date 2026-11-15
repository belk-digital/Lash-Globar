<?php
/**
 * Brings the customer back from the payment page.
 *
 *   GET /?wc-api=lgpb_return&status=paid|pending|cancelled&order_id=123&ts=...&sig=...
 *
 * The redirect is signed by the payment service (see LGPB_Signature::verify_return) so it can't be
 * forged. It never completes an order (only the signed confirmation does that); it only decides
 * which page the customer sees:
 *   paid / pending -> the normal "order received" page (the order's own key is added by WooCommerce)
 *   cancelled      -> the checkout page with a notice; the cart is untouched
 * "cancelled" carries no order number, so this URL can't be used to look up anyone's order.
 *
 * @package LGPB
 */

defined( 'ABSPATH' ) || exit;

final class LGPB_Return {

	public static function init() {
		add_action( 'woocommerce_api_lgpb_return', array( __CLASS__, 'handle' ) );
	}

	public static function handle() {
		// Page caches must never store this response.
		if ( ! defined( 'DONOTCACHEPAGE' ) ) {
			define( 'DONOTCACHEPAGE', true );
		}
		nocache_headers();

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- authenticated by the HMAC signature instead.
		$status   = isset( $_GET['status'] ) ? sanitize_key( wp_unslash( $_GET['status'] ) ) : '';
		$order_id = isset( $_GET['order_id'] ) ? sanitize_text_field( wp_unslash( $_GET['order_id'] ) ) : '';
		$ts       = isset( $_GET['ts'] ) ? sanitize_text_field( wp_unslash( $_GET['ts'] ) ) : '';
		$sig      = isset( $_GET['sig'] ) ? sanitize_text_field( wp_unslash( $_GET['sig'] ) ) : '';
		// phpcs:enable

		$secret = LGPB_Gateway::get_secret();
		$valid  = '' !== $secret
			&& in_array( $status, array( 'paid', 'pending', 'cancelled' ), true )
			&& ( 'cancelled' === $status ? '' === $order_id : ctype_digit( $order_id ) )
			&& LGPB_Signature::verify_return( $secret, $order_id, $status, $ts, $sig );

		if ( ! $valid ) {
			wp_safe_redirect( home_url( '/' ) );
			exit;
		}

		if ( 'cancelled' === $status ) {
			if ( function_exists( 'wc_add_notice' ) && function_exists( 'WC' ) && WC()->session ) {
				wc_add_notice( __( 'The card payment was cancelled and you have not been charged. You can try again or choose another payment method.', 'lg-payment-bridge' ), 'notice' );
			}
			wp_safe_redirect( wc_get_checkout_url() );
			exit;
		}

		$order = wc_get_order( (int) $order_id );
		if ( ! $order || 'lgpb' !== $order->get_payment_method() ) {
			wp_safe_redirect( home_url( '/' ) );
			exit;
		}

		// The payment service has confirmed this payment to us. Normally it has also told the shop
		// directly; if that message was blocked on the way in, the order is still unpaid here, so ask
		// the payment service ourselves (shop to payment service, which a firewall does not block).
		if ( in_array( $status, array( 'paid', 'pending' ), true ) && ! $order->is_paid() ) {
			LGPB_Verify::check( $order );
			$order = wc_get_order( (int) $order_id );
		}

		// A paid order: the customer's bag is done with.
		if ( 'paid' === $status && function_exists( 'WC' ) ) {
			if ( ! WC()->cart && function_exists( 'wc_load_cart' ) ) {
				wc_load_cart();
			}
			if ( WC()->cart ) {
				WC()->cart->empty_cart();
			}
		}

		wp_safe_redirect( $order->get_checkout_order_received_url() );
		exit;
	}
}
