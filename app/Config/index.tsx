"use client";

import { defineChain, http } from "viem";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { paraConnector } from "@getpara/wagmi-v2-integration";
import { para } from "../lib/para/client";
import type { CreateConnectorFn } from "wagmi";
import { QueryClient } from "@tanstack/react-query";

/** ---------- CAMP MAINNET (Basecamp) ---------- */
export const campMainnet = defineChain({
  id: 484, // ✅ official mainnet
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

/** Networks visible in AppKit modal */
export const chains = [campMainnet] as const;

/** WalletConnect Project ID (set in env for prod) */
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set");
}

/** React Query client */
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
});

/** Metadata (set your real domain here to avoid WC redirect warning) */
const metadata = {
  name: "Reown AppKit Example",
  description: "Reown AppKit with Next.js and Wagmi",
  url: "https://camp.metakraft.live", // ← change if your deployed URL differs
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

/** Para connector (wagmi v2) */
const connector = paraConnector({
  para,
  chains: [...chains],
  appName: "Reown AppKit with Para",
  logo: "/para.svg",
  queryClient,
  oAuthMethods: ["GOOGLE", "TWITTER"],
  theme: {
    foregroundColor: "#2D3648",
    backgroundColor: "#FFFFFF",
    accentColor: "#0066CC",
    darkForegroundColor: "#E8EBF2",
    darkBackgroundColor: "#1A1F2B",
    darkAccentColor: "#4D9FFF",
    mode: "light",
    borderRadius: "none" as const,
    font: "Inter",
  },
  onRampTestMode: true,
  disableEmailLogin: false,
  disablePhoneLogin: false,
  authLayout: ["AUTH:FULL"],
  recoverySecretStepEnabled: true,
  options: {},
});

const connectors: CreateConnectorFn[] = [connector as CreateConnectorFn];

/** Wagmi adapter + RPC transports (locked to CAMP RPC) */
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [...chains] as [AppKitNetwork, ...AppKitNetwork[]],
  projectId,
  connectors,
  transports: {
    [campMainnet.id]: http(campMainnet.rpcUrls.default.http[0]),
  },
});

/** AppKit init */
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
  enableInjected: true,
  enableCoinbase: false,
  allowUnsupportedChain: false,
});
