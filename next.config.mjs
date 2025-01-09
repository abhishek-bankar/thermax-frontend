/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "enaibot.frappe.cloud",
      },
      {
        protocol: "http",
        hostname: "enaibot.frappe.cloud",
      },
      {
        protocol: "https",
        hostname: "thermaxenaibot.co.in",
      },
      {
        protocol: "http",
        hostname: "thermaxenaibot.co.in",
      },
      {
        protocol: "https",
        hostname: "thermaxdomain.com",
      },
      {
        protocol: "http",
        hostname: "thermaxdomain.com",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
