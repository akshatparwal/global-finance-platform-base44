/**
 * BiometricNudge — Revolut/Monzo-style "Enable Face ID / Touch ID" one-time prompt.
 * Appears once post-login if the browser supports WebAuthn and the user hasn't dismissed.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "kf_biometric_nudge_dismissed";

export default function BiometricNudge({ darkMode }) {
  const [show, setShow] = useState(false);
  const [supported, setSupported] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    // Check WebAuthn support
    if (window.PublicKeyCredential) {
      setSupported(true);
      // Small delay so it doesn't pop instantly on load
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  };

  const handleEnable = async () => {
    setEnrolling(true);
    try {
      // Register biometric preference on backend
      await base44.auth.updateMe({ biometric_enabled: true });
      setEnrolling(false);
      setDone(true);
      localStorage.setItem(STORAGE_KEY, "true");
      setTimeout(() => setShow(false), 2000);
    } catch (error) {
      console.error("Failed to enable biometrics:", error);
      setEnrolling(false);
    }
  };

  if (!supported) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[199] w-[calc(100%-2rem)] max-w-sm"
        >
          <div className={`rounded-2xl shadow-2xl border px-5 py-4 backdrop-blur-xl ${darkMode ? "bg-[#1a2332]/95 border-white/15" : "bg-white/95 border-black/10"}`}>
            {done ? (
              <div className="flex items-center gap-3 py-1">
                <span className="text-2xl">✅</span>
                <div>
                  <p className={`font-bold text-sm ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>Biometrics enabled!</p>
                  <p className={`text-xs ${darkMode ? "text-white/50" : "text-[#1a2a4a]/50"}`}>Sign in with Face ID / Touch ID next time.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Fingerprint className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>
                        Enable Face ID / Touch ID
                      </p>
                      <p className={`text-xs ${darkMode ? "text-white/50" : "text-[#1a2a4a]/50"}`}>
                        Sign in instantly without a password
                      </p>
                    </div>
                  </div>
                  <button onClick={dismiss} className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-white/10 text-white/50" : "bg-black/8 text-black/40"}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleEnable}
                    disabled={enrolling}
                    className="flex-1 bg-primary text-secondary font-bold py-2.5 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-70"
                  >
                    {enrolling ? "Setting up..." : "Enable →"}
                  </button>
                  <button onClick={dismiss} className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${darkMode ? "border-white/15 text-white/50 hover:bg-white/5" : "border-black/10 text-[#1a2a4a]/50 hover:bg-black/5"}`}>
                    Not now
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}