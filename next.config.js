/** @type {import('next').NextConfig} */
module.exports = {
  basePath: '',
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
};
