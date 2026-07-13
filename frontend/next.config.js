/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images are served straight from the Render backend's /uploads, so we keep
  // them unoptimized — the browser loads them directly (no image optimizer
  // host whitelist needed on Vercel).
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      {
        protocol: process.env.BACKEND_PROTOCOL || 'https',
        hostname: process.env.BACKEND_HOSTNAME || 'localhost',
        pathname: '/uploads/**',
      },
    ],
  },
  compress: true,
};

module.exports = nextConfig;
