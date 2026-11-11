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
};

export default nextConfig;
