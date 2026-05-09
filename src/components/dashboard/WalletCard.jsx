/**
 * WalletCard — ARQ-style glassmorphism hero card.
 * One dominant balance number, cosmic glow, minimal chrome.
 */
import { useYieldAccrual } from "@/hooks/useYieldAccrual";

export default function WalletCard({ w, usdcBalance, walletAddress, liveRate }) {
  const displayBalance = w.currency_code === "USD" && usdcBalance !== null ? usdcBalance : w.balance;
  const isUSD = w.currency_code === "USD";
  const { yieldEarned, apyPct } = useYieldAccrual(
    isUSD ? { balance: displayBalance, walletCreatedDate: w.created_date, yieldPctStr: w.yield_pct } : {}
  );

  const phpEquiv = isUSD && liveRate
    ? `≈ ₱${(displayBalance * liveRate).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`
    : !isUSD && liveRate
      ? `≈ $${(w.balance / liveRate).toFixed(2)}`
      : null;

  const glowColor = "rgba(244,201,78,0.20)";

  return (
    <div
      className="kf-hero-card rounded-2xl p-5 relative overflow-hidden w-full"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-0.5">{w.currency_code} WALLET</p>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{w.flag}</span>
            <p className="text-white/60 text-sm">{w.currency_name}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {w.yield_pct && isUSD && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              ⚡ {w.yield_pct} APY
            </span>
          )}
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
            ● Verified
          </span>
        </div>
      </div>

      {/* Hero balance */}
      <div className="mb-4">
        <div
          className="font-light leading-none tracking-tight text-white"
          style={{ fontSize: "clamp(38px, 9vw, 56px)", fontFamily: "'Inter', sans-serif" }}
        >
          {isUSD
            ? `$${displayBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `₱${w.balance.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`}
        </div>
      </div>

      {/* Supporting info */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          {phpEquiv && <p className="text-white/35 text-xs">{phpEquiv}</p>}
          {isUSD && <p className="text-white/35 text-xs">1 USD = ₱{liveRate?.toFixed(2)}</p>}
          {isUSD && displayBalance > 0 && yieldEarned > 0 && (
            <p className="text-xs text-emerald-400">+${yieldEarned.toFixed(4)} yield</p>
          )}
        </div>
        {isUSD && w.yield_pct && (
          <p className="text-white/25 text-[10px]">{apyPct}% APY</p>
        )}
      </div>
    </div>
  );
}