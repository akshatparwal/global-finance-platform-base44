/**
 * useYieldAccrual — computes simulated DeFi yield on the user's USDC balance.
 *
 * Strategy: mirrors what a Morpho/Aave vault on Base would do.
 * - APY is stored per wallet record (yield_pct field, e.g. "4.5%")
 * - We accrue continuously from the wallet's created_date
 * - Earned = principal * ((1 + APY/365)^days - 1)  (daily compounding)
 *
 * Returns:
 *   yieldEarned        — USD earned to date
 *   annualYield        — USD/year at current balance
 *   dailyYield         — USD/day
 *   apyPct             — numeric APY (e.g. 4.5)
 *   projectedBalance   — principal + earned
 */
import { useMemo } from "react";

const DEFAULT_APY = 4.5; // % — matches the "4.5%" badge on the USD wallet

export function useYieldAccrual({ balance = 0, walletCreatedDate = null, yieldPctStr = null } = {}) {
  return useMemo(() => {
    const apyPct = parseFloat((yieldPctStr || `${DEFAULT_APY}%`).replace("%", "")) || DEFAULT_APY;
    const apyDecimal = apyPct / 100;

    // Only accrue yield when there is a positive balance.
    // If balance is 0, return zeros immediately — no accrual on empty wallets.
    if (!balance || balance <= 0) {
      return { yieldEarned: 0, annualYield: 0, dailyYield: 0, apyPct, projectedBalance: 0 };
    }

    // Days since wallet creation, capped at 365 to avoid inflated demo numbers.
    // In production, track the first-deposit date instead of wallet creation date.
    const createdMs = walletCreatedDate ? new Date(walletCreatedDate).getTime() : Date.now();
    const daysSince = Math.max(0, Math.min((Date.now() - createdMs) / 86_400_000, 365));

    // Daily compounding: A = P * (1 + r/365)^t
    const projectedBalance = balance * Math.pow(1 + apyDecimal / 365, daysSince);
    const yieldEarned      = projectedBalance - balance;

    const dailyYield  = balance * (apyDecimal / 365);
    const annualYield = balance * apyDecimal;

    return { yieldEarned, annualYield, dailyYield, apyPct, projectedBalance };
  }, [balance, walletCreatedDate, yieldPctStr]);
}