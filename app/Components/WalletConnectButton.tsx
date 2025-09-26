'use client';

import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { getAccount } from '@wagmi/core';
import { useAppKit } from '@reown/appkit/react';
import { wagmiAdapter } from '@/app/Config';
import { clearParaLocal } from '@/app/lib/para/cleanup';

function short(a?: string) { return a ? `${a.slice(0,6)}…${a.slice(-4)}` : ''; }
function isParaLike(x?: string) { return (x || '').toLowerCase().includes('para'); }

export default function WalletConnectButton() {
  const { address, connector, status } = useAccount();
  const label = useMemo(() => (address ? short(address) : 'Connect Wallet'), [address]);
  const { open } = useAppKit();
  const wagmi = wagmiAdapter.wagmiConfig;
  const [opening, setOpening] = useState(false);

  const onClick = async () => {
    if (opening) return;
    setOpening(true);
    try {
      const acct = getAccount(wagmi);
      const onPara =
        isParaLike(acct?.connector?.id) ||
        isParaLike((acct?.connector as any)?.name) ||
        isParaLike(connector?.id) ||
        isParaLike((connector as any)?.name);

      // not on Para? wipe only Para’s local keys so it can't hijack; DO NOT disconnect injected.
      if (!onPara) clearParaLocal();

      open(); // open AppKit (will show account if connected)
    } finally {
      setTimeout(() => setOpening(false), 100);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={opening || status === 'reconnecting'}
      className="rounded-[24px] px-5 py-3 text-sm font-semibold text-white
                 bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-300
                 shadow-[0_12px_40px_rgba(251,146,60,0.35)]
                 hover:shadow-[0_20px_70px_rgba(251,146,60,0.6)]"
      aria-busy={opening}
    >
      {label}
    </button>
  );
}
