/**
 * WhatsNew — changelog modal shown once per version.
 * Persisted in localStorage so it only appears on new releases.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

const CURRENT_VERSION = "2.4.0";
const LS_KEY = "kinnectfi_whats_new_seen";

const CHANGES = [
  { emoji: "✈️", title: "Transfer Animation", desc: "Watch your money fly to the Philippines with a beautiful send animation." },
  { emoji: "📊", title: "Live Market Data", desc: "Real-time PSEI index and stock prices, refreshed on demand." },
  { emoji: "🛡️", title: "Dispute Center", desc: "File a chargeback directly from any transaction detail." },
  { emoji: "🏦", title: "Account Details", desc: "Your routing & account numbers are now visible in Profile." },
  { emoji: "👨‍👩‍👧", title: "Real Family Network", desc: "Family tab now shows your actual saved recipients." },
  { emoji: "🔖", title: "Category Editing", desc: "Re-tag any transaction category inline in its detail view." },
];

export default function WhatsNew({ darkMode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(LS_KEY);
    if (seen !== CURRENT_VERSION) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(LS_KEY, CURRENT_VERSION);
    setShow(false);
  };

  const bg = darkMode ? "bg-[#0d1526]" : "bg-white";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className={`w-full sm:max-w-md ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden`}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>Version {CURRENT_VERSION}</p>
                  <h2 className={`font-extrabold text-lg leading-tight ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    What's New 🎉
                  </h2>
                </div>
              </div>
              <button onClick={dismiss} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-white/10" : "bg-black/10"}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Changes list */}
            <div className="px-6 pb-3 space-y-3 max-h-72 overflow-y-auto">
              {CHANGES.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? "bg-white/5" : "bg-black/4"}`}
                >
                  <span className="text-xl flex-shrink-0">{c.emoji}</span>
                  <div>
                    <p className={`text-sm font-bold ${text}`}>{c.title}</p>
                    <p className={`text-xs ${muted}`}>{c.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="px-6 pb-8 pt-3">
              <button
                onClick={dismiss}
                className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 transition-opacity"
              >
                Got it — Let's Go 🚀
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}