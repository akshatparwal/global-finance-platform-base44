import { motion } from "framer-motion";
import { Shield, ChevronRight, CheckCircle } from "lucide-react";

export default function OnboardingBanner({ user, onOpen, darkMode }) {
  const steps = [
    { label: "Identity",  done: !!user?.kyc_doc_url },
    { label: "Selfie",    done: !!user?.kyc_selfie_url },
    { label: "Phone",     done: !!user?.phone_verified },
    { label: "Recipient", done: !!user?.first_recipient_name },
  ];

  const completed = steps.filter(s => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);
  const nextStep = steps.find(s => !s.done)?.label || "Review";

  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="w-full text-left"
    >
      <div className="rounded-2xl overflow-hidden border border-primary/30 bg-primary/5">
        {/* Top strip */}
        <div className="bg-primary px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-secondary" />
            <span className="text-secondary font-black text-xs uppercase tracking-wider">Complete Your KYC Setup</span>
          </div>
          <span className="text-secondary/70 text-xs font-bold">{pct}% done</span>
        </div>

        <div className="px-4 py-3">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </div>

          {/* Step chips */}
          <div className="flex gap-1.5 flex-wrap mb-3">
            {steps.map((s, i) => (
              <div key={i}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                  s.done
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border-white/10 text-white/30"
                }`}>
                {s.done ? <CheckCircle className="w-2.5 h-2.5" /> : <span className="w-2 h-2 rounded-full border border-current" />}
                {s.label}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-white/50 text-xs">
              Next: <span className="text-primary font-bold">{nextStep}</span> →
            </p>
            <div className="flex items-center gap-1 text-primary text-xs font-bold">
              Continue Setup <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}