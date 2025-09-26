'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { connect } from '@wagmi/core';
import { wagmiAdapter, chains, campMainnet, queryClient } from '@/app/Config';
import { clearParaAll } from '@/app/lib/para/cleanup';

export default function ParaLoginButton() {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(false);

  // ✅ hide Para button whenever ANY wallet is connected (injected or Para)
  const hide = isConnected;
  if (hide) return null;

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
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
        disableEmailLogin: false,
        disablePhoneLogin: false,
        authLayout: ['AUTH:FULL'],
        recoverySecretStepEnabled: true,
        options: {},
        theme: {
          mode: 'light',
          foregroundColor: '#2D3648',
          backgroundColor: '#FFFFFF',
          accentColor: '#0066CC',
          darkForegroundColor: '#E8EBF2',
          darkBackgroundColor: '#1A1F2B',
          darkAccentColor: '#4D9FFF',
          borderRadius: 'none' as const,
          font: 'Inter',
        },
      });

      await connect(wagmiAdapter.wagmiConfig as any, {
        connector: createFn as any,
        chainId: campMainnet.id,
      });
      // success: stays connected; button remains hidden

    } catch (err) {
      // user cancelled or failed → clean Para artifacts so injected can connect cleanly
      await clearParaAll();
      console.warn('Para login canceled/failed; cleaned.', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-5 py-3 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
    >
      {loading ? 'Connecting…' : 'Login with Para (Email/Social)'}
    </button>
  );
}
