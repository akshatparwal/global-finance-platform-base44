/**
 * WalletCard — full-width hero wallet card with yield display.
 */
import { useYieldAccrual } from "@/hooks/useYieldAccrual";
import TnalakPattern from "@/components/dashboard/TnalakPattern";

export default function WalletCard({ w, usdcBalance, walletAddress, liveRate }) {
  const displayBalance = w.currency_code === "USD" && usdcBalance !== null ? usdcBalance : w.balance;
  const isOnChain = w.currency_code === "USD" && usdcBalance !== null;
  const { yieldEarned, apyPct } = useYieldAccrual(
    w.currency_code === "USD"
      ? { balance: displayBalance, walletCreatedDate: w.created_date, yieldPctStr: w.yield_pct }
      : {}
  );

  const phpEquiv = w.currency_code === "USD" && liveRate
    ? `≈ ₱${(displayBalance * liveRate).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`
    : w.currency_code === "PHP" && liveRate
      ? `≈ $${(w.balance / liveRate).toFixed(2)} USD`
      : null;

  return (
    <div
      className="kf-hero-card rounded-2xl p-5 relative overflow-hidden w-full"
      style={{ background: w.currency_code === "USD" ? "linear-gradient(135deg, #1a2a4a, #3d2e00)" : "linear-gradient(135deg, #0d1a3a, #1a3a6a)" }}
    >
      <TnalakPattern opacity={0.07} />
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{w.flag}</span>
          <div>
            <div className="text-white font-bold text-sm">{w.currency_name}</div>
            <div className="text-white/40 text-[10px] uppercase tracking-wider">{w.currency_code} Wallet</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {w.yield_pct && w.currency_code !== "PHP" && (
            <span className="bg-primary/30 text-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-primary/20">⚡ {w.yield_pct} APY</span>
          )}
          {isOnChain && (
            <span className="bg-blue-500/20 text-blue-300 text-[8px] font-black px-1.5 py-0.5 rounded-full">ON-CHAIN</span>
          )}
        </div>
      </div>

      <div className="mb-1">
        <div className="text-white/40 text-[9px] uppercase tracking-wider mb-1">Balance</div>
        <div className="text-white font-black text-4xl leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {w.currency_code === "USD"
            ? `$${displayBalance.toFixed(2)}`
            : `₱${w.balance.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`}
        </div>
      </div>

      <div className="flex flex-col gap-0.5 mt-2">
        {phpEquiv && <div className="text-white/40 text-xs">{phpEquiv}</div>}
        {w.currency_code === "USD" && displayBalance > 0 && (
          <div className="text-emerald-400 text-xs font-semibold">+${yieldEarned.toFixed(4)} earned · {apyPct}% APY</div>
        )}
        {w.currency_code === "USD" && walletAddress && (
          <div className="text-white/25 text-[9px] font-mono mt-1">
            {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
          </div>
        )}
      </div>
    </div>
  );
}