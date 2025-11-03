import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      "node:crypto": false,
      "node:stream": false,
    };
    // Ignore node-specific modules
    config.resolve.alias = {
      ...config.resolve.alias,
      "node:crypto": false,
      "node:stream": false,
    };
    return config;
  },
  // Optimize for production
  experimental: {
    optimizePackageImports: ["@radix-ui/react-slot", "lucide-react"],
  },
};

export default nextConfig;
