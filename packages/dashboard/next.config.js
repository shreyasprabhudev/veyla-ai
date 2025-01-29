/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    // Server Actions are now stable in Next.js 14
    // serverActions: true,
  },
  // Ensure proper hostname handling
  hostname: '0.0.0.0',
  port: process.env.PORT || 3000,
  // Configure base path and asset prefix based on environment
  basePath: '',
  assetPrefix: process.env.NEXT_PUBLIC_APP_URL,
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

    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?!app\\.veylaai\\.com).*',
          },
        ],
        destination: `${appUrl}/:path*`,
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
