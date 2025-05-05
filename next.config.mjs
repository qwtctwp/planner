/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // output: 'export', // Закомментировано для решения проблемы с middleware
  // basePath: '/diploma', // Закомментировано для доступа по адресу http://localhost:3000
  images: {
    unoptimized: true,
  },
};

export default nextConfig; 