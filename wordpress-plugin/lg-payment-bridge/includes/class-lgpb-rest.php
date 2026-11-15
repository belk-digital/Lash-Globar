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
 * The same completion routine (confirm_paid) is used when the shop asks the payment service whether
 * an order was paid (see LGPB_Verify), so both routes behave identically.
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

		switch ( (string) $data['event'] ) {
			case 'paid':
				$status = self::confirm_paid( $order_id, $data );
				if ( 'busy' === $status ) {
					return self::reply( array( 'error' => 'busy' ), 503 );
				}
				if ( 'not_found' === $status ) {
					return self::reply( array( 'error' => 'order_not_found' ), 404 );
				}
				return self::reply( array( 'status' => $status ) );
			case 'expired':
				if ( ! $order->is_paid() ) {
					$order->add_order_note( __( 'The secure payment page expired without a payment.', 'lg-payment-bridge' ) );
				}
				return self::reply( array( 'status' => 'noted' ) );
			default:
				return self::reply( array( 'error' => 'unknown_event' ), 422 );
		}
	}

	/**
	 * Completes an order from a payment confirmation. Safe to call repeatedly and concurrently.
	 *
	 * @param int   $order_id Order ID.
	 * @param array $data     { amount (cents), currency, payment_intent }.
	 * @return string ok | already_paid | duplicate_payment | mismatch | busy | not_found
	 */
	public static function confirm_paid( $order_id, $data ) {
		// Serialise concurrent confirmations for the same order (the webhook, the customer's return and
		// the shop's own check can arrive in the same instant). The lock is a unique row in the options
		// table: the INSERT IGNORE pattern WordPress core itself uses, which works the same on every
		// database. It is released in `finally`.
		$lock_name = 'lgpb_order_' . (int) $order_id;
		if ( ! self::acquire_row_lock( $lock_name ) ) {
			return 'busy';
		}

		try {
			// Re-read inside the lock so a confirmation that just finished is seen.
			$order = wc_get_order( (int) $order_id );
			if ( ! $order || 'lgpb' !== $order->get_payment_method() ) {
				return 'not_found';
			}
			return self::mark_paid( $order, $data );
		} finally {
			self::release_row_lock( $lock_name );
		}
	}

	/** A mutex built on a unique row (the same INSERT IGNORE pattern WordPress itself uses for its update lock). */
	private static function acquire_row_lock( $name ) {
		global $wpdb;
		$option = $name . '_rowlock';
		for ( $i = 0; $i < 20; $i++ ) {
			$got = $wpdb->query( $wpdb->prepare( "INSERT IGNORE INTO `$wpdb->options` ( `option_name`, `option_value`, `autoload` ) VALUES (%s, %s, 'no') /* LGPB LOCK */", $option, (string) time() ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			if ( $got ) {
				return true;
			}
			// A lock left behind by a crashed request is taken over after a minute.
			$taken = (int) $wpdb->get_var( $wpdb->prepare( "SELECT option_value FROM `$wpdb->options` WHERE option_name = %s", $option ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			if ( $taken && time() - $taken > 60 ) {
				$wpdb->delete( $wpdb->options, array( 'option_name' => $option ) );
				continue;
			}
			usleep( 500000 );
		}
		return false;
	}

	private static function release_row_lock( $name ) {
		global $wpdb;
		$wpdb->delete( $wpdb->options, array( 'option_name' => $name . '_rowlock' ) );
	}

	private static function mark_paid( $order, $data ) {
		$reference = isset( $data['payment_intent'] ) ? sanitize_text_field( (string) $data['payment_intent'] ) : '';
		$recorded  = (string) $order->get_transaction_id();

		// The very same payment delivered again (the webhook and the customer's return both send it,
		// and Stripe retries): always harmless, whatever the order's status is now.
		if ( '' !== $reference && $reference === $recorded ) {
			return 'already_paid';
		}

		if ( $order->is_paid() ) {
			// A DIFFERENT payment for an order that is already paid means the customer paid twice (for
			// example from two open payment pages). WooCommerce keeps the first payment; flag the extra
			// one so it is refunded instead of silently ignored. Noted once per payment.
			if ( '' !== $reference && '' !== $recorded ) {
				$seen = $order->get_meta( '_lgpb_extra_payments', true );
				$seen = is_array( $seen ) ? $seen : array();
				if ( ! in_array( $reference, $seen, true ) ) {
					$seen[] = $reference;
					$order->update_meta_data( '_lgpb_extra_payments', $seen );
					$order->add_order_note(
						sprintf(
							/* translators: 1: extra payment reference, 2: amount, 3: the reference already recorded */
							__( 'A second card payment (%1$s, %2$s) was received for this order, which was already paid (%3$s). Refund the extra payment in the Stripe Dashboard.', 'lg-payment-bridge' ),
							$reference,
							isset( $data['amount'] ) ? number_format( (int) $data['amount'] / 100, 2 ) . ' ' . strtoupper( (string) ( $data['currency'] ?? '' ) ) : '?',
							$recorded
						)
					);
					$order->save();
					LGPB_Gateway::log( sprintf( 'Order %d: a second payment (%s) arrived for an already paid order. Refund it in Stripe.', $order->get_id(), $reference ), 'error' );
				}
				return 'duplicate_payment';
			}
			return 'already_paid';
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
			return 'mismatch';
		}

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

		return 'ok';
	}
}
