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
}

module.exports = nextConfig
