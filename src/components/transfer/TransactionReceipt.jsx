/**
 * TransactionReceipt — Monzo/Wise-style post-transfer receipt.
 * Features: animated success state, full breakdown, share + download.
 */
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2, X, Check, Copy, ArrowRight } from "lucide-react";

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TransactionReceipt({ transfer, onClose, darkMode }) {
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef(null);

  const {
    amount_usd, amount_php, recipient_name, recipient_bank,
    rate, fee = 0, status, created_date, reference_id, note,
  } = transfer;

  const refId = reference_id || `KFI-${Date.now().toString(36).toUpperCase()}`;
  const phpAmount = amount_php || (amount_usd * (rate || 56.24));

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    const text = `KinnectFi Transfer Receipt\n\n` +
      `Amount: $${parseFloat(amount_usd).toFixed(2)} → ₱${parseFloat(phpAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}\n` +
      `Recipient: ${recipient_name} (${recipient_bank})\n` +
      `Reference: ${refId}\n` +
      `Status: ${status?.toUpperCase() || "COMPLETED"}\n` +
      `Date: ${formatDate(created_date)}\n\n` +
      `Sent via KinnectFi — Zero-fee cross-border transfers`;
    if (navigator.share) {
      await navigator.share({ title: "KinnectFi Receipt", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert("Receipt copied to clipboard!");
    }
  };

  const handleDownload = () => {
    const content = `KinnectFi Transfer Receipt
============================
Reference: ${refId}
Date: ${formatDate(created_date)}

SENDER: You
RECIPIENT: ${recipient_name}
BANK/WALLET: ${recipient_bank}

You Sent:   USD $${parseFloat(amount_usd).toFixed(2)}
They Get:   PHP ₱${parseFloat(phpAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
Rate:       1 USD = ₱${parseFloat(rate || 56.24).toFixed(2)}
Fee:        $${parseFloat(fee).toFixed(2)} (FREE)

Status:     ${(status || "completed").toUpperCase()}
${note ? `Note: ${note}` : ""}

============================
KinnectFi — Zero-fee cross-border neobank
Built for Filipino OFWs worldwide 🇵🇭
www.kinnect.fi`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KinnectFi-Receipt-${refId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full sm:max-w-sm bg-[#0d1526] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Success header */}
        <div className="relative px-6 pt-8 pb-6 text-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0a2a1a 0%, #0d1526 100%)" }}>
          {/* Ripple circles */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full border border-emerald-500/30"
              style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            />
          ))}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4 relative z-10"
          >
            <Check className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10"
          >
            <p className="text-emerald-400 font-extrabold text-xl mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Transfer Sent! 🇵🇭
            </p>
            <p className="text-white/40 text-sm">Your padala is on its way</p>
          </motion.div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt body */}
        <div className="px-6 pb-8" ref={receiptRef}>
          {/* Amount */}
          <div className="py-5 flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">You sent</p>
              <p className="text-white font-black text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ${parseFloat(amount_usd).toFixed(2)}
              </p>
              <p className="text-white/30 text-xs">USD</p>
            </div>
            <div className="flex flex-col items-center gap-1 px-3">
              <ArrowRight className="w-5 h-5 text-primary" />
              <span className="text-primary text-[9px] font-bold">₱{parseFloat(rate || 56.24).toFixed(2)}</span>
            </div>
            <div className="text-center flex-1">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">They get</p>
              <p className="text-primary font-black text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ₱{parseFloat(phpAmount).toLocaleString("en-PH", { minimumFractionDigits: 0 })}
              </p>
              <p className="text-white/30 text-xs">PHP</p>
            </div>
          </div>

          {/* Dashed divider (receipt tear line) */}
          <div className="relative my-2">
            <div className="border-t border-dashed border-white/15" />
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black" />
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black" />
          </div>

          {/* Details */}
          <div className="space-y-3 py-4">
            {[
              { label: "Recipient", value: recipient_name },
              { label: "Bank / Wallet", value: recipient_bank },
              { label: "Transfer fee", value: `$${parseFloat(fee).toFixed(2)}`, valueClass: "text-emerald-400 font-bold" },
              { label: "Exchange rate", value: `1 USD = ₱${parseFloat(rate || 56.24).toFixed(2)}` },
              { label: "Status", value: (status || "completed").toUpperCase(), valueClass: "text-emerald-400 font-bold" },
              { label: "Date", value: formatDate(created_date) },
              ...(note ? [{ label: "Note", value: note }] : []),
            ].map((row, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <span className="text-white/40 text-xs flex-shrink-0">{row.label}</span>
                <span className={`text-xs text-right ${row.valueClass || "text-white/80"}`}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Reference ID */}
          <button
            onClick={handleCopyRef}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 mb-5 hover:bg-white/8 transition-colors"
          >
            <div className="text-left">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Reference ID</p>
              <p className="text-white font-mono text-sm font-bold">{refId}</p>
            </div>
            {copied
              ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              : <Copy className="w-4 h-4 text-white/30 flex-shrink-0" />
            }
          </button>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 font-semibold text-sm transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-secondary hover:opacity-90 font-bold text-sm transition-opacity"
            >
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}