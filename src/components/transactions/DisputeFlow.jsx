/**
 * DisputeFlow — chargeback/dispute modal for a transfer.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const REASONS = [
  { value: "not_received",    label: "Money not received by recipient" },
  { value: "wrong_amount",    label: "Wrong amount was sent" },
  { value: "duplicate",       label: "Duplicate / accidental transfer" },
  { value: "fraud",           label: "Unauthorized / fraudulent transfer" },
  { value: "other",           label: "Other reason" },
];

export default function DisputeFlow({ tx, onClose, darkMode }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const bg = darkMode ? "bg-[#0d1526]" : "bg-white";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const inputCls = `w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors ${
    darkMode ? "bg-white/5 border-white/10 text-white placeholder-white/30" : "bg-black/5 border-black/10 text-[#1a2a4a]"
  }`;

  const handleSubmit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    // Store dispute note on the transfer
    await base44.entities.Transfer.update(tx.id, {
      status: "pending",
      note: `[DISPUTE] ${REASONS.find(r => r.value === reason)?.label}. ${details}`.trim(),
    }).catch(() => {});
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`w-full sm:max-w-md ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className={`font-extrabold text-lg ${text}`}>Dispute Transfer</h3>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-white/10" : "bg-black/10"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-8">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <p className={`font-extrabold text-xl mb-2 ${text}`}>Dispute Filed</p>
              <p className={`text-sm ${muted} mb-2`}>Reference: KFD-{tx.id?.slice(0,8).toUpperCase()}</p>
              <p className={`text-sm ${muted}`}>Our team will review your case and respond within 2–5 business days to your registered email.</p>
              <button onClick={onClose} className="mt-6 bg-primary text-secondary font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity">Done</button>
            </div>
          ) : (
            <>
              {/* Transfer summary */}
              <div className={`rounded-xl p-3 mb-4 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-bold text-sm ${text}`}>{tx.recipient_name}</p>
                    <p className={`text-xs ${muted}`}>{new Date(tx.created_date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-black text-primary">${tx.amount_usd?.toFixed(2)}</p>
                </div>
              </div>

              {/* Reason */}
              <p className={`text-xs font-bold uppercase tracking-wider ${muted} mb-2`}>Reason for Dispute</p>
              <div className="space-y-2 mb-4">
                {REASONS.map(r => (
                  <button key={r.value} onClick={() => setReason(r.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      reason === r.value
                        ? "border-primary bg-primary/10 text-primary"
                        : darkMode ? "border-white/10 text-white/70 hover:border-white/20" : "border-black/10 text-black/70 hover:border-black/20"
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Details */}
              <p className={`text-xs font-bold uppercase tracking-wider ${muted} mb-2`}>Additional Details (optional)</p>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Provide any extra context to help us resolve this faster..."
                rows={3}
                className={`${inputCls} resize-none mb-4`}
              />

              <button
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Dispute →"}
              </button>
              <p className={`text-xs ${muted} text-center mt-3`}>Your dispute is protected under our Zero Liability Guarantee.</p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}