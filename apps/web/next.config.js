/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_CARDANO_NETWORK: process.env.NEXT_PUBLIC_CARDANO_NETWORK || 'testnet',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
  
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;