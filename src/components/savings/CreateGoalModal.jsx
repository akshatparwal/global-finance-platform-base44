import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMOJI_OPTIONS = ["🏠","🎓","✈️","🚗","💻","💍","🏥","🌏","📦","🎯","💰","🛡️","👶","🏖️","⚽"];

export default function CreateGoalModal({ onClose, onCreated, darkMode }) {
  const [label, setLabel] = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const bg = darkMode ? "bg-[#0d1526]" : "bg-white";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const inputCls = `w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors ${
    darkMode ? "bg-white/5 border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"
  }`;

  const handleSave = async () => {
    if (!label || !target || isNaN(parseFloat(target))) return;
    setSaving(true);
    try {
      const newGoal = await base44.entities.SavingsGoal.create({
        emoji,
        label,
        description: description || "Personal savings goal",
        target_amount: parseFloat(target),
        current_amount: 0,
      });
      onCreated(newGoal);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`w-full sm:max-w-sm ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className={`font-extrabold text-lg ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            New Savings Goal
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-8 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Emoji picker */}
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2 block`}>Pick an Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    emoji === e ? "ring-2 ring-primary bg-primary/10 scale-110" : darkMode ? "bg-white/8 hover:bg-white/15" : "bg-black/5 hover:bg-black/10"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
            <span className="text-3xl">{emoji}</span>
            <div>
              <p className={`font-bold text-sm ${text}`}>{label || "Goal Name"}</p>
              <p className={`text-xs ${muted}`}>{target ? `Target: $${parseFloat(target).toLocaleString()}` : "Set your target below"}</p>
            </div>
          </div>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1.5 block`}>Goal Name *</label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Dream Home, Education Fund"
              className={inputCls}
            />
          </div>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1.5 block`}>Target Amount (USD) *</label>
            <div className={`flex items-center border rounded-xl overflow-hidden ${darkMode ? "bg-white/5 border-white/10" : "bg-[#f5efe6] border-black/10"}`}>
              <span className={`px-3 font-bold text-lg ${muted}`}>$</span>
              <input
                type="number"
                inputMode="decimal"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="0.00"
                className={`flex-1 py-3 pr-4 bg-transparent outline-none text-base font-bold ${text}`}
              />
            </div>
          </div>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1.5 block`}>Description (optional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this goal for?"
              className={inputCls}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!label || !target || saving}
            className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {saving ? "Creating..." : "Create Goal →"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}