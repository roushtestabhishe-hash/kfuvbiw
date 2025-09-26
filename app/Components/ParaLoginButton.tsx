'use client';

import { useState, useMemo } from 'react';
import { connect } from '@wagmi/core';
import { useAccount } from 'wagmi';
import { wagmiAdapter, chains, campMainnet, queryClient } from '@/app/Config';

function isParaLike(idOrName?: string) {
  const v = idOrName?.toLowerCase?.() || '';
  return v.includes('para');
}

export default function ParaLoginButton() {
  const { connector, status } = useAccount(); // wagmi v2 returns connector & status
  const isConnected = status === 'connected';
  const currentIsPara = useMemo(
    () => isParaLike(connector?.id) || isParaLike(connector?.name),
    [connector]
  );

  // Show Para button only when:
  //  - not connected, OR
  //  - connected via Para
  const showParaButton = !isConnected || currentIsPara;

  const [loading, setLoading] = useState(false);

  if (!showParaButton) return null;

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Lazy-load only on click
      const [{ para }, { paraConnector }] = await Promise.all([
        import('@/app/lib/para/client'),
        import('@getpara/wagmi-v2-integration'),
      ]);

      const createFn = paraConnector({
        para,
        chains: [...chains],
        appName: 'KAZAR',
        logo: '/para.svg',
        queryClient,
        oAuthMethods: ['GOOGLE', 'TWITTER'],
        onRampTestMode: true,
        disableEmailLogin: false,
        disablePhoneLogin: false,
        authLayout: ['AUTH:FULL'],
        recoverySecretStepEnabled: true,
        options: {},
        theme: {
          foregroundColor: '#2D3648',
          backgroundColor: '#FFFFFF',
          accentColor: '#0066CC',
          darkForegroundColor: '#E8EBF2',
          darkBackgroundColor: '#1A1F2B',
          darkAccentColor: '#4D9FFF',
          mode: 'light',
          borderRadius: 'none' as const,
          font: 'Inter',
        },
      });

      // Pass CreateConnectorFn directly (cast for TS generics only)
      await connect(wagmiAdapter.wagmiConfig as any, {
        connector: createFn as any,
        chainId: campMainnet.id,
      });
    } catch (err) {
      console.error('Para login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-4 py-3 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60"
      aria-busy={loading}
    >
      {loading ? 'Connecting…' : 'Login with Para (Email/Social)'}
    </button>
  );
}
