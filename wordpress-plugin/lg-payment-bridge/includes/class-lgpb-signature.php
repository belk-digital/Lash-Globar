<?php
/**
 * HMAC-SHA256 signing shared with the payment service (src/lib/woo-bridge.ts).
 *
 * Requests: hex( HMAC_SHA256( secret, "{timestamp}.{rawBody}" ) ) plus an X-LGPB-Timestamp header.
 * Redirects: hex( HMAC_SHA256( secret, "return.{orderId}.{status}.{timestamp}" ) ).
 *
 * @package LGPB
 */

defined( 'ABSPATH' ) || exit;

final class LGPB_Signature {

	/** Signed requests older (or newer) than this many seconds are rejected. */
	const TOLERANCE = 300;

	/** Signed customer redirects may be a little older, as people can be slow on the payment page. */
	const RETURN_TOLERANCE = 1800;

	public static function sign( $secret, $message ) {
		return hash_hmac( 'sha256', $message, $secret );
	}

	/** Verify a signed server-to-server request. */
	public static function verify_request( $secret, $timestamp, $signature, $body ) {
		if ( ! is_string( $timestamp ) || ! ctype_digit( $timestamp ) || strlen( $timestamp ) > 12 ) {
			return false;
		}
		if ( ! is_string( $signature ) || '' === $signature ) {
			return false;
		}
		if ( abs( time() - (int) $timestamp ) > self::TOLERANCE ) {
			return false;
		}
		return hash_equals( self::sign( $secret, $timestamp . '.' . $body ), strtolower( $signature ) );
	}

	/** Verify the signed redirect that brings the customer back from the payment page. */
	public static function verify_return( $secret, $order_id, $status, $timestamp, $signature ) {
		if ( ! is_string( $timestamp ) || ! ctype_digit( $timestamp ) || strlen( $timestamp ) > 12 ) {
			return false;
		}
		if ( ! is_string( $signature ) || '' === $signature ) {
			return false;
		}
		if ( abs( time() - (int) $timestamp ) > self::RETURN_TOLERANCE ) {
			return false;
		}
		$message = 'return.' . $order_id . '.' . $status . '.' . $timestamp;
		return hash_equals( self::sign( $secret, $message ), strtolower( $signature ) );
	}
}
