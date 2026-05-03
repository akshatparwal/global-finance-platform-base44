/**
 * WalletCard — single wallet tile with live yield accrual display.
 */
import { useNavigate } from "react-router-dom";
import { useYieldAccrual } from "@/hooks/useYieldAccrual";
import TnalakPattern from "@/components/dashboard/TnalakPattern";

export default function WalletCard({ w, usdcBalance, walletAddress, liveRate, taglish }) {
  const displayBalance = w.currency_code === "USD" && usdcBalance !== null ? usdcBalance : w.balance;
  const isOnChain = w.currency_code === "USD" && usdcBalance !== null;
  const { yieldEarned, apyPct } = useYieldAccrual(
    w.currency_code === "USD"
      ? { balance: displayBalance, walletCreatedDate: w.created_date, yieldPctStr: w.yield_pct }
      : {}
  );
  const navigate = useNavigate();

  return (
    <div
      className="kf-hero-card rounded-2xl p-4 relative overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
      style={{ background: w.currency_code === "USD" ? "linear-gradient(135deg, #1a2a4a, #3d2e00)" : "linear-gradient(135deg, #0d1a3a, #1a3a6a)" }}
      onClick={() => navigate("/dashboard/pay")}
    >
      <TnalakPattern opacity={0.07} />
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{w.flag}</span>
          <div>
            <div className="text-white font-bold text-xs">{w.currency_code}</div>
            <div className="text-white/40 text-[9px]">{w.currency_name}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {w.yield_pct && w.currency_code !== "PHP" && (
            <span className="bg-primary/30 text-primary text-xs font-black px-2 py-1 rounded-full tracking-tight border border-primary/20">⚡ {w.yield_pct}</span>
          )}
          {isOnChain && (
            <span className="bg-blue-500/20 text-blue-300 text-[8px] font-black px-1.5 py-0.5 rounded-full">ON-CHAIN</span>
          )}
        </div>
      </div>
      <div>
        <div className="text-white/40 text-[9px] uppercase tracking-wider mb-0.5">{taglish ? "Balanse" : "Balance"}</div>
        <div className="text-white font-black text-lg leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {w.currency_code === "USD"
            ? `$${displayBalance.toFixed(2)}`
            : `₱${w.balance.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`}
        </div>
        {w.currency_code === "USD" && displayBalance > 0 && (
          <div className="text-emerald-400 text-[9px] mt-0.5 font-bold">
            +${yieldEarned.toFixed(4)} earned · {apyPct}% APY
          </div>
        )}
        {w.currency_code === "USD" && walletAddress && (
          <div className="text-white/30 text-[8px] mt-1 font-mono truncate">
            {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
          </div>
        )}

      </div>
    </div>
  );
}