/**
 * PinSetupModal — Revolut-style 4/6-digit transaction PIN setup.
 * Steps: set PIN → confirm PIN → success.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Delete, Check, ShieldCheck } from "lucide-react";

const DIGITS = [1,2,3,4,5,6,7,8,9,null,0,"del"];

function PinDots({ value, length = 6, darkMode }) {
  return (
    <div className="flex gap-3 justify-center my-6">
      {Array.from({ length }).map((_, i) => (
        <motion.div
          key={i}
          animate={value.length > i ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.15 }}
          className={`w-4 h-4 rounded-full border-2 transition-colors ${
            value.length > i
              ? "bg-primary border-primary"
              : darkMode ? "border-white/30" : "border-black/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function PinSetupModal({ onClose, onSaved, darkMode, mode = "set" }) {
  // mode: "set" = set new PIN, "verify" = verify existing PIN
  const [step, setStep] = useState("enter"); // enter | confirm | success | error
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [shake, setShake] = useState(false);
  const PIN_LENGTH = 6;

  const current = step === "confirm" ? confirmPin : pin;
  const setCurrent = step === "confirm" ? setConfirmPin : setPin;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleDigit = (d) => {
    if (d === "del") {
      setCurrent(p => p.slice(0, -1));
      return;
    }
    if (current.length >= PIN_LENGTH) return;
    const next = current + String(d);
    setCurrent(next);

    if (next.length === PIN_LENGTH) {
      setTimeout(() => {
        if (mode === "verify") {
          // Simulate verification (in real app: compare with stored hash)
          const stored = localStorage.getItem("kfi_pin");
          if (!stored || next === stored) {
            setStep("success");
            setTimeout(() => { onSaved(next); onClose(); }, 1200);
          } else {
            triggerShake();
            setCurrent("");
          }
          return;
        }

        if (step === "enter") {
          setStep("confirm");
        } else if (step === "confirm") {
          if (next === pin) {
            localStorage.setItem("kfi_pin", pin);
            setStep("success");
            setTimeout(() => { onSaved(pin); onClose(); }, 1200);
          } else {
            triggerShake();
            setConfirmPin("");
            setStep("enter");
            setPin("");
          }
        }
      }, 80);
    }
  };

  const bg = darkMode ? "bg-[#0d1526]" : "bg-white";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";
  const btnBase = darkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-[#1a2a4a]";

  const title = mode === "verify"
    ? "Enter your PIN"
    : step === "enter" ? "Set Transaction PIN" : "Confirm your PIN";
  const subtitle = mode === "verify"
    ? "Required to authorise this action"
    : step === "enter" ? "Choose a 6-digit PIN for transfers" : "Re-enter your PIN to confirm";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`w-full sm:max-w-xs ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h3 className={`font-extrabold text-lg ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {title}
            </h3>
            <p className={`text-xs ${muted}`}>{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "success" ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-10"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <p className={`font-extrabold text-xl ${text}`}>PIN {mode === "verify" ? "Verified" : "Set"}!</p>
              <p className={`text-sm ${muted} mt-1`}>{mode === "verify" ? "Identity confirmed." : "Your transaction PIN is active."}</p>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <PinDots value={current} length={PIN_LENGTH} darkMode={darkMode} />

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3 px-8 pb-8">
                {DIGITS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => d !== null && handleDigit(d)}
                    className={`h-14 rounded-2xl text-xl font-black transition-all active:scale-90 ${
                      d === null ? "invisible" :
                      d === "del"
                        ? `${btnBase} flex items-center justify-center`
                        : btnBase
                    }`}
                  >
                    {d === "del" ? <Delete className="w-5 h-5" /> : d}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}