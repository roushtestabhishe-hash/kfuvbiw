"use client";

import { defineChain, http } from "viem";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import type { CreateConnectorFn } from "wagmi";
import { QueryClient } from "@tanstack/react-query";

/** Injected connector (MetaMask) */
import { injected } from "wagmi/connectors";

/** ---------- CAMP MAINNET ---------- */
export const campMainnet = defineChain({
  id: 484,
  name: "Camp Mainnet",
  network: "camp-mainnet",
  nativeCurrency: { name: "Camp", symbol: "CAMP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.camp.raas.gelato.cloud"],
      webSocket: ["wss://ws.camp.raas.gelato.cloud"],
    },
    public: {
      http: ["https://rpc.camp.raas.gelato.cloud"],
      webSocket: ["wss://ws.camp.raas.gelato.cloud"],
    },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://camp.cloud.blockscout.com/" },
  },
} as const);

export const chains = [campMainnet] as const;

/** WalletConnect Project ID */
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set");
}

/** React Query client (shared) */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

/** WC Metadata */
const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://bhaigazzab.vercel.app";

const metadata = {
  name: "KAZAR Games",
  description: "KAZAR on Camp Network",
  url: siteUrl,
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

/** Final connectors: ONLY injected by default */
const connectors: CreateConnectorFn[] = [
  injected({ target: "metaMask", shimDisconnect: true }),
];

/** Wagmi adapter (locks RPC to CAMP) */
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks: [...chains] as [AppKitNetwork, ...AppKitNetwork[]],
  connectors,
  transports: {
    [campMainnet.id]: http(campMainnet.rpcUrls.default.http[0]),
  },
});

/** AppKit (Reown) init — injected wallets only */
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [...chains] as [AppKitNetwork, ...AppKitNetwork[]],
  projectId,
  metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
    emailShowWallets: false,
  },
  themeMode: "light",
  enableInjected: true,      // show MetaMask/Rabby/etc
  enableCoinbase: false,
  allowUnsupportedChain: true
});

// Providers live in app/Components/AppWrapper.tsx
