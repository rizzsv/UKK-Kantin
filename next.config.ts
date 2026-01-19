import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ukk-p2.smktelkom-mlg.sch.id',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
