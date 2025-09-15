'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useAccount,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { erc20Abi, parseUnits } from 'viem';

type Mode = 'erc20' | 'native';

/** === EDIT YEH VALUES === */
const MODE: Mode = 'erc20';                 // 'erc20' for token, 'native' for chain coin
const TARGET_CHAIN_ID = 1328;               // Sei EVM Testnet (change if needed)
const RECIPIENT = '0xYourRecipientAddress'; // jisko 1 token bhejna hai
const ERC20_TOKEN_ADDRESS = '0xYourToken';  // MODE='erc20' par required
const FIXED_HUMAN_AMOUNT = '1';             // 1 token fixed
/** ======================= */

export default function BuyNowButton({ className }: { className?: string }) {
  const { address, chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const { data: decData, isLoading: isDecLoading } = useReadContract({
    address: MODE === 'erc20' ? (ERC20_TOKEN_ADDRESS as `0x${string}`) : undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    query: { enabled: MODE === 'erc20' },
  });
  const decimals = MODE === 'erc20' ? Number(decData ?? 18) : 18;

  const { writeContractAsync, isPending: isWritePending, error: writeErr } = useWriteContract();
  const { sendTransactionAsync, isPending: isSendPending, error: sendErr } = useSendTransaction();

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { data: receipt, isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    // success par toast/unlock/redirect yahan laga sakte ho
  }, [isSuccess, txHash]);

  const disabledReason = useMemo(() => {
    if (!isConnected) return 'Connect';
    if (chainId !== TARGET_CHAIN_ID) return 'Switch network';
    if (MODE === 'erc20' && isDecLoading) return 'Loading…';
    if (isWritePending || isSendPending || isConfirming) return 'Processing…';
    return null;
  }, [isConnected, chainId, isDecLoading, isWritePending, isSendPending, isConfirming]);

  const onClick = async () => {
    if (!isConnected) return;
    if (chainId !== TARGET_CHAIN_ID) {
      switchChain?.({ chainId: TARGET_CHAIN_ID });
      return;
    }
    try {
      let hash: `0x${string}`;
      if (MODE === 'erc20') {
        const amount = parseUnits(FIXED_HUMAN_AMOUNT, decimals);
        hash = await writeContractAsync({
          address: ERC20_TOKEN_ADDRESS as `0x${string}`,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [RECIPIENT as `0x${string}`, amount],
        });
      } else {
        const amount = parseUnits(FIXED_HUMAN_AMOUNT, 18);
        hash = await sendTransactionAsync({
          to: RECIPIENT as `0x${string}`,
          value: amount,
        });
      }
      setTxHash(hash);
    } catch {}
  };

  const err = writeErr || sendErr;

  const label =
    !isConnected ? 'Connect Wallet' :
    chainId !== TARGET_CHAIN_ID ? 'Switch Network' :
    isWritePending || isSendPending ? 'Sending…' :
    isConfirming ? 'Confirming…' :
    isSuccess ? 'Purchased ✓' :
    'Buy Now';

  return (
    <div className={className}>
      <button
        onClick={onClick}
        disabled={!!disabledReason}
        className="w-full rounded-xl px-4 py-2 font-medium shadow bg-black text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {label}
      </button>

      {txHash && <p className="mt-2 text-xs break-all">Tx: {txHash}</p>}
      {isSuccess && receipt && (
        <p className="mt-1 text-xs text-green-600">Success ✓ Block #{receipt.blockNumber?.toString()}</p>
      )}
      {err && <p className="mt-2 text-xs text-red-500">{err.message}</p>}
    </div>
  );
}
