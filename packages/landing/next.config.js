/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // This allows client-side routing to work with static export
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};
