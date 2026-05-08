/**
 * KatuwangWallet — Shared family savings pod.
 * Dark-teal gradient card with goal progress + contribute CTA.
 * "Katuwang" = partner/ally in Filipino.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, CheckCircle } from "lucide-react";
import TnalakPattern from "./TnalakPattern";

const MOCK_GOAL = {
  label: "Bahay sa Pinas",
  emoji: "🏠",
  target: 15000,
  current: 4250,
  members: ["You", "Nanay", "Ate Maria"],
};

export default function KatuwangWallet({ darkMode, onContribute }) {
  const [goal] = useState(MOCK_GOAL);
  const [contributed, setContributed] = useState(false);

  const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  const remaining = goal.target - goal.current;

  const handleContribute = () => {
    if (onContribute) onContribute();
    setContributed(true);
    setTimeout(() => setContributed(false), 2500);
  };

  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d4a4a 0%, #1a7a7a 50%, #0a3030 100%)" }}
    >
      <TnalakPattern opacity={0.07} color="white" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-3">
        <div>
          <p className="text-teal-300/70 text-[10px] uppercase tracking-widest font-bold mb-0.5">
            Family Savings Pod
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xl">{goal.emoji}</span>
            <h3 className="text-white font-extrabold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {goal.label}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-teal-400/20 border border-teal-400/30 rounded-full px-2.5 py-1">
          <Users className="w-3 h-3 text-teal-300" />
          <span className="text-teal-300 text-[10px] font-bold">{goal.members.length}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="relative z-10 mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-white font-bold">${goal.current.toLocaleString()}</span>
          <span className="text-white/50">of ${goal.target.toLocaleString()}</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #1ABFBF, #D4A843)" }}
          />
        </div>
        <p className="text-white/40 text-[10px] mt-1">
          ${remaining.toLocaleString()} remaining · {pct}% funded
        </p>
      </div>

      {/* Members */}
      <div className="relative z-10 flex items-center gap-2 mb-4">
        {goal.members.map((m, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full bg-teal-500/40 border border-teal-400/40 flex items-center justify-center text-white text-[10px] font-black"
            title={m}
          >
            {m[0]}
          </div>
        ))}
        <button className="w-7 h-7 rounded-full border border-dashed border-teal-400/30 flex items-center justify-center text-teal-400/50 hover:border-teal-400/70 transition-colors">
          <Plus className="w-3 h-3" />
        </button>
        <span className="text-white/40 text-[10px] ml-1">
          Invite family
        </span>
      </div>

      {/* CTA */}
      <div className="relative z-10">
        <button
          onClick={handleContribute}
          className="w-full flex items-center justify-center gap-2 bg-teal-400/20 border border-teal-400/40 text-teal-300 font-bold py-2.5 rounded-xl text-sm hover:bg-teal-400/30 transition-colors active:scale-[0.98]"
        >
          {contributed ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Contributed!
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Contribute to Goal
            </>
          )}
        </button>
      </div>
    </div>
  );
}