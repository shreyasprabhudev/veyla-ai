/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  basePath: '/dashboard',
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['@mlc-ai/web-llm'],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/dashboard',
          destination: '/dashboard/',
          basePath: false
        }
      ]
    };
  },
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
        zlib: require.resolve('browserify-zlib'),
        os: require.resolve('os-browserify'),
      };
    }

    // Add aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/components': './components',
      '@/app': './app',
      '@/lib': './lib'
    };

    // Ensure proper module resolution
    config.resolve.modules = ['node_modules', '.'];
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
