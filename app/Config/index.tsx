"use client";

import { defineChain, http } from "viem";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import type { CreateConnectorFn } from "wagmi";
import { QueryClient } from "@tanstack/react-query";

import { paraConnector } from "@getpara/wagmi-v2-integration";
import { para } from "@/app/lib/para/client";

/** ✅ NEW: add wagmi injected connectors (no UI change by itself) */
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

/** WC Metadata (use your real production domain) */
const metadata = {
  name: "KAZAR Games",
  description: "KAZAR on Camp Network",
  url: "https://camp.metakraft.live",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

/** Para (Passkey/Social) connector for wagmi v2 */
const paraWagmiConnector = paraConnector({
  para,
  chains: [...chains],
  appName: "KAZAR",
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

/**
 * ✅ FINAL connectors list:
 * - Keep PARA (Reown flow) exactly as-is
 * - Add injected connectors so MetaMask/Rabby are available to wagmi
 *   (we’ll expose these via a separate RainbowKit button)
 */
const connectors: CreateConnectorFn[] = [
  paraWagmiConnector as CreateConnectorFn,
  injected({ target: "metaMask" }),
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

/** AppKit init (modal)
 *  ✅ Note: we explicitly disable AppKit’s injected UI
 *  to avoid the recent instability. Injected wallets will be offered
 *  through a separate RainbowKit button (next step), while this modal
 *  stays focused on Para/social.
 */
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
  enableInjected: false, // ⬅️ was true: keep AppKit clean/stable
  enableCoinbase: false,
  allowUnsupportedChain: false,
});

// ⛔️ No default Providers export here.
// App-level providers live in app/Components/AppWrapper.tsx
