/**
 * usePrivyWallet — silently manages the user's embedded Privy wallet.
 * - Creates a wallet automatically if the user doesn't have one
 * - Fetches live USDC balance from Base via public RPC
 * - Exposes wallet address and balance for display
 *
 * Base USDC contract: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
 */
import { useEffect, useState, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

const BASE_RPC = "https://mainnet.base.org";
const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// ERC-20 balanceOf selector: balanceOf(address) => 0x70a08231
function buildBalanceOfCall(address) {
  const padded = address.replace("0x", "").padStart(64, "0");
  return {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [
      {
        to: USDC_CONTRACT,
        data: "0x70a08231" + padded,
      },
      "latest",
    ],
  };
}

export function usePrivyWallet() {
  const { ready, authenticated, user, createWallet } = usePrivy();
  const { wallets } = useWallets();

  const [walletAddress, setWalletAddress] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // Find the embedded wallet
  const embeddedWallet = wallets?.find((w) => w.walletClientType === "privy");

  // Auto-create embedded wallet if user is authenticated but has none
  useEffect(() => {
    if (!ready || !authenticated) return;
    if (embeddedWallet) {
      setWalletAddress(embeddedWallet.address);
      return;
    }
    // Only create once
    const alreadyHasWallet = user?.linkedAccounts?.some(
      (a) => a.type === "wallet" && a.walletClientType === "privy"
    );
    if (!alreadyHasWallet && !loadingWallet) {
      setLoadingWallet(true);
      createWallet()
        .catch(() => {})
        .finally(() => setLoadingWallet(false));
    }
  }, [ready, authenticated, embeddedWallet, user, loadingWallet, createWallet]);

  // Fetch live USDC balance
  const fetchBalance = useCallback(async (address) => {
    if (!address) return;
    try {
      const res = await fetch(BASE_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBalanceOfCall(address)),
      });
      const json = await res.json();
      if (json.result && json.result !== "0x") {
        // USDC has 6 decimals
        const raw = parseInt(json.result, 16);
        setUsdcBalance(raw / 1_000_000);
      } else {
        setUsdcBalance(0);
      }
    } catch {
      setUsdcBalance(null);
    }
  }, []);

  useEffect(() => {
    if (!walletAddress) return;
    fetchBalance(walletAddress);
    // Refresh every 30s
    const interval = setInterval(() => fetchBalance(walletAddress), 30_000);
    return () => clearInterval(interval);
  }, [walletAddress, fetchBalance]);

  return {
    walletAddress: embeddedWallet?.address || walletAddress,
    usdcBalance,
    loadingWallet,
    refetchBalance: () => fetchBalance(embeddedWallet?.address || walletAddress),
  };
}