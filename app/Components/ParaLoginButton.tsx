'use client';

import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { connect } from '@wagmi/core';
import { wagmiAdapter, chains, campMainnet, queryClient } from '@/app/Config';
import { clearParaAll } from '@/app/lib/para/cleanup';

function isParaLike(x?: string) { return (x || '').toLowerCase().includes('para'); }

export default function ParaLoginButton() {
  const { isConnected, connector } = useAccount();
  const [loading, setLoading] = useState(false);

  // hide Para button if an injected wallet is connected (i.e., connected but NOT para)
  const hide = useMemo(() => {
    if (!isConnected) return false;
    const name = (connector?.id || (connector as any)?.name || '').toLowerCase();
    return !name.includes('para');
  }, [isConnected, connector]);

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
        // social/email
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

      // pass the CreateConnectorFn directly
      await connect(wagmiAdapter.wagmiConfig as any, {
        connector: createFn as any,
        chainId: campMainnet.id,
      });
      // success -> do nothing; refresh keeps Para connected

    } catch (err) {
      // user canceled OR any error -> wipe Para so injected can connect next click
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
