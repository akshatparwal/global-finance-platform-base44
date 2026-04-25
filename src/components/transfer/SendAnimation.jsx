/**
 * SendAnimation — money-flying-to-Philippines celebration overlay.
 * Show it after a successful transfer, auto-dismisses after 2.8s.
 */
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COINS = ["💸", "💛", "🪙", "💰", "✈️"];

export default function SendAnimation({ show, amount, recipientName, onDone }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          {/* Flying coins */}
          {COINS.map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-3xl select-none pointer-events-none"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
              animate={{
                x: (Math.cos((i / COINS.length) * Math.PI * 2) * 120),
                y: (Math.sin((i / COINS.length) * Math.PI * 2) * 120) - 30,
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.4, 1, 0.3],
              }}
              transition={{ duration: 1.6, delay: i * 0.08, ease: "easeOut" }}
            >
              {emoji}
            </motion.span>
          ))}

          {/* Main card */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative text-center px-8 py-10 rounded-3xl bg-[#0d1526] border border-white/10 shadow-2xl max-w-xs w-full mx-4"
          >
            {/* Plane arc */}
            <motion.div
              className="text-5xl mb-2 inline-block"
              animate={{ x: [0, 18, 0], y: [0, -14, 0], rotate: [0, 15, 0] }}
              transition={{ duration: 1.2, ease: "easeInOut", repeat: 1 }}
            >
              ✈️
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Padala Sent!</p>
              <p className="text-white font-extrabold text-4xl mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ${amount}
              </p>
              <p className="text-primary font-bold text-sm mb-3">→ Philippines 🇵🇭</p>
              {recipientName && (
                <p className="text-white/50 text-xs">on its way to <span className="text-white font-semibold">{recipientName}</span></p>
              )}
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="mt-5 h-1 rounded-full bg-white/10 overflow-hidden"
            >
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.6, ease: "linear" }}
              />
            </motion.div>
            <p className="text-white/30 text-[10px] mt-2">Arriving in ~30 seconds</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}