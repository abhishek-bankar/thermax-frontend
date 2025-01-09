/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "enaibot.frappe.cloud",
        port: "",
        pathname: "/files/**",
        search: "",
      },
      {
        protocol: "http",
        hostname: "enaibot.frappe.cloud",
        port: "",
        pathname: "/files/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "thermaxenaibot.co.in",
        port: "",
        pathname: "/files/**",
        search: "",
      },
      {
        protocol: "http",
        hostname: "thermaxenaibot.co.in",
        port: "",
        pathname: "/files/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "thermaxdomain.com",
        port: "",
        pathname: "/files/**",
        search: "",
      },
      {
        protocol: "http",
        hostname: "thermaxdomain.com",
        port: "",
        pathname: "/files/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "",
        pathname: "/files/**",
        search: "",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/files/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
