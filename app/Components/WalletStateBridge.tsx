'use client';

import { useEffect, useRef } from 'react';
import type { Connector } from 'wagmi';
import {
  watchAccount,
  getAccount,
  getChainId,
  switchChain,
} from '@wagmi/core';
import { wagmiAdapter } from '@/app/Config';
import { useAppKitAccount } from '@reown/appkit/react';

const CAMP_CHAIN_ID = 484;

function isParaConnector(conn?: Pick<Connector, 'id' | 'name'> | null | undefined) {
  const id = conn?.id?.toLowerCase?.() || '';
  const name = conn?.name?.toLowerCase?.() || '';
  return id.includes('para') || name.includes('para');
}

export default function WalletStateBridge() {
  const wagmi = wagmiAdapter.wagmiConfig;
  const { isConnected } = useAppKitAccount();
  const lastConnectorRef = useRef<Connector | null>(null);
  const hasTriedSwitchRef = useRef(false);

  // Watch account and remember which connector actually connected
  useEffect(() => {
    const unwatch = watchAccount(wagmi, {
      onChange(acct) {
        console.info('[WalletStateBridge] account change:', acct.status, acct.address);

        if (acct.status === 'connected') {
          const current = (getAccount(wagmi) as any).connector as Connector | undefined;
          lastConnectorRef.current = current ?? null;

          // If we connected while wallet was on a different network, switch to Camp once.
          const currentChainId = getChainId(wagmi);
          if (currentChainId !== CAMP_CHAIN_ID && !hasTriedSwitchRef.current) {
            hasTriedSwitchRef.current = true;
            switchChain(wagmi, { chainId: CAMP_CHAIN_ID }).catch(() => {
              // ignore; user can manually approve later
            });
          }

          return;
        }

        if (acct.status === 'disconnected') {
          // IMPORTANT: do not blanket-clear wagmi / WC caches here.
          // Also do not call para.logout() on generic disconnect.
          // Only do explicit cleanup from your own "Disconnect" button if needed.
          hasTriedSwitchRef.current = false;
        }
      },
    });

    return () => unwatch?.();
  }, [wagmi]);

  // If AppKit says connected but wagmi hasn't hydrated yet, just wait.
  // (No aggressive reconnect here to avoid thrash.)
  useEffect(() => {
    // no-op on purpose; keeping this effect lets us easily add logic if needed later
  }, [isConnected]);

  return null;
}
