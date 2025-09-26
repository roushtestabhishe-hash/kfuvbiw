'use client';

import SocialLoginLink from './SocialLoginLink';
import ConnectButton from './WalletConnectButton';

export default function NavConnectCluster() {
  return (
    <div className="flex items-center gap-4">
      {/* Shows only when NOT connected */}
      <SocialLoginLink />
      {/* Your Reown/Wagmi connect button */}
      <ConnectButton />
    </div>
  );
}
