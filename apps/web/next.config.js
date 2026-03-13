/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Image optimization
  images: {
    domains: ['via.placeholder.com', 'placehold.co', 'upload.wikimedia.org'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['recharts', 'date-fns'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Optimize bundle splitting and provide fallbacks for Node modules
  webpack: (config, { isServer }) => {
    // Add bundle analyzer if ANALYZE is true
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: '../bundle-analysis.html',
          openAnalyzer: false,
        })
      );
    }

    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'chunk-recharts',
            priority: 20,
            chunks: 'async',
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'chunk-vendors',
            priority: 10,
            chunks: 'async',
          },
        },
      };
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        net: false,
        dns: false,
        tls: false,
        fs: false,
        child_process: false,
        crypto: false,
        dgram: false,
        readline: false,
        repl: false,
        vm: false,
        http: false,
        https: false,
        zlib: false,
        buffer: false,
        util: false,
        path: false,
        module: false,
      };
    }
    return config;
  },

  // Output standalone for better deployment
  output: 'standalone',

  // Static file serving optimization
  staticPageGenerationTimeout: 60,

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
