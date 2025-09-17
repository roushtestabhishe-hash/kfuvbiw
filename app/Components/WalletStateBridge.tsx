'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';

/**
 * Keeps local UI state and anything reading localStorage
 * in sync with the real wallet connection (wagmi).
 *
 * Drop this once high in your app so it runs always.
 */
export default function WalletStateBridge() {
  const { address, isConnected, status } = useAccount();

  useEffect(() => {
    // Keep a single source of truth in localStorage (if your UI reads from it)
    if (isConnected && address) {
      localStorage.setItem('evmAddress', address);
      window.dispatchEvent(new Event('evm:connected')); // optional: if any component listens
    } else {
      localStorage.removeItem('evmAddress');
      window.dispatchEvent(new Event('evm:disconnected'));
    }
  }, [address, isConnected, status]);

  return null;
}
