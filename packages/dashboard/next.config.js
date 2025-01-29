/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Configure base path and asset prefix based on environment
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : '',
  // Handle domain-specific configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Configure redirects for proper domain handling
  async redirects() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) return [];

    const appUrlObj = new URL(appUrl);
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: `(?!${appUrlObj.host.replace('.', '\\.')}).*`,
          },
        ],
        destination: `${appUrl}/:path*`,
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
