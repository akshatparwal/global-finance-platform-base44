/**
 * SendAnimation — full-screen confetti burst on successful send.
 * Auto-dismisses after 2s, then calls onDone.
 */
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function SendAnimation({ show, amount, recipientName, onDone }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!show) { firedRef.current = false; return; }
    if (firedRef.current) return;
    firedRef.current = true;

    // Confetti burst — gold + white
    const fire = (particleRatio, opts) =>
      confetti({
        origin: { y: 0.55 },
        colors: ["#F4C94E", "#ffffff", "#f0d080", "#ffe066"],
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2,  { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1,  { spread: 60, startVelocity: 45 });

    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.75, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            className="relative text-center px-8 py-10 rounded-3xl max-w-xs w-full mx-4"
            style={{ background: "#141829", border: "1px solid rgba(244,201,78,0.2)" }}
          >
            {/* Animated plane */}
            <motion.div
              className="text-5xl mb-3 inline-block"
              animate={{ x: [0, 20, 0], y: [0, -16, 0], rotate: [0, 18, 0] }}
              transition={{ duration: 1.0, ease: "easeInOut", repeat: 1 }}
            >
              ✈️
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <p className="text-white/45 text-xs uppercase tracking-widest mb-1">Padala Sent!</p>
              <p className="text-white font-light text-5xl mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                ${amount}
              </p>
              <p className="text-[#F4C94E] font-semibold text-sm mb-3">→ Philippines 🇵🇭</p>
              {recipientName && (
                <p className="text-white/45 text-xs">
                  on its way to <span className="text-white font-medium">{recipientName}</span>
                </p>
              )}
            </motion.div>

            {/* Progress bar */}
            <div className="mt-5 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "#F4C94E" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.0, ease: "linear" }}
              />
            </div>
            <p className="text-white/25 text-[10px] mt-2">Arriving in ~30 seconds</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}