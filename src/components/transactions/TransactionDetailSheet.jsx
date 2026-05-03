import { X, Copy, Check, RefreshCw, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CategoryPicker from "./CategoryPicker";
import DisputeFlow from "./DisputeFlow";

const CATEGORY_META = {
  remittance:    { label: "Remittance",    emoji: "💸", color: "bg-blue-500/15 text-blue-400" },
  bills:         { label: "Bills",         emoji: "⚡", color: "bg-orange-500/15 text-orange-400" },
  subscriptions: { label: "Subscriptions", emoji: "📺", color: "bg-purple-500/15 text-purple-400" },
  savings:       { label: "Savings",       emoji: "🏦", color: "bg-emerald-500/15 text-emerald-400" },
  other:         { label: "Other",         emoji: "💳", color: "bg-gray-500/15 text-gray-400" },
};

const STATUS_META = {
  completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  pending:   { label: "Pending",   color: "text-yellow-400",  bg: "bg-yellow-500/10" },
  failed:    { label: "Failed",    color: "text-red-400",     bg: "bg-red-500/10" },
};

export default function TransactionDetailSheet({ tx: initialTx, onClose, darkMode }) {
  const [tx, setTx] = useState(initialTx);
  const [copied, setCopied] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const navigate = useNavigate();

  if (!tx) return null;

  const cat = CATEGORY_META[tx.category] || CATEGORY_META.other;
  const status = STATUS_META[tx.status] || STATUS_META.completed;
  const bg = darkMode ? "bg-[#1a2332]" : "bg-white";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const divider = darkMode ? "border-white/8" : "border-black/8";

  const refId = tx.reference_id || `KF-${tx.id?.slice(0,8).toUpperCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          className={`relative ${bg} rounded-t-3xl max-h-[90vh] overflow-y-auto`}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className={`w-10 h-1 rounded-full ${darkMode ? "bg-white/20" : "bg-black/15"}`} />
          </div>

          {/* Close */}
          <button onClick={onClose} className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-white/10" : "bg-black/8"}`}>
            <X className="w-4 h-4" />
          </button>

          <div className="px-6 pb-10 pt-2">
            {/* Merchant icon + amount */}
            <div className="flex flex-col items-center mb-6 mt-2">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-lg"
                style={{ background: tx.merchant_color || "linear-gradient(135deg, #1a2a4a, #3d2e00)" }}
              >
                {tx.merchant_emoji || cat.emoji}
              </div>
              <p className={`text-3xl font-black mb-1 ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                -${tx.amount_usd?.toFixed(2)}
              </p>
              {tx.amount_php && (
                <p className={`text-sm ${muted}`}>≈ ₱{tx.amount_php?.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${cat.color}`}>
                  {cat.emoji} {cat.label}
                </span>
              </div>
            </div>

            {/* Merchant / Recipient */}
            <div className={`rounded-2xl border ${darkMode ? "border-white/8 bg-white/5" : "border-black/8 bg-black/4"} overflow-hidden mb-4`}>
              <Row label="To" value={tx.recipient_name} muted={muted} text={text} divider={divider} />
              {tx.merchant_name && <Row label="Merchant" value={tx.merchant_name} muted={muted} text={text} divider={divider} />}
              <Row label="Via" value={tx.recipient_bank || "—"} muted={muted} text={text} divider={divider} />
              {tx.note && <Row label="Note" value={tx.note} muted={muted} text={text} />}
            </div>

            {/* Transfer details */}
            <div className={`rounded-2xl border ${darkMode ? "border-white/8 bg-white/5" : "border-black/8 bg-black/4"} overflow-hidden mb-4`}>
              <Row label="Date" value={new Date(tx.created_date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })} muted={muted} text={text} divider={divider} />
              <Row label="Time" value={new Date(tx.created_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} muted={muted} text={text} divider={divider} />
              {tx.rate && <Row label="Your Rate" value={`₱${tx.rate?.toFixed(4)} / USD`} muted={muted} text={text} divider={divider} />}
              {tx.rate && <Row label="Mid-market Rate" value={`₱${(tx.rate * 1.02).toFixed(4)} / USD`} valueClass="text-emerald-400" muted={muted} text={text} divider={divider} />}
              {tx.rate && (
                <Row
                  label="vs. Competitors"
                  value={`You saved ₱${((tx.rate * 0.02) * (tx.amount_usd || 0)).toFixed(2)}`}
                  valueClass="text-emerald-400 font-bold"
                  muted={muted} text={text} divider={divider}
                />
              )}
              <Row label="KinnectFi Fee" value={tx.fee ? `$${tx.fee?.toFixed(2)}` : "$0.00 — Free ✦"} valueClass={!tx.fee ? "text-emerald-400 font-bold" : ""} muted={muted} text={text} divider={divider} />
              <Row label="Total Deducted" value={`$${((tx.amount_usd || 0) + (tx.fee || 0)).toFixed(2)}`} valueClass="font-bold" muted={muted} text={text} />
            </div>

            {/* Savings callout */}
            {tx.rate && tx.amount_usd && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
                <span className="text-xl">🎉</span>
                <div>
                  <p className="text-emerald-400 font-bold text-sm">You saved vs. banks!</p>
                  <p className={`text-xs ${muted}`}>Western Union & banks charge up to 4% in hidden fees. KinnectFi: $0.</p>
                </div>
              </div>
            )}

            {/* Reference */}
            <div className={`rounded-2xl border ${darkMode ? "border-white/8 bg-white/5" : "border-black/8 bg-black/4"} p-4 mb-6`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${muted} mb-1`}>Reference ID</p>
              <div className="flex items-center justify-between gap-2">
                <p className={`font-mono text-sm font-semibold ${text}`}>{refId}</p>
                <button onClick={handleCopy} className={`flex items-center gap-1 text-xs font-bold ${copied ? "text-emerald-400" : "text-primary"}`}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Category editor */}
            <div className={`rounded-2xl border ${darkMode ? "border-white/8 bg-white/5" : "border-black/8 bg-black/4"} p-4 mb-4`}>
              <CategoryPicker tx={tx} darkMode={darkMode} onUpdated={(updated) => setTx(updated)} />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => {
                  onClose();
                  // Pre-fill the Pay page with this transaction's details via URL params
                  const params = new URLSearchParams({
                    amount: tx.amount_usd?.toString() || "",
                    recipient: tx.recipient_name || "",
                    bank: tx.recipient_bank || "",
                  });
                  navigate(`/dashboard/pay?${params.toString()}`);
                }}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border font-bold text-sm ${darkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-black/5 text-[#1a2a4a]"} transition-colors`}
              >
                <RefreshCw className="w-4 h-4 text-primary" /> Send Again
              </button>
              <button
                onClick={() => {
                  const lines = [
                    `KinnectFi Transfer Receipt`,
                    `Ref: ${refId}`,
                    `To: ${tx.recipient_name} via ${tx.recipient_bank}`,
                    `Amount: $${tx.amount_usd?.toFixed(2)} USD`,
                    tx.amount_php ? `Received: ₱${tx.amount_php?.toLocaleString("en-PH")}` : "",
                    `Rate: ₱${tx.rate?.toFixed(4)} / USD`,
                    `Fee: $0.00`,
                    `Date: ${new Date(tx.created_date).toLocaleString()}`,
                    `Status: ${tx.status}`,
                  ].filter(Boolean).join("\n");
                  const blob = new Blob([lines], { type: "text/plain" });
                  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                  a.download = `KinnectFi-${refId}.txt`; a.click();
                }}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-secondary font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Receipt ↓
              </button>
            </div>

            {/* Dispute */}
            <button
              onClick={() => setShowDispute(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-orange-500/30 text-orange-400 font-bold text-sm hover:bg-orange-500/5 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" /> Dispute this Transfer
            </button>

            {/* Dispute modal */}
            <AnimatePresence>
              {showDispute && (
                <DisputeFlow tx={tx} onClose={() => setShowDispute(false)} darkMode={darkMode} />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Row({ label, value, muted, text, divider, valueClass = "" }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 border-b last:border-0 ${divider}`}>
      <span className={`text-xs font-semibold ${muted}`}>{label}</span>
      <span className={`text-sm font-semibold text-right max-w-[60%] ${text} ${valueClass}`}>{value}</span>
    </div>
  );
}