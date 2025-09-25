'use client';

import { useEffect, useRef } from 'react';
import type { Connector } from 'wagmi';
import { watchAccount, getAccount, reconnect } from '@wagmi/core';
import { wagmiAdapter } from '@/app/Config';
import { useAppKitAccount } from '@reown/appkit/react';
import { para } from '@/app/lib/para/client'; // your env-based Para client

/** Identify Para connector by id/name (case-insensitive) */
function isParaConnector(conn?: Pick<Connector, 'id' | 'name'> | null | undefined) {
  const id = conn?.id?.toLowerCase?.() || '';
  const name = conn?.name?.toLowerCase?.() || '';
  return id.includes('para') || name.includes('para');
}

/**
 * Connector-aware bridge:
 * - remembers which connector actually connected
 * - only clears Para session when Para was the one that disconnected
 * - avoids blanket cache nukes that break injected flows
 * - keeps a gentle reconnect if AppKit says connected but wagmi hasn't hydrated
 */
export default function WalletStateBridge() {
  const wagmi = wagmiAdapter.wagmiConfig;
  const { isConnected } = useAppKitAccount();

  const lastConnectorRef = useRef<Connector | null>(null);

  useEffect(() => {
    const unwatch = watchAccount(wagmi, {
      onChange(acct) {
        // helpful during testing
        console.info('[WalletStateBridge] account change:', acct.status, acct.address);

        // capture the connector whenever we enter a stable connected state
        if (acct.status === 'connected') {
          // some wagmi core events don't include connector on the acct object
          const current = (getAccount(wagmi) as any).connector as Connector | undefined;
          lastConnectorRef.current = current ?? null;
          return;
        }

        if (acct.status === 'disconnected') {
          // find which connector was last in control
          const last = lastConnectorRef.current ?? (getAccount(wagmi) as any).connector ?? null;
          const wasPara = isParaConnector(last);

          // If PARA was the active connector, do a precise PARA cleanup.
          if (wasPara) {
            try {
              // optional: logout to end any Para-side session
              if (typeof (para as any)?.logout === 'function') {
                (para as any).logout();
              }
            } catch {}

            try {
              // only remove PARA-specific crumbs if you store any
              localStorage.removeItem('para:session');
              localStorage.removeItem('para:user');
            } catch {}
          }

          // IMPORTANT: do NOT blanket-clear wagmi/walletconnect caches here.
          // Injected wallets (MetaMask/Rabby) rely on that cache for persistence.
          // If you want a "hard reset", do it from your explicit Disconnect button, not here.
        }
      },
    });

    return () => unwatch?.();
  }, [wagmi]);

  // If AppKit says connected but wagmi hasn't hydrated yet, gently re-check.
  useEffect(() => {
    const acct = getAccount(wagmi);
    if (isConnected && acct.status !== 'connected') {
      reconnect(wagmi).catch(() => {});
    }
  }, [isConnected, wagmi]);

  return null;
}
