<?php
/**
 * The shop asks the payment service whether an order was paid.
 *
 * Normally the payment service TELLS the shop (a signed message, see LGPB_Rest). That message travels
 * into the shop from outside, where a firewall, CDN or security plugin can block it. Asking travels
 * the other way (shop to payment service), which is not affected. So a paid order can never be stranded:
 *
 *   1. when the customer comes back from paying (LGPB_Return),
 *   2. automatically every ten minutes for orders still waiting for payment, and
 *   3. on demand: Order actions, "Check card payment status" on the order screen.
 *
 * Every route completes the order with the same safe routine as the signed message.
 *
 * @package LGPB
 */

defined( 'ABSPATH' ) || exit;

final class LGPB_Verify {

	const HOOK = 'lgpb_recheck_pending';

	public static function init() {
		add_filter( 'cron_schedules', array( __CLASS__, 'add_schedule' ) );
		add_action( self::HOOK, array( __CLASS__, 'run_scheduled' ) );
		add_filter( 'woocommerce_order_actions', array( __CLASS__, 'add_order_action' ) );
		add_action( 'woocommerce_order_action_lgpb_check_payment', array( __CLASS__, 'handle_order_action' ) );

		if ( ! wp_next_scheduled( self::HOOK ) ) {
			wp_schedule_event( time() + 300, 'lgpb_ten_minutes', self::HOOK );
		}
	}

	public static function add_schedule( $schedules ) {
		$schedules['lgpb_ten_minutes'] = array(
			'interval' => 600,
			'display'  => __( 'Every ten minutes', 'lg-payment-bridge' ),
		);
		return $schedules;
	}

	/** Orders placed with this method in the last six hours that are still unpaid. */
	public static function run_scheduled() {
		if ( '' === LGPB_Gateway::get_secret() || '' === LGPB_Gateway::get_bridge_url() ) {
			return;
		}
		$orders = wc_get_orders(
			array(
				'status'         => 'pending',
				'payment_method' => 'lgpb',
				'date_created'   => '>' . ( time() - 6 * HOUR_IN_SECONDS ),
				'limit'          => 10,
				'orderby'        => 'date',
				'order'          => 'DESC',
				'return'         => 'objects',
			)
		);
		foreach ( $orders as $order ) {
			self::check( $order );
		}
	}

	public static function add_order_action( $actions ) {
		$order = isset( $GLOBALS['theorder'] ) ? $GLOBALS['theorder'] : null;
		if ( $order instanceof WC_Order && 'lgpb' === $order->get_payment_method() && ! $order->is_paid() ) {
			$actions['lgpb_check_payment'] = __( 'Check card payment status', 'lg-payment-bridge' );
		}
		return $actions;
	}

	/** @param WC_Order $order Order. */
	public static function handle_order_action( $order ) {
		$result = self::check( $order );
		switch ( $result ) {
			case 'paid':
				$note = __( 'Checked the card payment: it was paid and the order has been updated.', 'lg-payment-bridge' );
				break;
			case 'processing':
				$note = __( 'Checked the card payment: the bank is still confirming it. Check again later.', 'lg-payment-bridge' );
				break;
			case 'unpaid':
			case 'canceled':
				$note = __( 'Checked the card payment: no payment has been received for this order.', 'lg-payment-bridge' );
				break;
			case 'skip':
				$note = __( 'Checked the card payment: nothing to check (the order is already paid, or no card payment was started for it).', 'lg-payment-bridge' );
				break;
			default:
				$note = __( 'Checked the card payment: could not reach the payment service. See WooCommerce, Status, Logs, lg-payment-bridge.', 'lg-payment-bridge' );
		}
		$order->add_order_note( $note );
	}

	/**
	 * Ask the payment service about one order and complete it if it was paid.
	 *
	 * @param WC_Order $order Order.
	 * @return string paid | processing | unpaid | canceled | error | skip
	 */
	public static function check( $order ) {
		if ( ! $order instanceof WC_Order || 'lgpb' !== $order->get_payment_method() || $order->is_paid() ) {
			return 'skip';
		}
		$payment = (string) $order->get_meta( '_lgpb_payment_intent' );
		$secret  = LGPB_Gateway::get_secret();
		$bridge  = LGPB_Gateway::get_bridge_url();
		if ( '' === $payment || '' === $secret || '' === $bridge ) {
			return 'skip';
		}

		$body      = wp_json_encode(
			array(
				'order_id'       => (string) $order->get_id(),
				'payment_intent' => $payment,
			)
		);
		$timestamp = (string) time();

		$response = wp_remote_post(
			$bridge . '/api/woo/status',
			array(
				'timeout'     => 20,
				'redirection' => 0,
				'headers'     => array(
					'Content-Type'     => 'application/json',
					'Accept'           => 'application/json',
					'X-LGPB-Timestamp' => $timestamp,
					'X-LGPB-Signature' => LGPB_Signature::sign( $secret, $timestamp . '.' . $body ),
				),
				'body'        => $body,
			)
		);
		if ( is_wp_error( $response ) ) {
			LGPB_Gateway::log( sprintf( 'Order %d: could not ask the payment service for the status: %s', $order->get_id(), $response->get_error_message() ), 'error' );
			return 'error';
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( 200 !== $code || ! is_array( $data ) || empty( $data['status'] ) ) {
			LGPB_Gateway::log( sprintf( 'Order %d: the payment service answered the status check with HTTP %d.', $order->get_id(), $code ), 'error' );
			return 'error';
		}

		$status = (string) $data['status'];
		if ( 'paid' === $status && isset( $data['payment_intent'] ) && $payment === (string) $data['payment_intent'] ) {
			LGPB_Rest::confirm_paid(
				$order->get_id(),
				array(
					'event'          => 'paid',
					'order_id'       => (string) $order->get_id(),
					'amount'         => isset( $data['amount'] ) ? (int) $data['amount'] : -1,
					'currency'       => isset( $data['currency'] ) ? (string) $data['currency'] : '',
					'payment_intent' => $payment,
				)
			);
			return 'paid';
		}
		return in_array( $status, array( 'processing', 'unpaid', 'canceled' ), true ) ? $status : 'error';
	}
}
