/**
 * CategoryPicker — inline category re-labeling for any transaction.
 */
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = [
  { value: "remittance",    label: "Remittance",    emoji: "💸" },
  { value: "bills",         label: "Bills",         emoji: "⚡" },
  { value: "subscriptions", label: "Subscriptions", emoji: "📺" },
  { value: "savings",       label: "Savings",       emoji: "🏦" },
  { value: "other",         label: "Other",         emoji: "💳" },
];

export default function CategoryPicker({ tx, darkMode, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(tx.category || "remittance");

  const handlePick = async (val) => {
    if (val === current || saving) return;
    setSaving(true);
    setCurrent(val);
    await base44.entities.Transfer.update(tx.id, { category: val }).catch(() => {});
    setSaving(false);
    onUpdated?.({ ...tx, category: val });
  };

  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Category</p>
        {saving && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => handlePick(cat.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              current === cat.value
                ? "border-primary bg-primary/10 text-primary"
                : darkMode
                  ? "border-white/10 text-white/50 hover:border-white/30"
                  : "border-black/10 text-black/50 hover:border-black/30"
            }`}
          >
            {cat.emoji} {cat.label}
            {current === cat.value && <Check className="w-3 h-3" />}
          </button>
        ))}
      </div>
    </div>
  );
}