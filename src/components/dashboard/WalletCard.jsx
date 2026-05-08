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
      className="kf-hero-card rounded-2xl p-6 relative overflow-hidden w-full"
      style={{
        background: "rgba(20,24,41,0.9)",
        boxShadow: `0 0 60px ${glowColor}, 0 0 0 1px rgba(244,201,78,0.10) inset`,
      }}
    >
      {/* Radial glow behind balance */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 70%, rgba(244,201,78,0.14) 0%, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div>
          <p className="kf-label text-white/40 mb-0.5">{w.currency_code} Wallet</p>
          <p className="text-white/70 text-sm font-medium">{w.flag} {w.currency_name}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {w.yield_pct && isUSD && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,200,80,0.12)", color: "rgba(255,200,80,0.9)", border: "1px solid rgba(255,200,80,0.2)" }}
            >
              {w.yield_pct} APY
            </span>
          )}
          {w.currency_code === "USD" && usdcBalance !== null && (
            <span
              className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(244,201,78,0.1)", color: "rgba(244,201,78,0.7)", border: "1px solid rgba(244,201,78,0.15)" }}
            >
              ON-CHAIN
            </span>
          )}
        </div>
      </div>

      {/* Hero balance — dominant number */}
      <div className="relative z-10 mb-4">
        <div
          className="font-light leading-none tracking-tight"
          style={{ fontSize: "clamp(40px, 10vw, 64px)", color: "rgba(255,255,255,0.95)", fontFamily: "'Inter', sans-serif" }}
        >
          {isUSD
            ? `$${displayBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `₱${w.balance.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`}
        </div>
      </div>

      {/* Supporting info */}
      <div className="relative z-10 flex items-end justify-between">
        <div className="space-y-0.5">
          {phpEquiv && <p className="text-white/30 text-xs">{phpEquiv}</p>}
          {isUSD && displayBalance > 0 && yieldEarned > 0 && (
            <p className="text-xs" style={{ color: "#2ECC71" }}>+${yieldEarned.toFixed(4)} yield</p>
          )}
          {isUSD && walletAddress && (
            <p className="text-white/20 text-[9px] font-mono">{walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}</p>
          )}
        </div>
        {isUSD && w.yield_pct && (
          <p className="text-white/20 text-[10px]">{apyPct}% APY</p>
        )}
      </div>
    </div>
  );
}