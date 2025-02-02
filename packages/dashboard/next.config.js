/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.NODE_ENV === 'production' ? '/dashboard' : '',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: require.resolve('path-browserify'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert'),
        os: require.resolve('os-browserify'),
        zlib: require.resolve('browserify-zlib'),
      };
    }
    return config;
  },
  // Add rewrites for development environment
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          destination: '/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
