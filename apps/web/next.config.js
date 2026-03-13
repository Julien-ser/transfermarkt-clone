 /** @type {import('next').NextConfig} */
 const nextConfig = {
   // Performance optimizations
   reactStrictMode: true,
   swcMinify: true,
 
   // Bundle analyzer for performance monitoring
   ...(process.env.ANALYZE === 'true' && {
     webpack: (config, { defaultLoaders, isServer }) => {
       if (!isServer) {
         const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
         config.plugins.push(
           new BundleAnalyzerPlugin({
             analyzerMode: 'static',
             reportFilename: '../bundle-analysis.html',
             openAnalyzer: false,
           })
         );
       }
       return config;
     },
   }),

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
    // Remove console.log in production (except warnings and errors)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features for performance
  experimental: {
    // Optimize package splitting
    optimizePackageImports: ['recharts', 'date-fns'],
    // Server components optimization
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Improve caching
    incrementalCacheHandler: true,
  },

  // Optimize bundle splitting
  webpack: (config, { defaultLoaders, isServer }) => {
    if (!isServer) {
      // Split large dependencies into separate chunks
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
    }

    return config;
  },

  // Static file serving optimization
  staticPageGenerationTimeout: 60,

  // Output standalone for better deployment
  output: 'standalone',

  // Enable turbopack in development for faster builds (optional)
  // turbo: {
  //   resolveAlias: {
  //     '^@/(.*)$': 'apps/web/$1',
  //   },
  // },

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

  // Redirects and rewrites can be added here
};

module.exports = nextConfig;