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
    
    // Fix MetaMask SDK and React Native dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      "node:crypto": false,
      "node:stream": false,
      "@react-native-async-storage/async-storage": false,
      "react-native": false,
      "react-native-fs": false,
      "react-native-webview": false,
    };
    
    // Ignore node-specific and React Native modules
    config.resolve.alias = {
      ...config.resolve.alias,
      "node:crypto": false,
      "node:stream": false,
      "@react-native-async-storage/async-storage": false,
      "react-native": false,
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
    
    // Suppress warnings
    config.ignoreWarnings = [
      /async-storage/,
      /react-native/,
    ];
    
    return config;
  },
};

export default nextConfig;
