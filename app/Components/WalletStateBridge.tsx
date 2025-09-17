'use client';

import { useEffect } from 'react';
import { watchAccount, getAccount, disconnect, reconnect } from '@wagmi/core';
import { wagmiAdapter } from '@/app/Config'; // your wagmi config lives here
import { useAppKitAccount } from '@reown/appkit/react';

/**
 * Small invisible bridge that:
 *  - watches account changes
 *  - forces a hard cleanup of caches when user disconnects
 *  - triggers a reconnect when user opens the modal again
 */
export default function WalletStateBridge() {
  const wagmi = wagmiAdapter.wagmiConfig;
  const { isConnected } = useAppKitAccount();

  useEffect(() => {
    const unwatch = watchAccount(wagmi, {
      onChange(acct) {
        // Useful log while debugging
        console.info('[WalletStateBridge] account change:', acct.status, acct.address);

        if (acct.status === 'disconnected') {
          // 1) make absolutely sure wagmi thinks we’re disconnected
          try {
            disconnect(wagmi).catch(() => {});
          } catch {}

          // 2) clear any cached sessions that can block re-connects
          try {
            // Wagmi store flags
            localStorage.removeItem('wagmi.store');
            localStorage.removeItem('wagmi.connected');

            // WalletConnect v2 caches (keys start with "wc@")
            Object.keys(localStorage)
              .filter((k) => k.startsWith('wc@'))
              .forEach((k) => localStorage.removeItem(k));

            // Para / Reown possible auth crumbs (safe to ignore if not present)
            Object.keys(localStorage)
              .filter((k) => k.toLowerCase().includes('para') || k.toLowerCase().includes('reown'))
              .forEach((k) => localStorage.removeItem(k));
          } catch {}

          // 3) tiny pause lets the UI flush before next action
          // (no reload needed)
          setTimeout(() => {
            // Optionally trigger a soft reconnect next render if user
            // opens the modal again. We keep it no-op until they do.
          }, 50);
        }
      },
    });

    return () => unwatch?.();
  }, [wagmi]);

  // Optional: whenever React re-renders and wallet says “connected” but wagmi
  // didn’t hydrate yet, nudge wagmi to re-check (cheap & safe)
  useEffect(() => {
    const acct = getAccount(wagmi);
    if (isConnected && acct.status !== 'connected') {
      reconnect(wagmi).catch(() => {});
    }
  }, [isConnected, wagmi]);

  return null;
}
