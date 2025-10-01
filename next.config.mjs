/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  // Disable static generation to avoid useSearchParams issues
  output: 'standalone',
};

export default nextConfig;


