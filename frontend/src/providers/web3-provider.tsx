"use client";

import { ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";
import { defineChain } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// Define Mezo Testnet
export const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MEZO_RPC_URL || "https://rpc.test.mezo.org"],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_MEZO_RPC_URL || "https://rpc.test.mezo.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mezo Explorer",
      url: "https://explorer.test.mezo.org",
    },
  },
  testnet: true,
});

// Create wagmi config
const config = getDefaultConfig({
  appName: "SourcePay",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "845fb350ba83d50180234b4f77a4455a",
  chains: [mezoTestnet],
  ssr: false,
});

export function Web3Provider({ children }: { children: ReactNode }) {
  // Create QueryClient inside component to avoid SSR issues
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#ffffff",
            accentColorForeground: "#000000",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
