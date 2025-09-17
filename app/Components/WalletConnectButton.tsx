// app/Components/WalletConnectButton.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { AppKitButton } from '@reown/appkit/react';

function shortAddr(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

export default function ConnectButton() {
  const { address } = useAccount();
  const label = useMemo(() => (address ? shortAddr(address) : 'Connect Wallet'), [address]);

  // --- keep your existing persistence logic unchanged ---
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
      <div
        className="relative rounded-[24px] p-[2px]
                   bg-[conic-gradient(at_20%_-10%,#fb923c,#f59e0b,#f97316,#fb923c)]
                   shadow-[0_12px_40px_rgba(251,146,60,0.35)]
                   hover:shadow-[0_20px_70px_rgba(251,146,60,0.6)] transition"
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

          {/* Visible label (our glass UI) */}
          <div
            className="relative z-10 px-5 py-3 text-white text-sm font-semibold
                       drop-shadow-[0_0_10px_rgba(251,189,35,0.85)] select-none text-center"
            aria-hidden // prevent duplicate focus text; AppKit handles accessibility
          >
            {label}
          </div>

          {/* Invisible AppKit button overlay — handles all clicks/keyboard */}
          <div className="absolute inset-0 z-20">
            <AppKitButton
              // Make AppKit’s host fill this container and be visually hidden
              style={{
                opacity: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                // keep it focusable & clickable
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </div>

      {/* bottom reflection */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-2 left-6 right-6 h-5 blur-xl rounded-full opacity-70 bg-orange-400/45"
      />
    </div>
  );
}
