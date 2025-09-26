// app/Components/WalletConnectButton.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { wagmiAdapter } from '@/app/Config';
import { getAccount, disconnect } from '@wagmi/core';

function shortAddr(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}
function isParaLike(idOrName?: string) {
  const v = idOrName?.toLowerCase?.() || '';
  return v.includes('para');
}

export default function ConnectButton() {
  const { address } = useAccount();
  const label = useMemo(() => (address ? shortAddr(address) : 'Connect Wallet'), [address]);

  const { open } = useAppKit();
  const wagmi = wagmiAdapter.wagmiConfig;
  const [opening, setOpening] = useState(false);

  async function softResetForReown() {
    try {
      // 1) If the last live connector was Para, proactively disconnect
      const acct: any = getAccount(wagmi);
      const lastConn = acct?.connector as { id?: string; name?: string } | undefined;
      const looksPara =
        isParaLike(lastConn?.id) || isParaLike(lastConn?.name) || !!localStorage.getItem('para:session');

      if (looksPara) {
        if (acct?.status === 'connected') {
          await disconnect(wagmi).catch(() => {});
        }
        // 2) Only clear Para’s own local keys (do not nuke wagmi/appkit caches)
        try {
          localStorage.removeItem('para:session');
          localStorage.removeItem('para:user');
        } catch {}
      }
    } catch {}
  }

  const handleClick = async () => {
    if (opening) return;
    setOpening(true);
    try {
      await softResetForReown();
      // tiny delay lets the disconnect & localStorage settle before opening modal
      await new Promise((r) => setTimeout(r, 20));
      open(); // programmatically open Reown modal
    } finally {
      // let AppKit take over; we reset this when modal closes next time if needed
      setTimeout(() => setOpening(false), 150);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={opening}
      className="relative inline-block rounded-[24px] px-5 py-3 text-sm font-semibold text-white
                 bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-300
                 shadow-[0_12px_40px_rgba(251,146,60,0.35)]
                 hover:shadow-[0_20px_70px_rgba(251,146,60,0.6)]
                 backdrop-blur-xl select-none"
      aria-busy={opening}
    >
      {label}
    </button>
  );
}
