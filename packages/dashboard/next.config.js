/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Ensure we only bind to localhost in development
  hostname: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Configure base path and asset prefix based on environment
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://app.veylaai.com' : undefined,
  // Add headers for security and CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  // Configure rewrites to handle health checks
  async rewrites() {
    return {
      beforeFiles: [
        // Handle ELB health checks
        {
          source: '/api/health',
          has: [
            {
              type: 'header',
              key: 'user-agent',
              value: 'ELB-HealthChecker.*'
            }
          ],
          destination: '/api/health'
        }
      ]
    };
  },
  // Configure redirects for proper domain handling
  async redirects() {
    const appUrl = 'https://app.veylaai.com';
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
