'use client';

import { useState } from 'react';
import { connect } from '@wagmi/core';
import { wagmiAdapter, chains, campMainnet, queryClient } from '@/app/Config';

export default function ParaLoginButton() {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      // Lazy-load only on click
      const [{ para }, { paraConnector }] = await Promise.all([
        import('@/app/lib/para/client'),
        import('@getpara/wagmi-v2-integration'),
      ]);

      // Build a CreateConnectorFn for Para
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

      // ✅ pass the CreateConnectorFn directly to wagmi connect
// ✅ pass the CreateConnectorFn directly, but cast to satisfy TS generics
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
      className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-900"
      aria-busy={loading}
    >
      {loading ? 'Connecting…' : 'Login with Para (Email/Social)'}
    </button>
  );
}
