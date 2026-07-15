/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // Enforces pure static HTML/CSS/JS compile
  trailingSlash: true,       // Helps Cloudflare Pages direct routing clean URLs
  images: {
    unoptimized: true,       // Next.js Image Optimization is disabled for static export
  },
};

export default nextConfig;