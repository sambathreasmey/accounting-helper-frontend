/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  images: { unoptimized: true },
  trailingSlash: true,
  
  // Dev Only
  // allowedDevOrigins: [
  //   'crushable-ambiance-foothold.ngrok-free.dev', 
  //   '*.ngrok-free.dev'
  // ],

  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  },
};

module.exports = nextConfig;
