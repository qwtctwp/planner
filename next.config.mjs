/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  basePath: '/diploma',
  assetPrefix: '/diploma/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig; 