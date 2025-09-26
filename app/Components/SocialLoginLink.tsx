'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { connect } from '@wagmi/core';
import { wagmiAdapter, chains, campMainnet, queryClient } from '@/app/Config';

type Props = { className?: string; label?: string };

export default function SocialLoginLink({ className = '', label = 'SocialLogin' }: Props) {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(false);

  // Hide when any wallet (Para or Injected) is already connected
  if (isConnected) return null;

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Lazy-load Para only when clicked
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

      // Pass CreateConnectorFn directly (cast to satisfy TS generics)
      await connect(wagmiAdapter.wagmiConfig as any, {
        connector: createFn as any,
        chainId: campMainnet.id,
      });
    } catch (err) {
      // User closed/cancelled or any error -> clean up Para side-effects
      try {
        const { para: p } = await import('@/app/lib/para/client');
        // logout() is safe even if not logged in
        await (p as any)?.logout?.();
      } catch {}
      try {
        localStorage.removeItem('para:session');
        localStorage.removeItem('para:user');
      } catch {}
      console.error('Para login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={
        'text-sm font-semibold underline decoration-dotted underline-offset-4 hover:opacity-80 transition ' +
        (loading ? 'opacity-60 cursor-wait ' : '') +
        className
      }
      aria-busy={loading}
    >
      {label}
    </button>
  );
}
