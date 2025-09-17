'use client';

import { useEffect, useRef } from 'react';
import { watchAccount, getAccount, reconnect } from '@wagmi/core';
import { wagmiAdapter } from '@/app/Config';

export default function WalletStateBridge() {
  const wagmi = wagmiAdapter.wagmiConfig;
  const justMounted = useRef(true);

  useEffect(() => {
    const unwatch = watchAccount(wagmi, {
      onChange(acct) {
        console.info('[WalletStateBridge] account change:', acct.status, acct.address, acct.chainId);

        // Hydration ke first tick par kuch mat karo (connect→disconnect flicker avoid)
        if (justMounted.current) {
          justMounted.current = false;
          return;
        }

        // Rare edge case: connected state hai par address undefined—soft reconnect
        if (acct.status === 'connected' && !acct.address) {
          reconnect(wagmi).catch(() => {});
        }
      },
    });

    return () => unwatch?.();
  }, [wagmi]);

  // State touch for hydration; koi storage wipe/auto-disconnect nahi
  useEffect(() => {
    getAccount(wagmi);
  }, [wagmi]);

  return null;
}
