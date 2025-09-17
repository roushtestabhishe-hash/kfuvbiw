'use client';

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

function shortAddr(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : 'Connect Wallet';
}

export default function ConnectButton() {
  const { address } = useAccount();
  const { open, isOpen } = useAppKit();

  const label = useMemo(() => shortAddr(address), [address]);

  // --- single-flight guard to prevent double requests ---
  const busy = useRef(false);
  const handleClick = useCallback(async () => {
    if (busy.current || isOpen) return; // prevent parallel opens
    busy.current = true;
    try {
      await open({ view: 'Connect' });
    } finally {
      // give extension a moment to settle; avoids “previous request active”
      setTimeout(() => { busy.current = false; }, 300);
    }
  }, [open, isOpen]);

  // --- keep your existing persistence logic unchanged ---
  useEffect(() => {
    const run = async () => {
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
    run();
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
      <button
        onClick={handleClick}
        className="relative rounded-[24px] p-[2px]
                   bg-[conic-gradient(at_20%_-10%,#fb923c,#f59e0b,#f97316,#fb923c)]
                   shadow-[0_12px_40px_rgba(251,146,60,0.35)]
                   hover:shadow-[0_20px_70px_rgba(251,146,60,0.6)] transition
                   focus:outline-none focus:ring-2 focus:ring-amber-300/60"
        disabled={busy.current || isOpen}
      >
        <div className="relative rounded-[22px] overflow-hidden backdrop-blur-xl">
          <span
            aria-hidden
            className="pointer-events-none absolute left-2 right-2 top-0 h-[58%] rounded-t-[22px]
                       bg-white/25 blur-[10px] opacity-80"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[22px]
                       bg-gradient-to-br from-orange-400/70 via-amber-300/60 to-yellow-300/70"
          />
          <span aria-hidden className="pointer-events-none absolute -left-8 -top-6 h-16 w-20 bg-orange-400/40 blur-2xl rounded-full" />
          <span aria-hidden className="pointer-events-none absolute -right-6 -bottom-6 h-16 w-20 bg-amber-300/40 blur-2xl rounded-full" />

          <div
            className="relative z-10 px-5 py-3 text-white text-sm font-semibold
                       drop-shadow-[0_0_10px_rgba(251,189,35,0.85)] select-none text-center"
          >
            {label}
          </div>
        </div>
      </button>

      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-2 left-6 right-6 h-5 blur-xl rounded-full opacity-70 bg-orange-400/45"
      />
    </div>
  );
}
