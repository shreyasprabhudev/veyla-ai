/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    return [];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
