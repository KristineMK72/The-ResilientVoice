// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "files.cdn.printful.com",
      "img.printful.com",
      "printful-media.s3.amazonaws.com"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.cdn.printful.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.printful.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "printful-media.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
    unoptimized: true,   // ← THIS IS THE KEY LINE
  },
};

module.exports = nextConfig;
