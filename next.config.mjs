/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  // Disable ESLint during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;


