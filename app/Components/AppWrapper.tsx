"use client";

import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";

import { ToastProvider } from "./Toast";
import WalletStateBridge from "./WalletStateBridge"; // same folder
import { wagmiAdapter, queryClient } from "../Config"; // Components -> Config

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {/* keeps app/wallet state fully in sync after reconnects */}
          <WalletStateBridge />
          <div className="min-h-screen bg-gray-50">
            <main>{children}</main>
          </div>
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
