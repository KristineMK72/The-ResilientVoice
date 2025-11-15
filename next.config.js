/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["files.printful.com", "printful.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.printful.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};
module.exports = nextConfig;
