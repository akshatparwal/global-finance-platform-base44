/**
 * PostOnboardingCard — shown after KYC completion.
 * Wise/Monzo-style "3 things to do first" nudge card.
 * Dismissed via localStorage so it only shows once.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, ArrowDownToLine, UserPlus, Send } from "lucide-react";

const LS_KEY = "kf_onboarding_card_dismissed";

export default function PostOnboardingCard({ darkMode, onFund, user }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(LS_KEY) === "true"; } catch { return false; }
  });
  const navigate = useNavigate();

  // Track completion of 3 steps based on user data
  const hasFunded = user?.wallet_funded || false;
  const hasAddedRecipient = !!user?.first_recipient_name;
  const hasSentTransfer = user?.first_transfer_sent || false;

  const completed = [hasFunded, hasAddedRecipient, hasSentTransfer];
  const completedCount = completed.filter(Boolean).length;

  // Hide if user explicitly dismissed OR all 3 steps completed
  if (dismissed || completedCount === 3) return null;

  const dismiss = () => {
    try { localStorage.setItem(LS_KEY, "true"); } catch {}
    setDismissed(true);
  };

  // Show only remaining steps
  const allSteps = [
    { icon: ArrowDownToLine, label: "Add funds to your wallet", sub: "via ACH, wire or debit card", action: () => { onFund?.(); }, cta: "Add Funds", done: hasFunded },
    { icon: UserPlus, label: "Add your first recipient", sub: "family in the Philippines", action: () => { navigate("/dashboard/recipients"); }, cta: "Add Recipient", done: hasAddedRecipient },
    { icon: Send, label: "Send your first padala", sub: "zero fees, live rate", action: () => { navigate("/dashboard/pay"); }, cta: "Send Now", done: hasSentTransfer },
  ];

  const steps = allSteps.filter(s => !s.done);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl overflow-hidden mb-4 relative"
      style={{ background: "linear-gradient(135deg, #0d1526 0%, #1a2a4a 50%, #3d2600 100%)" }}
    >
      <button onClick={dismiss} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors z-10">
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🎉</span>
          <p className="text-white font-extrabold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>You're verified! Here's what's next.</p>
        </div>
        <p className="text-white/40 text-xs mb-4">Complete these 3 steps to start supporting your family.</p>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={s.action}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/8 hover:bg-white/12 border border-white/8 text-left transition-all active:scale-[0.99]"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{s.label}</p>
                <p className="text-white/40 text-xs">{s.sub}</p>
              </div>
              <span className="text-primary text-xs font-bold flex-shrink-0">{s.cta} →</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}