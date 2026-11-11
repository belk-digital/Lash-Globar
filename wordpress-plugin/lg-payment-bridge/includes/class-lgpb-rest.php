<?php
/**
 * The protected confirmation endpoint the payment service calls.
 *
 *   POST /?rest_route=/lgpb/v1/payment-confirmed      (also /wp-json/lgpb/v1/payment-confirmed)
 *
 * Every call must carry a valid signature (see LGPB_Signature). The order must exist and must
 * have been placed with THIS payment method, so the endpoint can never complete an order that
 * was paid some other way (Zelle, etc.). Calls are idempotent: repeats never complete an order twice.
 *
 * @package LGPB
 */

defined( 'ABSPATH' ) || exit;

final class LGPB_Rest {

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	public static function register_routes() {
		register_rest_route(
			'lgpb/v1',
			'/payment-confirmed',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'handle' ),
				// Authentication is the HMAC signature, checked inside the callback.
				'permission_callback' => '__return_true',
			)
		);
	}

	private static function reply( $data, $status = 200 ) {
		$response = new WP_REST_Response( $data, $status );
		$response->set_headers( array( 'Cache-Control' => 'no-store' ) );
		return $response;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 */
	public static function handle( $request ) {
		$secret = LGPB_Gateway::get_secret();
		if ( '' === $secret ) {
			return self::reply( array( 'error' => 'not_configured' ), 503 );
		}

		$body = $request->get_body();
		if ( ! LGPB_Signature::verify_request( $secret, $request->get_header( 'x-lgpb-timestamp' ), $request->get_header( 'x-lgpb-signature' ), $body ) ) {
			LGPB_Gateway::log( 'Rejected a confirmation with an invalid or expired signature.', 'error' );
			return self::reply( array( 'error' => 'invalid_signature' ), 401 );
		}

		$data = json_decode( $body, true );
		if ( ! is_array( $data ) || empty( $data['event'] ) || empty( $data['order_id'] ) || ! ctype_digit( (string) $data['order_id'] ) ) {
			return self::reply( array( 'error' => 'invalid_payload' ), 422 );
		}

		$order_id = (int) $data['order_id'];
		$order    = wc_get_order( $order_id );
		if ( ! $order || 'lgpb' !== $order->get_payment_method() ) {
			LGPB_Gateway::log( sprintf( 'Confirmation for order %d ignored: no such order, or it was not placed with this payment method.', $order_id ), 'error' );
			return self::reply( array( 'error' => 'order_not_found' ), 404 );
		}

		// Serialise concurrent confirmations for the same order (the webhook and the customer's
		// return can arrive together). GET_LOCK is released in `finally`.
		// GET_LOCK returns 1 (got it), 0 (timed out), or NULL (unsupported database): in that rare
		// last case carry on without the lock; the paid-check below still makes repeats harmless.
		global $wpdb;
		$lock_name = 'lgpb_order_' . $order_id;
		$previous  = $wpdb->suppress_errors( true );
		$locked    = $wpdb->get_var( $wpdb->prepare( 'SELECT GET_LOCK(%s, 10)', $lock_name ) );
		$wpdb->suppress_errors( $previous );
		if ( null !== $locked && 1 !== (int) $locked ) {
			return self::reply( array( 'error' => 'busy' ), 503 );
		}
		$has_lock = null !== $locked;

		try {
			// Re-read inside the lock so a confirmation that just finished is seen.
			$order = wc_get_order( $order_id );

			switch ( (string) $data['event'] ) {
				case 'paid':
					return self::mark_paid( $order, $data );
				case 'expired':
					if ( ! $order->is_paid() ) {
						$order->add_order_note( __( 'The secure payment page expired without a payment.', 'lg-payment-bridge' ) );
					}
					return self::reply( array( 'status' => 'noted' ) );
				default:
					return self::reply( array( 'error' => 'unknown_event' ), 422 );
			}
		} finally {
			if ( $has_lock ) {
				$wpdb->get_var( $wpdb->prepare( 'SELECT RELEASE_LOCK(%s)', $lock_name ) );
			}
		}
	}

	private static function mark_paid( $order, $data ) {
		if ( $order->is_paid() ) {
			return self::reply( array( 'status' => 'already_paid' ) );
		}

		$expected_cents = (int) round( (float) $order->get_total() * 100 );
		$paid_cents     = isset( $data['amount'] ) ? (int) $data['amount'] : -1;
		$currency       = isset( $data['currency'] ) ? strtoupper( (string) $data['currency'] ) : '';

		// Never complete an order whose paid amount differs from its total (for example if the
		// order was edited after the customer was sent to pay). Hold it for a human to review.
		if ( $paid_cents !== $expected_cents || strtoupper( $order->get_currency() ) !== $currency ) {
			$order->update_status(
				'on-hold',
				sprintf(
					/* translators: 1: paid amount, 2: order total */
					__( 'Card payment received, but the amount (%1$s) does not match the order total (%2$s). Please review before shipping.', 'lg-payment-bridge' ),
					number_format( $paid_cents / 100, 2 ) . ' ' . $currency,
					number_format( $expected_cents / 100, 2 ) . ' ' . strtoupper( $order->get_currency() )
				)
			);
			LGPB_Gateway::log( sprintf( 'Order %d: amount mismatch (paid %d, expected %d). Order put on hold.', $order->get_id(), $paid_cents, $expected_cents ), 'error' );
			return self::reply( array( 'status' => 'mismatch' ) );
		}

		$reference = isset( $data['payment_intent'] ) ? sanitize_text_field( (string) $data['payment_intent'] ) : '';

		// Standard WooCommerce completion: sets the status, reduces stock, and fires the usual
		// hooks, so emails, invoices, affiliate tracking and the thank-you page all behave normally.
		$order->payment_complete( $reference );
		$order->add_order_note(
			'' !== $reference
				/* translators: %s: payment reference */
				? sprintf( __( 'Card payment received. Reference: %s', 'lg-payment-bridge' ), $reference )
				: __( 'Card payment received.', 'lg-payment-bridge' )
		);
		LGPB_Gateway::log( sprintf( 'Order %d marked as paid.', $order->get_id() ) );

		return self::reply( array( 'status' => 'ok' ) );
	}
}
