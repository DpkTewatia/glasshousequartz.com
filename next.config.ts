import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Product photography still lives on the Shopify CDN. Next optimises and
    // re-serves it from our own origin, so pages get AVIF/WebP and correct
    // sizing without re-hosting 590 images on day one.
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // catalog.json is read with fs at runtime, so tracing cannot infer it.
  outputFileTracingIncludes: {
    '/**': ['./data/catalog.json'],
  },

  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  async redirects() {
    // The old Brooklyn storefront used these handles. Keep the links that are
    // already indexed and shared working rather than dropping them on 404.
    const map: Record<string, string> = {
      'glasshouse-cups': 'banger-kits',
      'trippy-edition-flattop-collection': 'etched-bangers',
      'glass-house-banger-hanger': 'banger-hangers',
      'glasshouse-banger-hanger': 'banger-hangers',
      'glasshouse-ash-catchers': 'ash-catchers',
      'glasshouse-terp-kits': 'terp-pearls',
      'chris-morgan-exclusives': 'glasshouse',
      'cookies-water-pipes': 'cookies',
      'cookies-rigs': 'cookies',
      'cookies-bangers': 'cookies',
      'cookies-hand-pipes': 'cookies',
      'cookies-bubblers': 'cookies',
      'cookies-bowls': 'cookies',
      'cookies-accessories': 'cookies',
      'cookies-downstems': 'cookies',
      'rigs-1': 'rigs',
      'dab-rigs': 'rigs',
      'frontpage': '',
    };

    return Object.entries(map).map(([from, to]) => ({
      source: `/collections/${from}`,
      destination: to ? `/collections/${to}` : '/',
      permanent: true,
    }));
  },
};

export default nextConfig;
