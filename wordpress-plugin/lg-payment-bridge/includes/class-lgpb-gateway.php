<?php
/**
 * The WooCommerce payment method.
 *
 * At checkout it sends the order (id, total in cents, USD, billing email) to the payment service
 * in a signed request and redirects the customer to the payment page it returns. The order is
 * completed later, when the service sends the signed confirmation (see LGPB_Rest).
 *
 * @package LGPB
 */

defined( 'ABSPATH' ) || exit;

class LGPB_Gateway extends WC_Payment_Gateway {

	public function __construct() {
		$this->id                 = 'lgpb';
		$this->method_title       = __( 'Card payment (secure payment page)', 'lg-payment-bridge' );
		$this->method_description = __( 'Customers pay by card on a secure, separately hosted page. The order is marked paid when the payment service confirms it.', 'lg-payment-bridge' );
		$this->has_fields         = false;
		$this->supports           = array( 'products' );

		$this->init_form_fields();
		$this->init_settings();

		$this->title       = $this->get_option( 'title' );
		$this->description = $this->get_option( 'description' );
		$this->enabled     = $this->get_option( 'enabled' );

		add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
	}

	public function init_form_fields() {
		$this->form_fields = array(
			'enabled'       => array(
				'title'   => __( 'Enable/Disable', 'lg-payment-bridge' ),
				'type'    => 'checkbox',
				'label'   => __( 'Enable card payments', 'lg-payment-bridge' ),
				'default' => 'no',
			),
			'admin_only'    => array(
				'title'       => __( 'Testing mode', 'lg-payment-bridge' ),
				'type'        => 'checkbox',
				'label'       => __( 'Only show this payment method to logged-in administrators', 'lg-payment-bridge' ),
				'description' => __( 'Ticked: customers and visitors never see it at checkout, so you can test on the live site. Untick it when you are ready to let customers pay by card. You must be logged in as an Administrator to see it while this is ticked.', 'lg-payment-bridge' ),
				'default'     => 'yes',
			),
			'title'         => array(
				'title'       => __( 'Title', 'lg-payment-bridge' ),
				'type'        => 'text',
				'description' => __( 'What customers see at checkout.', 'lg-payment-bridge' ),
				'default'     => __( 'Credit / Debit Card', 'lg-payment-bridge' ),
				'desc_tip'    => true,
			),
			'description'   => array(
				'title'       => __( 'Description', 'lg-payment-bridge' ),
				'type'        => 'textarea',
				'description' => __( 'Shown under the title at checkout.', 'lg-payment-bridge' ),
				'default'     => __( 'You will be taken to a secure page to pay by card.', 'lg-payment-bridge' ),
				'desc_tip'    => true,
			),
			'bridge_url'    => array(
				'title'       => __( 'Payment service address', 'lg-payment-bridge' ),
				'type'        => 'text',
				'description' => __( 'The https:// address of the payment service, for example https://payments.example.com (no trailing slash). Can also be set with LGPB_BRIDGE_URL in wp-config.php.', 'lg-payment-bridge' ),
				'default'     => '',
				'placeholder' => 'https://',
			),
			'shared_secret' => array(
				'title'       => __( 'Shared secret', 'lg-payment-bridge' ),
				'type'        => 'password',
				'description' => __( 'At least 32 characters. Must be identical to WOO_BRIDGE_SECRET on the payment service. For better security, define LGPB_SHARED_SECRET in wp-config.php instead (it overrides this field).', 'lg-payment-bridge' ),
				'default'     => '',
			),
			'debug'         => array(
				'title'       => __( 'Debug log', 'lg-payment-bridge' ),
				'type'        => 'checkbox',
				'label'       => __( 'Log requests and confirmations (WooCommerce, Status, Logs, source lg-payment-bridge). No card data is ever involved.', 'lg-payment-bridge' ),
				'default'     => 'no',
			),
		);
	}

	/** Keep the address tidy: https only, no trailing slash. */
	public function validate_bridge_url_field( $key, $value ) {
		$value = untrailingslashit( trim( (string) $value ) );
		if ( '' === $value ) {
			return '';
		}
		$parts = wp_parse_url( $value );
		if ( ! $parts || empty( $parts['host'] ) || ! in_array( $parts['scheme'] ?? '', array( 'https' ), true ) ) {
			$this->add_error( __( 'The payment service address must be a full https:// address.', 'lg-payment-bridge' ) );
			return '';
		}
		return esc_url_raw( $value, array( 'https' ) );
	}

