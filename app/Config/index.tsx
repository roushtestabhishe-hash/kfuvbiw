// app/Config/index.ts
'use client';

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { http, cookieStorage, createStorage } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { campMainnet } from './chains'; // tumhara 484 chain export
import { createAppKit } from '@reown/appkit/react';

// ---- ENV ----
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

// ✅ Singletons (do not recreate on re-renders)
export const connectors = [
  injected({
    shimDisconnect: true,        // <-- IMPORTANT
  }),
];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks: [campMainnet],
  connectors,
  transports: {
    [campMainnet.id]: http(campMainnet.rpcUrls.default.http[0]),
  },
  multiInjectedProviderDiscovery: true,  // <-- IMPORTANT
  // Optional: make sure wagmi state survives properly
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : cookieStorage,
  }),
  // autoConnect true helps after refresh
  autoConnect: true,
});

// ---- Reown AppKit init — only once ----
let _appKitInited = false;
if (!_appKitInited) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks: [campMainnet],
    projectId,
    enableInjected: true,
    // (baaki options jo pehle the wo rakh sakte ho)
  });
  _appKitInited = true;
}

// (export queryClient singleton agar use kar rahe ho)
export { queryClient } from './queryClient';
