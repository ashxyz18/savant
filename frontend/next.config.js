/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hostinger "Web Hosting" (shared) is Apache-only and cannot run `next start`.
  // We export a fully static site and upload the `out/` folder to public_html.
  output: 'export',
  // Apache serves index.html for "/path/" directory requests, so trailing
  // slashes keep the SPA URLs working without a Node server.
  trailingSlash: true,
  images: {
    // No image optimization server on static hosting -> emit plain <img>.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
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
