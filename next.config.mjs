/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  basePath: '/diploma',
  images: {
    unoptimized: true,
  },
};

export default nextConfig; 