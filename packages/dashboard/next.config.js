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
  // Ensure Next.js knows about the base URL
  assetPrefix: process.env.NEXT_PUBLIC_APP_URL,
  // Handle rewrites to ensure proper URL handling
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(.*)',
            },
          ],
          destination: '/:path*',
        },
      ],
    };
  },
}

module.exports = nextConfig
