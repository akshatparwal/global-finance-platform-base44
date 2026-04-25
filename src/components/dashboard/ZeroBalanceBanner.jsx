/**
 * ZeroBalanceBanner — shown when USD wallet balance is $0.
 * Monzo/Chime-style persistent nudge to fund the wallet.
 */
import { motion } from "framer-motion";
import { ArrowDownToLine, Sparkles } from "lucide-react";

export default function ZeroBalanceBanner({ darkMode, onFund }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl p-5 relative overflow-hidden mb-4"
      style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2600 60%, #8a4a00 100%)" }}
    >
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(201,160,80,0.7) 0%, transparent 60%)" }} />
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-extrabold text-base leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Fund your wallet to start sending
          </p>
          <p className="text-white/50 text-xs mt-0.5">Add funds via ACH, wire, or debit card — arrives in seconds</p>
        </div>
        <button
          onClick={onFund}
          className="flex items-center gap-1.5 bg-primary text-secondary font-black px-4 py-2.5 rounded-xl text-sm flex-shrink-0 hover:opacity-90 active:scale-95 transition-all"
        >
          <ArrowDownToLine className="w-4 h-4" />
          Add Funds
        </button>
      </div>
    </motion.div>
  );
}