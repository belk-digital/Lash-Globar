<?php
/**
 * Removes the plugin's saved settings when it is deleted from the Plugins screen.
 *
 * @package LGPB
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'woocommerce_lgpb_settings' );
wp_clear_scheduled_hook( 'lgpb_recheck_pending' );
