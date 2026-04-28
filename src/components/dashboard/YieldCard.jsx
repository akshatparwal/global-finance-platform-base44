/**
 * YieldCard — DeFi-style yield earnings display.
 * Shows accrued yield, daily rate, annual projection, and a live ticker.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Info } from "lucide-react";
import { useYieldAccrual } from "@/hooks/useYieldAccrual";

export default function YieldCard({ balance, walletCreatedDate, yieldPctStr, darkMode }) {
  const { yieldEarned, annualYield, dailyYield, apyPct, projectedBalance } =
    useYieldAccrual({ balance, walletCreatedDate, yieldPctStr });

  // Live "cents dripping" ticker — increments yield display every second
  const [liveExtra, setLiveExtra] = useState(0);
  useEffect(() => {
    if (!balance || balance <= 0) return;
    const perSecond = dailyYield / 86_400;
    const timer = setInterval(() => {
      setLiveExtra(prev => prev + perSecond);
    }, 1000);
    return () => clearInterval(timer);
  }, [dailyYield, balance]);

  const displayEarned = yieldEarned + liveExtra;

  const card  = darkMode ? "bg-[#1a2332] border-white/5"  : "bg-white border-black/5";
  const muted = darkMode ? "text-white/50"                  : "text-[#1a2a4a]/50";
  const text  = darkMode ? "text-white"                     : "text-[#1a2a4a]";

  if (!balance || balance <= 0) {
    return (
      <div className={`border rounded-2xl p-5 ${card}`}>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className={`font-bold text-sm ${text}`}>DeFi Yield Earnings</h3>
          <span className="ml-auto bg-primary/15 text-primary text-[9px] font-black px-2 py-0.5 rounded-full">{apyPct}% APY</span>
        </div>
        <p className={`text-sm ${muted} text-center py-4`}>Add funds to start earning yield on your USDC balance.</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-2xl overflow-hidden ${card}`}>
      {/* Header gradient band */}
      <div className="px-5 pt-5 pb-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1526 0%, #1a2a4a 60%, #2a3d00 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 85% 15%, rgba(201,160,80,0.6) 0%, transparent 55%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Live Yield Earnings</p>
            <div className="flex items-center gap-1 bg-emerald-500/20 rounded-full px-2 py-0.5 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[9px] font-black">{apyPct}% APY</span>
            </div>
          </div>
          <motion.p
            key={Math.floor(displayEarned * 10000)}
            className="text-white font-black text-3xl mb-0.5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            +${displayEarned.toFixed(6)}
          </motion.p>
          <p className="text-white/40 text-xs">earned on ${balance.toFixed(2)} USDC</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 divide-x p-0" style={{ borderTop: darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
        {[
          { label: "Daily",   val: `+$${dailyYield.toFixed(4)}` },
          { label: "Annual",  val: `+$${annualYield.toFixed(2)}` },
          { label: "Projected Balance", val: `$${projectedBalance.toFixed(2)}` },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center py-3 px-2 text-center" style={{ borderColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
            <p className={`text-[9px] font-bold uppercase tracking-wider ${muted} mb-1`}>{s.label}</p>
            <p className={`font-black text-sm text-emerald-500`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Protocol info */}
      <div className="px-5 py-3 flex items-start gap-2 border-t" style={{ borderColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
        <Info className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
        <p className={`text-[10px] ${muted} leading-relaxed`}>
          Yield accrues daily on your USDC balance via DeFi lending protocols on Base (Morpho / Aave strategy). Powered by Privy embedded wallets. Rate subject to market conditions.
        </p>
      </div>
    </div>
  );
}