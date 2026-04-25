/**
 * CreateScheduledForm — bottom sheet to create an auto-padala scheduled transfer.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMOJIS = ["💸", "🏠", "🎓", "🏥", "🛒", "💡", "📱", "❤️"];
const FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
];

export default function CreateScheduledForm({ onClose, onCreated, darkMode }) {
  const [emoji, setEmoji] = useState("💸");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const bg = darkMode ? "bg-[#0d1526]" : "bg-white";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const inputCls = `w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors ${
    darkMode ? "bg-[#1a2332] border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"
  }`;

  const handleSave = async () => {
    if (!label || !amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    await base44.entities.ScheduledTransfer.create({
      emoji,
      label,
      amount: parseFloat(amount),
      frequency,
      day_of_month: parseInt(dayOfMonth),
      currency,
      is_active: true,
    });
    setSaving(false);
    setDone(true);
    setTimeout(() => { onCreated?.(); onClose(); }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`w-full sm:max-w-md ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div>
            <h3 className={`font-extrabold text-xl ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Auto-Padala</h3>
            <p className={`text-xs ${muted}`}>Set up a recurring transfer to your family</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <p className={`font-extrabold text-xl ${text} mb-1`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Auto-Padala Set!</p>
            <p className={`text-sm ${muted}`}>Your family will receive {currency === "USD" ? "$" : "₱"}{amount} {frequency}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-4">
            {/* Emoji picker */}
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2`}>Icon</p>
              <div className="flex gap-2 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${emoji === e ? "bg-primary/20 ring-2 ring-primary" : darkMode ? "bg-white/5" : "bg-black/5"}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2`}>Label</p>
              <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Monthly Allowance for Nanay" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2`}>Amount</p>
                <div className={`flex items-center border rounded-xl overflow-hidden ${darkMode ? "bg-[#1a2332] border-white/10" : "bg-[#f5efe6] border-black/10"}`}>
                  <span className={`px-3 font-bold ${muted}`}>{currency === "USD" ? "$" : "₱"}</span>
                  <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" className={`flex-1 py-3 pr-3 bg-transparent outline-none font-bold text-sm ${darkMode ? "text-white" : "text-[#1a2a4a]"}`} />
                </div>
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2`}>Currency</p>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
                  <option value="USD">USD ($)</option>
                  <option value="PHP">PHP (₱)</option>
                </select>
              </div>
            </div>

            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2`}>Frequency</p>
              <div className="grid grid-cols-3 gap-2">
                {FREQUENCIES.map(f => (
                  <button key={f.value} onClick={() => setFrequency(f.value)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${frequency === f.value ? "border-primary bg-primary/10 text-primary" : darkMode ? "border-white/10 text-white/50" : "border-black/10 text-black/50"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {frequency === "monthly" && (
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2`}>Day of Month</p>
                <select value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} className={inputCls}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>Day {d}{d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}</option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={handleSave} disabled={!label || !amount || parseFloat(amount) <= 0 || saving}
              className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity">
              {saving ? "Setting up..." : `Set Up Auto-Padala →`}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}