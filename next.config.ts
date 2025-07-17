import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // This is required by pdfjs-dist
    config.resolve.alias.canvas = false;
    
    // This is required by pdfjs-dist for the worker to be copied to the build output
    config.module.rules.push({
      test: /pdf\.worker\.min\.mjs/,
      type: "asset/resource",
    });

    return config;
  },
};

export default nextConfig;
