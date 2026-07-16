/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  images: { unoptimized: true },
  trailingSlash: true,
  // The API lives on a separate FastAPI Cloud deployment. Set this at build
  // time (Cloudflare Pages -> Settings -> Variables and secrets) to the
  // backend's base URL, e.g. https://your-app.fastapicloud.dev
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  },
};

module.exports = nextConfig;
