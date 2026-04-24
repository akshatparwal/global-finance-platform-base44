/**
 * AddFundsModal — Monzo Pots-style modal for contributing to a savings goal.
 * Features: one-tap quick amounts, custom amount, auto-save toggle, round-up toggle.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, RefreshCw, ChevronDown, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import confetti from "canvas-confetti";
import { haptic } from "@/utils/haptic";
import { sfx } from "@/utils/sounds";

const QUICK_AMOUNTS = [10, 25, 50, 100, 250];
const FREQ_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  per_transfer: "Per Transfer",
};

export default function AddFundsModal({ goal, onClose, onUpdated, darkMode }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-save settings (start from goal's existing config)
  const [autoSave, setAutoSave] = useState(goal.auto_save_enabled || false);
  const [autoAmount, setAutoAmount] = useState(String(goal.auto_save_amount || ""));
  const [autoFreq, setAutoFreq] = useState(goal.auto_save_frequency || "monthly");
  const [roundUp, setRoundUp] = useState(goal.round_up_enabled || false);

  const [showFreqPicker, setShowFreqPicker] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const newTotal = (goal.current_amount || 0) + parsedAmount;
  const pct = goal.target_amount > 0 ? Math.min(Math.round((newTotal / goal.target_amount) * 100), 100) : 0;
  const oldPct = goal.target_amount > 0 ? Math.min(Math.round(((goal.current_amount || 0) / goal.target_amount) * 100), 100) : 0;

  const bg = darkMode ? "bg-[#0d1526]" : "bg-white";
  const card = darkMode ? "bg-white/5 border-white/10" : "bg-[#f5efe6] border-black/8";
  const inputCls = `w-full border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm ${
    darkMode ? "bg-white/5 border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"
  }`;
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";

  const handleContribute = async () => {
    if (parsedAmount <= 0) return;
    setSaving(true);

    const contributions = [
      ...(goal.contributions || []),
      { amount: parsedAmount, note: note || "Manual contribution", date: new Date().toISOString() },
    ];

    await base44.entities.SavingsGoal.update(goal.id, {
      current_amount: newTotal,
      auto_save_enabled: autoSave,
      auto_save_amount: parseFloat(autoAmount) || 0,
      auto_save_frequency: autoFreq,
      round_up_enabled: roundUp,
      contributions,
    });

    setSaving(false);
    setSuccess(true);
    haptic.success();
    sfx.coin();

    // Confetti burst if goal is reached or crossed 100%
    if (pct >= 100) {
      setTimeout(() => {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ["#C97B22", "#1a2a4a", "#ffffff", "#f5efe6"] });
        sfx.success();
      }, 200);
    }

    setTimeout(() => {
      onUpdated({ ...goal, current_amount: newTotal, auto_save_enabled: autoSave, auto_save_amount: parseFloat(autoAmount) || 0, auto_save_frequency: autoFreq, round_up_enabled: roundUp, contributions });
      onClose();
    }, pct >= 100 ? 2200 : 1200);
  };

  const handleSaveRules = async () => {
    await base44.entities.SavingsGoal.update(goal.id, {
      auto_save_enabled: autoSave,
      auto_save_amount: parseFloat(autoAmount) || 0,
      auto_save_frequency: autoFreq,
      round_up_enabled: roundUp,
    });
    onUpdated({ ...goal, auto_save_enabled: autoSave, auto_save_amount: parseFloat(autoAmount) || 0, auto_save_frequency: autoFreq, round_up_enabled: roundUp });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`w-full sm:max-w-md ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden`}
      >
        {/* Goal header */}
        <div className="px-6 pt-6 pb-4 relative" style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2e00 60%, #8a6a00 100%)" }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{goal.emoji || "🎯"}</span>
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-widest">Add to Goal</p>
              <h3 className="text-white font-extrabold text-lg leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{goal.label}</h3>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-white/10 rounded-full mb-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: `${oldPct}%` }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-white/40 text-[10px]">
            <span>${(goal.current_amount || 0).toLocaleString()} saved</span>
            <span>${goal.target_amount?.toLocaleString()} goal · {pct}%</span>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <p className={`font-extrabold text-xl mb-1 ${text}`}>+${parsedAmount.toFixed(2)} added!</p>
                <p className={`text-sm ${muted}`}>{goal.label} is now at {pct}%</p>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-5">
                {/* Amount input */}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${muted} mb-2`}>Amount to Add</p>
                  <div className={`flex items-center border rounded-xl overflow-hidden ${darkMode ? "bg-white/5 border-white/10" : "bg-[#f5efe6] border-black/10"}`}>
                    <span className={`px-4 text-xl font-bold ${muted}`}>$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className={`flex-1 bg-transparent py-4 text-2xl font-black outline-none ${text}`}
                    />
                  </div>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 flex-wrap">
                  {QUICK_AMOUNTS.map(q => (
                    <button
                      key={q}
                      onClick={() => setAmount(String(q))}
                      className={`flex-1 min-w-[52px] py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                        parseFloat(amount) === q
                          ? "bg-primary text-secondary border-primary"
                          : darkMode ? "border-white/10 text-white/60 hover:border-white/30" : "border-black/10 text-[#1a2a4a]/60 hover:border-black/30"
                      }`}
                    >
                      ${q}
                    </button>
                  ))}
                </div>

                {/* Note */}
                <input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note (optional)"
                  className={inputCls}
                />

                {/* Divider */}
                <div className={`flex items-center gap-3 ${muted}`}>
                  <div className={`flex-1 h-px ${darkMode ? "bg-white/10" : "bg-black/10"}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">Auto-Save Rules</span>
                  <div className={`flex-1 h-px ${darkMode ? "bg-white/10" : "bg-black/10"}`} />
                </div>

                {/* Auto-save toggle */}
                <div className={`border rounded-2xl p-4 space-y-4 ${card}`}>
                  {/* Auto-save */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${text}`}>Auto-Save</p>
                        <p className={`text-xs ${muted}`}>Automatically add money on a schedule</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAutoSave(!autoSave)}
                      className={`w-11 h-6 rounded-full transition-all flex-shrink-0 relative ${autoSave ? "bg-primary" : darkMode ? "bg-white/20" : "bg-black/20"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoSave ? "left-6" : "left-1"}`} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {autoSave && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className={`flex items-center border rounded-xl px-3 py-2.5 ${darkMode ? "bg-black/20 border-white/10" : "bg-white border-black/10"}`}>
                            <span className={`text-sm mr-1 ${muted}`}>$</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={autoAmount}
                              onChange={e => setAutoAmount(e.target.value)}
                              placeholder="Amount"
                              className={`flex-1 bg-transparent outline-none text-sm font-bold ${text}`}
                            />
                          </div>
                          {/* Frequency picker */}
                          <div className="relative">
                            <button
                              onClick={() => setShowFreqPicker(!showFreqPicker)}
                              className={`w-full flex items-center justify-between border rounded-xl px-3 py-2.5 text-sm font-bold ${darkMode ? "bg-black/20 border-white/10 text-white" : "bg-white border-black/10 text-[#1a2a4a]"}`}
                            >
                              {FREQ_LABELS[autoFreq]}
                              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                            </button>
                            <AnimatePresence>
                              {showFreqPicker && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  className={`absolute top-full mt-1 w-full rounded-xl border shadow-xl z-10 overflow-hidden ${darkMode ? "bg-[#1a2332] border-white/10" : "bg-white border-black/10"}`}
                                >
                                  {Object.entries(FREQ_LABELS).map(([val, label]) => (
                                    <button
                                      key={val}
                                      onClick={() => { setAutoFreq(val); setShowFreqPicker(false); }}
                                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${autoFreq === val ? "text-primary bg-primary/10" : darkMode ? "text-white hover:bg-white/5" : "text-[#1a2a4a] hover:bg-black/5"}`}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <p className={`text-xs ${muted}`}>
                          {autoAmount ? `$${autoAmount} will be moved to this goal ${FREQ_LABELS[autoFreq].toLowerCase()}.` : "Set an amount and frequency above."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Divider */}
                  <div className={`h-px ${darkMode ? "bg-white/10" : "bg-black/10"}`} />

                  {/* Round-up */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <RefreshCw className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${text}`}>Round-Up Savings</p>
                        <p className={`text-xs ${muted}`}>Round each transfer up & save the spare change</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setRoundUp(!roundUp)}
                      className={`w-11 h-6 rounded-full transition-all flex-shrink-0 relative ${roundUp ? "bg-emerald-500" : darkMode ? "bg-white/20" : "bg-black/20"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${roundUp ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                  <AnimatePresence>
                    {roundUp && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                          <p className="text-emerald-500 text-xs font-semibold">
                            ✦ Every transfer gets rounded up to the nearest dollar. The difference goes straight into <strong>{goal.label}</strong>.
                          </p>
                          <p className="text-emerald-500/60 text-xs mt-1">Example: $47.30 transfer → $0.70 saved here</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Save rules only button (if no amount entered) */}
                {(autoSave || roundUp) && !parsedAmount && (
                  <button
                    onClick={async () => { await handleSaveRules(); onClose(); }}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm border transition-colors ${darkMode ? "border-white/10 text-white hover:bg-white/5" : "border-black/10 text-[#1a2a4a] hover:bg-black/5"}`}
                  >
                    Save Rules Only
                  </button>
                )}

                {/* Primary CTA */}
                <button
                  onClick={handleContribute}
                  disabled={parsedAmount <= 0 || saving}
                  className="w-full bg-primary text-secondary font-black py-4 rounded-xl text-base hover:opacity-90 disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : parsedAmount > 0 ? (
                    `Add $${parsedAmount.toFixed(2)} to ${goal.label} →`
                  ) : (
                    "Enter an amount to add"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}