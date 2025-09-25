'use client';

import { useState } from 'react';
import { connect, disconnect, getAccount } from '@wagmi/core';
import { wagmiAdapter, chains, campMainnet, queryClient } from '@/app/Config';

export default function ParaLoginButton() {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1) If another wallet (e.g. MetaMask) is active, confirm before switching to Para
      const current = getAccount(wagmiAdapter.wagmiConfig);
      const currentConnectorId = (current.connector?.id || '').toLowerCase();

      if (current.isConnected && currentConnectorId !== 'para') {
        const ok = window.confirm(
          'You are already connected with another wallet (e.g. MetaMask).\n' +
          'To continue, we will switch the active wallet to Para.\n\nProceed?'
        );
        if (!ok) return;
        // Explicitly disconnect to avoid odd intermediate events
        await disconnect(wagmiAdapter.wagmiConfig);
      }

      // 2) Lazy-load Para + Wagmi connector only when the user confirms
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
          borderRadius: 'none',
          font: 'Inter',
        },
      });

      // 3) Switch to Para (this will become the active Wagmi connector)
      await connect(wagmiAdapter.wagmiConfig as any, {
        connector: createFn as any,
        chainId: campMainnet.id,
      });
    } catch (err) {
      console.error('Para connect aborted/failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
      aria-busy={loading}
    >
      {loading ? 'Opening Para…' : 'Login with Para (Email/Social)'}
    </button>
  );
}