	public function validate_shared_secret_field( $key, $value ) {
		$value = trim( (string) $value );
		if ( '' !== $value && strlen( $value ) < 32 ) {
			$this->add_error( __( 'The shared secret must be at least 32 characters.', 'lg-payment-bridge' ) );
			return $this->get_option( 'shared_secret' );
		}
		return $value;
	}

	/** The secret: wp-config.php constant first, otherwise the saved setting. */
	public static function get_secret() {
		if ( defined( 'LGPB_SHARED_SECRET' ) && is_string( LGPB_SHARED_SECRET ) && '' !== LGPB_SHARED_SECRET ) {
			return LGPB_SHARED_SECRET;
		}
		$settings = get_option( 'woocommerce_lgpb_settings', array() );
		return is_array( $settings ) && ! empty( $settings['shared_secret'] ) ? (string) $settings['shared_secret'] : '';
	}

	public static function get_bridge_url() {
		if ( defined( 'LGPB_BRIDGE_URL' ) && is_string( LGPB_BRIDGE_URL ) && '' !== LGPB_BRIDGE_URL ) {
			return untrailingslashit( LGPB_BRIDGE_URL );
		}
		$settings = get_option( 'woocommerce_lgpb_settings', array() );
		return is_array( $settings ) && ! empty( $settings['bridge_url'] ) ? untrailingslashit( (string) $settings['bridge_url'] ) : '';
	}

	/**
	 * Testing mode. On by default (also when the setting has never been saved), so a fresh install
	 * stays hidden from customers until someone deliberately unticks the box.
	 */
	public static function admin_only_enabled() {
		$settings = get_option( 'woocommerce_lgpb_settings', array() );
		return ! is_array( $settings ) || ! isset( $settings['admin_only'] ) || 'no' !== $settings['admin_only'];
	}

	/** True when the current visitor may be offered this payment method (everyone, or only administrators in testing mode). */
	public static function visible_to_current_user() {
		if ( ! self::admin_only_enabled() ) {
			return true;
		}
		return is_user_logged_in() && current_user_can( apply_filters( 'lgpb_admin_capability', 'manage_options' ) );
	}

	/** Reminder shown under the payment method while testing mode is on (only administrators can ever see it). */
	public static function admin_only_note() {
		return self::admin_only_enabled() ? __( 'Testing mode: only administrators can see this payment method.', 'lg-payment-bridge' ) : '';
	}

	public static function debug_enabled() {
		$settings = get_option( 'woocommerce_lgpb_settings', array() );
		return is_array( $settings ) && isset( $settings['debug'] ) && 'yes' === $settings['debug'];
	}

	public static function log( $message, $level = 'info' ) {
		if ( 'error' !== $level && ! self::debug_enabled() ) {
			return;
		}
		wc_get_logger()->log( $level, $message, array( 'source' => 'lg-payment-bridge' ) );
	}

	/** Classic checkout: add the testing-mode reminder under the description. */
	public function get_description() {
		$description = parent::get_description();
		$note        = self::admin_only_note();
		return '' === $note ? $description : trim( $description . "\n\n" . $note );
	}

	/**
	 * Only offered when it can actually work (configured, store currency is USD) and, in testing mode,
	 * only to administrators. WooCommerce also uses this to validate the chosen method on submit, so a
	 * hand-crafted checkout request from a customer is refused too.
	 */
	public function is_available() {
		if ( ! parent::is_available() ) {
			return false;
		}
		if ( ! self::visible_to_current_user() ) {
			return false;
		}
		if ( 'USD' !== strtoupper( get_woocommerce_currency() ) ) {
			return false;
		}
		return '' !== self::get_secret() && '' !== self::get_bridge_url();
	}

	/**
	 * Start the payment: ask the payment service for a payment page, then redirect the customer to it.
	 *
	 * @param int $order_id Order ID.
	 * @return array
	 */
	public function process_payment( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			wc_add_notice( __( 'We could not find your order. Please try again.', 'lg-payment-bridge' ), 'error' );
			return array( 'result' => 'failure' );
		}

		$generic_error = __( 'We could not start the card payment. Please try again, or choose another payment method.', 'lg-payment-bridge' );

