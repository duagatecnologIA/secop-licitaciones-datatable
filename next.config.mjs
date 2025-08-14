/** @type {import('next').NextConfig} */
const nextConfig = {
  // Necesario para la construcción optimizada en Docker
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
