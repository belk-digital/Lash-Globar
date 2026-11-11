<?php
/**
 * Makes the payment method appear in the block-based checkout.
 * Loaded only when WooCommerce Blocks is available (see the main plugin file).
 *
 * @package LGPB
 */

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

final class LGPB_Blocks_Support extends AbstractPaymentMethodType {

	/** Must equal the gateway id. */
	protected $name = 'lgpb';

	public function initialize() {
		$this->settings = get_option( 'woocommerce_lgpb_settings', array() );
	}

	public function is_active() {
		return 'yes' === $this->get_setting( 'enabled', 'no' )
			&& LGPB_Gateway::visible_to_current_user()
			&& 'USD' === strtoupper( get_woocommerce_currency() )
			&& '' !== LGPB_Gateway::get_secret()
			&& '' !== LGPB_Gateway::get_bridge_url();
	}

	public function get_payment_method_script_handles() {
		wp_register_script(
			'lgpb-blocks',
			LGPB_URL . 'assets/blocks.js',
			array( 'wc-blocks-registry', 'wc-settings', 'wp-element', 'wp-html-entities' ),
			LGPB_VERSION,
			true
		);
		return array( 'lgpb-blocks' );
	}

	public function get_payment_method_data() {
		return array(
			'title'       => $this->get_setting( 'title', __( 'Credit / Debit Card', 'lg-payment-bridge' ) ),
			'description' => $this->get_setting( 'description', '' ),
			'note'        => LGPB_Gateway::admin_only_note(),
			'supports'    => array( 'products' ),
		);
	}
}
