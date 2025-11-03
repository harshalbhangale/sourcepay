import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Performance optimizations to reduce CPU usage
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Reduce memory usage
  experimental: {
    optimizePackageImports: ["@radix-ui/react-slot", "lucide-react"],
  },
  webpack: (config, { dev }) => {
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
    
    // Optimize for development performance
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
