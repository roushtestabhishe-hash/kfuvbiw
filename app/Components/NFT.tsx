"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowLeft, FaImage, FaCoins, FaFire, FaGem } from "react-icons/fa";
import { TbHexagonLetterN } from "react-icons/tb";
import BuyNowButton from "./BuyNowButton";

// 🔌 wagmi for on-chain call
import { useAccount, useReadContract, useWriteContract } from "wagmi";
// your minimal ABI file you created in app/abi/nftClaim.ts
import { nftClaimAbi } from "../ABI/nftClaim";

interface NFTProps {
  onBack: () => void;
}

// Contract address from env (or hardcode during testing)
const NFT_CLAIM_CONTRACT =
  (process.env.NEXT_PUBLIC_NFT_CLAIM_CONTRACT as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

const NFT: React.FC<NFTProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] =
    useState<"collection" | "mint" | "marketplace">("collection");

  // 👉 Use files from /public/nft (e.g. /public/nft/001.png)
  const dummyNFTs = [
    { id: 1, name: "Kazar Champion #001", image: "/nft/breaker.png", rarity: "Legendary", price: "10 CAMP" },
    { id: 2, name: "Game Master #042",   image: "/nft/climb.png",   rarity: "Epic",      price: "10 CAMP" },
    { id: 3, name: "Victory Badge #123",  image: "/nft/finder.png",  rarity: "Rare",      price: "10 CAMP" },
    { id: 4, name: "Warrior Spirit #567", image: "/nft/coder.png",   rarity: "Common",    price: "10 CAMP" },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      case "Epic":      return "text-purple-400 border-purple-400/30 bg-purple-400/10";
      case "Rare":      return "text-blue-400 border-blue-400/30 bg-blue-400/10";
      default:          return "text-gray-400 border-gray-400/30 bg-gray-400/10";
    }
  };

  const NeuCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-3xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-xl shadow-[inset_-6px_-6px_16px_rgba(255,255,255,0.05),inset_6px_6px_16px_rgba(0,0,0,0.7),12px_12px_24px_rgba(0,0,0,0.8)] transition-all duration-300 hover:scale-[1.01] ${className}`}>
      {children}
    </div>
  );

  // ------------------ chain wiring (minimal) ------------------
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // read global price (wei) from contract (0 if not set)
  const { data: priceWei } = useReadContract({
    address: NFT_CLAIM_CONTRACT,
    abi: nftClaimAbi,
    functionName: "priceWei",
  });

  const [mintingId, setMintingId] = useState<number | null>(null);

  async function handleBuy(editionId: number) {
    if (!isConnected) {
      alert("Connect wallet first.");
      return;
    }
    if (!NFT_CLAIM_CONTRACT || NFT_CLAIM_CONTRACT === "0x0000000000000000000000000000000000000000") {
      alert("NFT contract address missing.");
      return;
    }
    try {
      setMintingId(editionId);
      await writeContractAsync({
        address: NFT_CLAIM_CONTRACT,
        abi: nftClaimAbi,
        functionName: "claim",        // claim(uint256 editionId)
        args: [BigInt(editionId)],
        value: (priceWei as bigint) ?? 0n,
      });
      alert("Mint submitted!");
    } catch (err) {
      console.error(err);
      alert("Mint failed.");
    } finally {
      setMintingId(null);
    }
  }
  // ------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4"
      >
        <motion.button
          onClick={onBack}
          className="p-3 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/10 hover:border-white/20 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft className="text-zinc-300" />
        </motion.button>

        <div className="flex items-center gap-3">
          <TbHexagonLetterN className="text-3xl text-orange-400" />
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
            NFT Collection
          </h1>
        </div>
      </motion.div>

      {/* Tabs */}
      <NeuCard className="p-6">
        <div className="flex gap-4 mb-6">
          {[
            { key: "collection", label: "Common",      icon: FaGem },
            { key: "mint",        label: "Mint NFTs",   icon: FaFire },
            { key: "marketplace", label: "XBadges",     icon: FaCoins },
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              onClick={() => setSelectedTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === key
                  ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-400/30 text-orange-300"
                  : "bg-zinc-800/50 border border-white/10 text-zinc-400 hover:text-zinc-200"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="text-sm" />
              {label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {selectedTab === "collection" && (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {dummyNFTs.slice(0, 2).map((nft) => (
                  <motion.div
                    key={nft.id}
                    className="rounded-2xl bg-zinc-800/50 border border-white/10 overflow-hidden hover:border-orange-400/30 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-zinc-900/40">
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg text-white mb-2">{nft.name}</h3>
                      <div className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getRarityColor(nft.rarity)}`}>
                        {nft.rarity}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {dummyNFTs.length === 0 && (
                <div className="text-center py-12">
                  <FaImage className="text-6xl text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400 text-lg">No NFTs in your collection yet</p>
                  <p className="text-zinc-500 text-sm mt-2">Play games and complete quests to earn NFTs!</p>
                </div>
              )}
            </motion.div>
          )}

          {selectedTab === "mint" && (
            <motion.div
              key="mint"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center py-12">
                <FaFire className="text-6xl text-orange-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Mint Exclusive NFTs</h3>
                <p className="text-zinc-400 mb-6">
                  Create unique digital collectibles by achieving milestones in games.
                </p>
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Coming Soon
                </motion.button>
              </div>
            </motion.div>
          )}

          {selectedTab === "marketplace" && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {dummyNFTs.map((nft) => (
                  <motion.div
                    key={nft.id}
                    className="rounded-2xl bg-zinc-800/50 border border-white/10 overflow-hidden hover:border-green-400/30 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-zinc-900/40">
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg text-white mb-2">{nft.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getRarityColor(nft.rarity)}`}>
                          {nft.rarity}
                        </div>
                        <span className="text-green-400 font-bold">{nft.price}</span>
                      </div>

                      {/* Wrap the existing button so we don't edit that component */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBuy(nft.id)}
                      >
                        <BuyNowButton className="mt-3 w-full" />
                      </motion.div>

                      {mintingId === nft.id && (
                        <div className="mt-2 text-xs text-zinc-400 text-center">Minting…</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </NeuCard>

      {/* Stats */}
      <NeuCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaGem className="text-orange-400" />
          Collection Stats
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">2</div>
            <div className="text-sm text-zinc-400">Owned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">1.2</div>
            <div className="text-sm text-zinc-400">Total ETH</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">5</div>
            <div className="text-sm text-zinc-400">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">3</div>
            <div className="text-sm text-zinc-400">Rank</div>
          </div>
        </div>
      </NeuCard>
    </div>
  );
};

export default NFT;
