// app/Components/WalletConnectButton.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { getAccount, disconnect } from '@wagmi/core';
import { wagmiAdapter } from '@/app/Config';

function shortAddr(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

// — helpers to detect & clean Para session —
function hasParaSession() {
  if (typeof window === 'undefined') return false;
  try {
    return !!(localStorage.getItem('para:session') || localStorage.getItem('para:user'));
  } catch {
    return false;
  }
}

async function forceParaLogout() {
  try {
    const { para } = await import('@/app/lib/para/client');
    await para.logout().catch(() => {}); // safe even if not logged in
  } catch {
    // ignore
  } finally {
    try {
      localStorage.removeItem('para:session');
      localStorage.removeItem('para:user');
    } catch {}
  }
}

export default function ConnectButton() {
  const { address } = useAccount();
  const appKit = useAppKit();
  const [busy, setBusy] = useState(false);

  const label = useMemo(() => (address ? shortAddr(address) : 'Connect Wallet'), [address]);

  // --- persistence logic (unchanged) ---
  useEffect(() => {
    const saveWalletConnection = async () => {
      if (!address) return;
      try {
        const res = await fetch('/api/wallet-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save wallet connection');
      } catch (e) {
        console.error('Error saving wallet connection:', e);
      }
    };
    saveWalletConnection();
  }, [address]);

  const openReownSafely = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const acct = getAccount(wagmiAdapter.wagmiConfig);
      const activeId = (acct.connector?.id || '').toLowerCase();

      // If Para session is present but we’re switching to a browser wallet via Reown,
      // clean Para first so connectors don't kick each other.
      if (hasParaSession() && activeId !== 'para') {
        const ok = window.confirm(
          'You are signed in with Para (email/social). To connect a browser wallet, ' +
          'we will sign you out of Para. Continue?'
        );
        if (!ok) return;

        if (acct.isConnected && activeId === 'para') {
          // defensive: disconnect wagmi if it thinks Para is active
          await disconnect(wagmiAdapter.wagmiConfig).catch(() => {});
        }
        await forceParaLogout();
      }

      // Now open Reown cleanly
      appKit.open();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Outer warm aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[28px] blur-2xl opacity-70 transition
                   bg-[radial-gradient(80%_120%_at_25%_0%,rgba(251,146,60,0.35),transparent_60%)]
                   before:content-[''] before:absolute before:inset-0 before:rounded-[28px] before:blur-2xl
                   before:bg-[radial-gradient(80%_120%_at_75%_100%,rgba(245,158,11,0.35),transparent_60%)]"
      />

      {/* Gradient border + glass panel */}
      <button
        type="button"
        onClick={openReownSafely}
        disabled={busy}
        className="relative rounded-[24px] p-[2px]
                   bg-[conic-gradient(at_20%_-10%,#fb923c,#f59e0b,#f97316,#fb923c)]
                   shadow-[0_12px_40px_rgba(251,146,60,0.35)]
                   hover:shadow-[0_20px_70px_rgba(251,146,60,0.6)] transition
                   outline-none focus:ring-2 focus:ring-amber-300/70"
        aria-busy={busy}
      >
        <div className="relative rounded-[22px] overflow-hidden backdrop-blur-xl">
          {/* glossy top stripe */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-2 right-2 top-0 h-[58%] rounded-t-[22px]
                       bg-white/25 blur-[10px] opacity-80"
          />
          {/* warm internal gradient */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[22px]
                       bg-gradient-to-br from-orange-400/70 via-amber-300/60 to-yellow-300/70"
          />
          {/* subtle blobs */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-8 -top-6 h-16 w-20 bg-orange-400/40 blur-2xl rounded-full"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-6 -bottom-6 h-16 w-20 bg-amber-300/40 blur-2xl rounded-full"
          />

          {/* Visible label */}
          <div
            className="relative z-10 px-5 py-3 text-white text-sm font-semibold
                       drop-shadow-[0_0_10px_rgba(251,189,35,0.85)] select-none text-center"
          >
            {busy ? 'Opening…' : label}
          </div>
        </div>
      </button>

      {/* bottom reflection */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-2 left-6 right-6 h-5 blur-xl rounded-full opacity-70 bg-orange-400/45"
      />
    </div>
  );
}
