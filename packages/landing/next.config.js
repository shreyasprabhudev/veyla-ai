/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@veyla/shared'],
  experimental: {
    externalDir: true,
  },
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // This allows client-side routing to work with static export
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // Add cache control headers
  async headers() {
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