		if ( 'USD' !== strtoupper( $order->get_currency() ) ) {
			wc_add_notice( $generic_error, 'error' );
			return array( 'result' => 'failure' );
		}

		$secret = self::get_secret();
		$bridge = self::get_bridge_url();
		if ( '' === $secret || '' === $bridge ) {
			self::log( 'Card payments are not configured (missing secret or payment service address).', 'error' );
			wc_add_notice( $generic_error, 'error' );
			return array( 'result' => 'failure' );
		}

		// Smallest currency unit. Order totals have at most 2 decimals, so rounding is exact.
		$amount = (int) round( (float) $order->get_total() * 100 );

		$payload = array(
			'order_id' => (string) $order->get_id(),
			'amount'   => $amount,
			'currency' => 'usd',
		);
		$email = $order->get_billing_email();
		if ( is_email( $email ) ) {
			$payload['email'] = $email;
		}

		$body      = wp_json_encode( $payload );
		$timestamp = (string) time();

		$response = wp_remote_post(
			$bridge . '/api/woo/checkout',
			array(
				'timeout'     => 25,
				'redirection' => 0,
				'headers'     => array(
					'Content-Type'      => 'application/json',
					'Accept'            => 'application/json',
					'X-LGPB-Timestamp'  => $timestamp,
					'X-LGPB-Signature'  => LGPB_Signature::sign( $secret, $timestamp . '.' . $body ),
				),
				'body'        => $body,
			)
		);

		if ( is_wp_error( $response ) ) {
			self::log( sprintf( 'Order %d: could not reach the payment service: %s', $order->get_id(), $response->get_error_message() ), 'error' );
			wc_add_notice( $generic_error, 'error' );
			return array( 'result' => 'failure' );
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		$url  = is_array( $data ) && ! empty( $data['url'] ) ? (string) $data['url'] : '';

		$parts = $url ? wp_parse_url( $url ) : false;
		// https only. (The filter exists for local development with an http test server; do not use it live.)
		$allowed_schemes = apply_filters( 'lgpb_require_https', true ) ? array( 'https' ) : array( 'http', 'https' );
		if ( 200 !== $code || ! $parts || ! in_array( $parts['scheme'] ?? '', $allowed_schemes, true ) || empty( $parts['host'] ) ) {
			$reason = is_array( $data ) && ! empty( $data['error'] ) ? (string) $data['error'] : 'no payment link returned';
			self::log( sprintf( 'Order %d: payment service answered HTTP %d (%s).', $order->get_id(), $code, $reason ), 'error' );
			wc_add_notice( $generic_error, 'error' );
			return array( 'result' => 'failure' );
		}

		// Customers are only ever sent to a payment page ON THE PAYMENT SERVICE'S OWN ADDRESS (the one
		// set as "Payment service address"), never anywhere else, whatever the answer says.
		$bridge_parts = wp_parse_url( $bridge );
		$same_site    = ! empty( $bridge_parts['host'] )
			&& strtolower( $parts['host'] ) === strtolower( $bridge_parts['host'] )
			&& ( $parts['port'] ?? null ) === ( $bridge_parts['port'] ?? null )
			&& 0 === strpos( (string) ( $parts['path'] ?? '' ), '/pay/' );
		if ( ! $same_site ) {
			self::log(
				sprintf(
					'Order %d: refused the payment link because it points to %s, not to the payment service address %s.',
					$order->get_id(),
					$parts['host'],
					$bridge_parts['host'] ?? '?'
				),
				'error'
			);
			wc_add_notice( $generic_error, 'error' );
			return array( 'result' => 'failure' );
		}

		// Remember which payment belongs to this order, so the shop can ask later whether it was paid.
		$payment = is_array( $data ) && ! empty( $data['payment_intent'] ) ? (string) $data['payment_intent'] : '';
		if ( preg_match( '/^pi_[A-Za-z0-9]+$/', $payment ) ) {
			$order->update_meta_data( '_lgpb_payment_intent', $payment );
			$order->save();
		}

		self::log( sprintf( 'Order %d: customer sent to the payment page (%d cents).', $order->get_id(), $amount ) );
		$order->add_order_note( __( 'Customer was sent to the secure card payment page.', 'lg-payment-bridge' ) );

		return array(
			'result'   => 'success',
			'redirect' => $url,
		);
	}
}
