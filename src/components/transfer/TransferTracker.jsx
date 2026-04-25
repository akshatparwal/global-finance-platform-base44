/**
 * TransferTracker — Remitly-style live transfer status tracker.
 * Shows animated step-by-step progress of a transfer.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, Clock, Loader2 } from "lucide-react";

const STEPS = [
  { id: "initiated",   label: "Transfer Initiated",       sub: "Your transfer has been created" },
  { id: "processing",  label: "Processing Payment",        sub: "Verifying and processing funds" },
  { id: "sent",        label: "Sent to Philippines",       sub: "Money dispatched to recipient bank" },
  { id: "delivered",   label: "Delivered! 🇵🇭",            sub: "Funds credited to recipient account" },
];

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function TransferTracker({ transfer, onClose, darkMode }) {
  const [currentStep, setCurrentStep] = useState(0);

  // Simulate progression for "completed" transfers — jump to final step
  useEffect(() => {
    if (!transfer) return;
    if (transfer.status === "completed") {
      // Animate steps sequentially
      let step = 0;
      const interval = setInterval(() => {
        step += 1;
        setCurrentStep(step);
        if (step >= STEPS.length - 1) clearInterval(interval);
      }, 600);
      return () => clearInterval(interval);
    } else if (transfer.status === "pending") {
      setCurrentStep(1);
    } else if (transfer.status === "failed") {
      setCurrentStep(0);
    }
  }, [transfer]);

  if (!transfer) return null;

  const bg = darkMode ? "bg-[#0d1526]" : "bg-white";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";
  const phpAmount = transfer.amount_php || (transfer.amount_usd * (transfer.rate || 56.24));

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`w-full sm:max-w-sm ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-extrabold text-lg ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Transfer Status</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-[10px] uppercase tracking-wider ${muted} mb-0.5`}>Amount sent</p>
              <p className={`font-black text-2xl ${text}`}>${parseFloat(transfer.amount_usd).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className={`text-[10px] uppercase tracking-wider ${muted} mb-0.5`}>Recipient gets</p>
              <p className="font-black text-2xl text-primary">₱{parseFloat(phpAmount).toLocaleString("en-PH", { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 mt-2 text-xs ${muted}`}>
            <span className="font-semibold">{transfer.recipient_name}</span>
            <span>·</span>
            <span>{transfer.recipient_bank}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-6">
          <div className="relative">
            {/* Vertical line */}
            <div className={`absolute left-4 top-5 bottom-5 w-0.5 ${darkMode ? "bg-white/10" : "bg-black/8"}`} />
            {/* Progress line */}
            <motion.div
              className="absolute left-4 top-5 w-0.5 bg-primary origin-top"
              initial={{ height: "0%" }}
              animate={{ height: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            <div className="space-y-6">
              {STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.id} className="flex items-start gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 border-2 transition-all duration-500 ${
                      done ? "bg-primary border-primary" :
                      active ? "bg-primary/20 border-primary animate-pulse" :
                      darkMode ? "bg-[#0d1526] border-white/15" : "bg-white border-black/15"
                    }`}>
                      {done ? (
                        <Check className="w-4 h-4 text-secondary" />
                      ) : active ? (
                        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                      ) : (
                        <Clock className={`w-3.5 h-3.5 ${muted}`} />
                      )}
                    </div>
                    <div className="pt-0.5 flex-1">
                      <p className={`font-bold text-sm ${done || active ? text : muted}`}>{step.label}</p>
                      <p className={`text-xs ${muted}`}>{step.sub}</p>
                      {done && i === 0 && (
                        <p className="text-[10px] text-primary font-bold mt-0.5">{formatDate(transfer.created_date)}</p>
                      )}
                      {done && i === STEPS.length - 1 && (
                        <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Delivered ✓</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {currentStep >= STEPS.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3"
            >
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-emerald-400 font-bold text-sm">Money Delivered!</p>
                <p className={`text-xs ${muted}`}>{transfer.recipient_name} has received ₱{parseFloat(phpAmount).toLocaleString("en-PH", { maximumFractionDigits: 0 })}</p>
              </div>
            </motion.div>
          )}

          <p className={`text-center text-[10px] ${muted} mt-5`}>Reference: {transfer.reference_id || `KFI-${(transfer.id || "").slice(-8).toUpperCase()}`}</p>
        </div>
      </motion.div>
    </div>
  );
}