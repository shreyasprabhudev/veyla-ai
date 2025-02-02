/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/dashboard/:path*',
          destination: '/dashboard/.next/:path*',
        },
      ],
    };
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
