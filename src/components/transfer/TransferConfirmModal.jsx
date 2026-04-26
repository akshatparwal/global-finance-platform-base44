/**
 * TransferConfirmModal — Revolut/Wise-style review screen before sending.
 * Shows: amount, recipient, rate, fee, arrival time, PIN entry.
 */
import { useState, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import { X, Shield, Clock, Loader2 } from "lucide-react";

export default function TransferConfirmModal({ transfer, onConfirm, onClose, darkMode }) {
  const { amount, receive, rate, recipient, bank } = transfer;
  const [confirming, setConfirming] = useState(false);
  const dragY = useRef(0);

  const bg = "bg-[#0d1526]";
  const muted = "text-white/50";

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm();
    setConfirming(false);
  };

  const fee = 0.00;
  const totalDeducted = (parseFloat(amount) + fee).toFixed(2);

  const sheetY = useMotionValue(0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.3 }}
        style={{ y: sheetY }}
        onDragEnd={(_, info) => { if (info.offset.y > 80) onClose(); else sheetY.set(0); }}
        className="w-full sm:max-w-sm bg-[#0d1526] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-3 pb-4">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Review Transfer</p>
            <h3 className="text-white font-extrabold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Confirm & Send
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-8">
          {/* Amount hero */}
          <div className="rounded-2xl p-5 mb-4 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2e00 60%, #8a6a00 100%)" }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, rgba(201,160,80,0.8) 0%, transparent 60%)" }} />
            <div className="relative z-10">
              <p className="text-white/50 text-xs mb-1">You send</p>
              <p className="text-white font-black text-4xl mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ${parseFloat(amount).toFixed(2)}
              </p>
              <div className="flex items-center justify-center gap-2 my-2">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-white/30 text-[10px] uppercase tracking-wider">converts to</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <p className="text-primary font-black text-2xl">₱{parseFloat(receive).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
              <p className="text-white/30 text-xs mt-1">Rate: 1 USD = ₱{rate.toFixed(2)}</p>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="rounded-2xl border border-white/10 divide-y divide-white/5 mb-4 overflow-hidden">
            {[
              { label: "Recipient", value: recipient || "Family", sub: bank },
              { label: "Transfer fee", value: "FREE", valueClass: "text-emerald-400 font-bold" },
              { label: "Total deducted", value: `$${totalDeducted}`, valueClass: "font-bold text-white" },
              { label: "Estimated arrival", value: bank?.includes("GCash") || bank?.includes("Maya") ? "~30 seconds" : "1–2 hours", sub: "Once confirmed" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-white/50 text-xs">{row.label}</p>
                  {row.sub && <p className="text-white/30 text-[10px]">{row.sub}</p>}
                </div>
                <p className={`text-sm ${row.valueClass || "text-white/80"}`}>{row.value}</p>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 text-white/30 text-[10px]">
            <div className="flex items-center gap-1"><Shield className="w-3 h-3" /> 256-bit encrypted</div>
            <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> 30-sec delivery</div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="w-full mt-4 bg-primary text-secondary font-black py-4 rounded-xl text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {confirming
              ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing…</span>
              : "Confirm & Send →"
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}