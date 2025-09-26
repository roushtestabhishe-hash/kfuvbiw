'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { clearParaAll } from '@/app/lib/para/cleanup';

function isParaLike(x?: string) { return (x || '').toLowerCase().includes('para'); }

export default function WalletStateBridge() {
  const { status, connector } = useAccount();
  const last = useRef<{ status?: string; wasPara?: boolean }>({});

  useEffect(() => {
    const nowIsPara =
      isParaLike(connector?.id) || isParaLike((connector as any)?.name);

    // when we *leave* para (status -> disconnected) clean its side-effects
    if (status === 'disconnected' && last.current?.wasPara) {
      clearParaAll();
    }

    last.current = { status, wasPara: nowIsPara };
  }, [status, connector]);

  return null;
}
