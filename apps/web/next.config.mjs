/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for InfinityFree deployment
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  // Security headers are handled by .htaccess on InfinityFree
  // (Next.js headers() is not available in static export mode)
};

export default nextConfig;
