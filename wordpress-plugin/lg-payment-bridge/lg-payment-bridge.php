<?php
/**
 * Plugin Name:       Card Payment Bridge for WooCommerce
 * Description:       Adds a card payment method. The customer pays on a secure, separately hosted payment page, and the result is confirmed back to WooCommerce with a signed message.
 * Version:           1.2.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Requires Plugins:  woocommerce
 * WC requires at least: 8.0
 * License:           GPL-2.0-or-later
 * Text Domain:       lg-payment-bridge
 *
 * @package LGPB
 */

defined( 'ABSPATH' ) || exit;

define( 'LGPB_VERSION', '1.2.0' );
define( 'LGPB_FILE', __FILE__ );
define( 'LGPB_DIR', plugin_dir_path( __FILE__ ) );
define( 'LGPB_URL', plugin_dir_url( __FILE__ ) );

/** Declare compatibility with High-Performance Order Storage and the block-based checkout. */
add_action(
	'before_woocommerce_init',
	static function () {
		if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', LGPB_FILE, true );
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', LGPB_FILE, true );
		}
	}
);

/** Load the gateway, the confirmation endpoint and the return handler once WooCommerce is available. */
add_action(
	'plugins_loaded',
	static function () {
		if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
			add_action(
				'admin_notices',
				static function () {
					echo '<div class="notice notice-error"><p>' . esc_html__( 'Card Payment Bridge needs WooCommerce to be installed and active.', 'lg-payment-bridge' ) . '</p></div>';
				}
			);
			return;
		}

		require_once LGPB_DIR . 'includes/class-lgpb-signature.php';
		require_once LGPB_DIR . 'includes/class-lgpb-gateway.php';
		require_once LGPB_DIR . 'includes/class-lgpb-rest.php';
		require_once LGPB_DIR . 'includes/class-lgpb-return.php';
		require_once LGPB_DIR . 'includes/class-lgpb-verify.php';

		add_filter(
			'woocommerce_payment_gateways',
			static function ( $methods ) {
				$methods[] = 'LGPB_Gateway';
				return $methods;
			}
		);

		LGPB_Rest::init();
		LGPB_Return::init();
		LGPB_Verify::init();
	},
	11
);

/** Stop the ten-minute payment check when the plugin is deactivated. */
register_deactivation_hook(
	__FILE__,
	static function () {
		wp_clear_scheduled_hook( 'lgpb_recheck_pending' );
	}
);

/** Block-based checkout support. Registered at file load: `woocommerce_blocks_loaded` can fire before `plugins_loaded` ends. */
add_action(
	'woocommerce_blocks_loaded',
	static function () {
		if ( ! class_exists( '\Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType' ) ) {
			return;
		}
		require_once LGPB_DIR . 'includes/class-lgpb-blocks.php';
		add_action(
			'woocommerce_blocks_payment_method_type_registration',
			static function ( $registry ) {
				$registry->register( new LGPB_Blocks_Support() );
			}
		);
	}
);
