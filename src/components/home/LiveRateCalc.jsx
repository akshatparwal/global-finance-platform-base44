/**
 * LiveRateCalc — Public-facing currency converter widget for the Home page.
 * Lets visitors calculate USD → PHP before signing up.
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useLiveRates } from "@/hooks/useLiveRates";

const PRESETS = [100, 200, 500, 1000];

export default function LiveRateCalc({ taglish }) {
  const [usd, setUsd] = useState("200");
  const { rates, loading, refetch } = useLiveRates();
  const rate = rates?.USDPHP || 56.24;

  const php = useMemo(() => {
    const val = parseFloat(usd);
    if (!val || isNaN(val)) return "0.00";
    return (val * rate).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [usd, rate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl overflow-hidden border"
      style={{ background: "linear-gradient(135deg, #0D1F3C 0%, #2a1800 60%, #5a3800 100%)", borderColor: "rgba(201,123,34,0.2)" }}
    >
      <div className="px-7 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(201,123,34,0.7)" }}>
              {taglish ? "Kalkulahin Ngayon" : "Live Calculator"}
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {taglish ? "Magkano ang matatanggap nila?" : "How much will they receive?"}
            </h3>
          </div>
          <button onClick={refetch} className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "..." : `₱${rate.toFixed(2)}`}
          </button>
        </div>

        {/* Amount input */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1 rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <span className="text-white/50 font-bold text-sm">🇺🇸 USD</span>
            <input
              type="number"
              inputMode="decimal"
              value={usd}
              onChange={e => setUsd(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white font-black text-xl text-right"
              placeholder="0"
            />
          </div>
          <ArrowRight className="w-5 h-5 flex-shrink-0" style={{ color: "#C97B22" }} />
          <div className="flex-1 rounded-2xl px-4 py-3" style={{ background: "rgba(201,123,34,0.15)", border: "1px solid rgba(201,123,34,0.3)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(201,123,34,0.7)" }}>🇵🇭 PHP</p>
            <p className="text-white font-black text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>₱{php}</p>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="flex gap-2 mb-6">
          {PRESETS.map(p => (
            <button key={p} onClick={() => setUsd(String(p))}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${parseFloat(usd) === p ? "text-white" : "text-white/50 hover:text-white/70"}`}
              style={{ background: parseFloat(usd) === p ? "#C97B22" : "rgba(255,255,255,0.06)" }}>
              ${p}
            </button>
          ))}
        </div>

        {/* Breakdown row */}
        <div className="flex items-center justify-between text-xs mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
          <span>Rate: <strong className="text-white">₱{rate.toFixed(2)}/USD</strong></span>
          <span>Fee: <strong style={{ color: "#C97B22" }}>$0.00</strong></span>
          <span>Arrives: <strong className="text-white">~30 sec</strong></span>
        </div>

        <Link to="/auth"
          className="w-full flex items-center justify-center gap-2 font-bold rounded-xl py-3.5 text-sm hover:opacity-90 transition-opacity"
          style={{ background: "#C97B22", color: "#fff" }}>
          {taglish ? "Magpadala ng Ganito →" : "Send This Amount →"}
        </Link>
        <p className="text-center text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>No account needed to calculate · Sign up free in 2 min</p>
      </div>
    </motion.div>
  );
}