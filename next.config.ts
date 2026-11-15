import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the Turbopack root so a lockfile in a parent folder can't confuse it.
  turbopack: { root: path.resolve(__dirname) },
  images: {
    // The source PNGs are kept untouched on disk; the optimizer serves
    // AVIF/WebP at the right size per device.
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    // The payment pages must never be shown inside another website's frame (clickjacking), and
    // should not be cached or leak their address when the customer follows a link out.
    const protect = [
      { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Cache-Control', value: 'no-store' },
    ];
    return [
      { source: '/pay/:path*', headers: protect },
      { source: '/checkout', headers: protect },
      { source: '/checkout/success', headers: protect },
    ];
  },
};

export default nextConfig;
