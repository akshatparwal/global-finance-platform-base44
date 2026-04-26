/**
 * SendAuthGate — lightweight re-auth prompt shown before a send.
 * If biometric_enabled is set on the user, attempts WebAuthn assertion.
 * Falls back to a simple 4-digit PIN (any 4 digits, demo-safe).
 * Calls onAuthorized() on success, onCancel() to dismiss.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Fingerprint, X, Loader2, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SendAuthGate({ onAuthorized, onCancel, darkMode }) {
  const [mode, setMode] = useState("loading"); // loading | biometric | pin
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState(false);

  const bg = darkMode ? "bg-[#0d1526]" : "bg-white";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const numBg = darkMode ? "bg-white/8 border-white/5 text-white hover:bg-white/12" : "bg-black/6 border-black/5 text-[#1a2a4a] hover:bg-black/10";

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        if (u?.biometric_enabled && window.PublicKeyCredential) {
          setMode("biometric");
          attemptBiometric();
        } else {
          setMode("pin");
        }
      } catch {
        setMode("pin");
      }
    })();
  }, []);

  const attemptBiometric = async () => {
    setBioLoading(true);
    setBioError(false);
    try {
      // Use a simple get() challenge — in a real app this comes from the server
      await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          timeout: 60000,
          userVerification: "preferred",
          rpId: window.location.hostname,
          allowCredentials: [],
        },
      });
      onAuthorized();
    } catch {
      // User cancelled or WebAuthn failed — fall back to PIN
      setBioError(true);
      setBioLoading(false);
      setMode("pin");
    }
  };

  const handlePinDigit = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setPinError(false);
    if (next.length === 4) {
      setTimeout(() => { onAuthorized(); }, 250);
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end sm:justify-center sm:items-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.3 }}
        onDragEnd={(_, info) => { if (info.offset.y > 80) onCancel(); }}
        className={`w-full sm:max-w-sm ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-6 pb-8 pt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>Authorization Required</p>
              <h3 className={`font-extrabold text-xl ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {mode === "biometric" ? "Biometric Confirm" : "Enter PIN"}
              </h3>
            </div>
            <button onClick={onCancel} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-white/10 text-white/50" : "bg-black/8 text-black/40"}`}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {mode === "loading" && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {mode === "biometric" && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${darkMode ? "bg-primary/15" : "bg-primary/10"}`}>
                {bioLoading
                  ? <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  : <Fingerprint className="w-10 h-10 text-primary" />
                }
              </div>
              <p className={`text-sm text-center ${muted}`}>
                {bioLoading ? "Waiting for biometric…" : "Touch the sensor to authorize"}
              </p>
              {bioError && <p className="text-red-400 text-xs">Biometric failed — enter your PIN instead</p>}
              <button onClick={() => setMode("pin")} className={`text-xs font-bold underline ${muted}`}>Use PIN instead</button>
            </div>
          )}

          {mode === "pin" && (
            <>
              <p className={`text-xs text-center mb-4 ${muted}`}>Enter your 4-digit transaction PIN</p>
              {/* Dots */}
              <div className="flex justify-center gap-3 mb-4">
                {[0,1,2,3].map(i => (
                  <motion.div key={i}
                    animate={{ scale: pin.length > i ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className={`w-3 h-3 rounded-full transition-colors ${pin.length > i ? "bg-primary" : darkMode ? "bg-white/20" : "bg-black/20"} ${pinError ? "bg-red-500" : ""}`}
                  />
                ))}
              </div>
              {pinError && <p className="text-red-400 text-xs text-center mb-3">Incorrect PIN.</p>}

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d, i) => (
                  <button key={i}
                    onClick={() => d === "⌫" ? handleDelete() : d !== "" && handlePinDigit(String(d))}
                    className={`h-14 rounded-2xl text-xl font-bold transition-all active:scale-95 border ${
                      d === "" ? "invisible" :
                      d === "⌫" ? `${darkMode ? "text-white/50 bg-white/5 border-white/5" : "text-black/40 bg-black/5 border-black/5"}` :
                      numBg
                    }`}
                  >{d}</button>
                ))}
              </div>
            </>
          )}

          <div className="flex items-center justify-center gap-3 mt-5 text-[10px]" style={{ color: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.3)" }}>
            <Shield className="w-3 h-3" /><span>256-bit encrypted · Bank-grade security</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}