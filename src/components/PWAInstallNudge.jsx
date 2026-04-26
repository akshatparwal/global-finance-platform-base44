/**
 * PWAInstallNudge — shows once on mobile to prompt "Add to Home Screen".
 * Uses the beforeinstallprompt event on Android Chrome; iOS shows a manual tip.
 * Dismissed state persisted in localStorage.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share } from "lucide-react";

const LS_KEY = "kf_pwa_nudge_dismissed";

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isInStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
}

export default function PWAInstallNudge({ darkMode }) {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(LS_KEY)) return;
    if (isInStandaloneMode()) return;

    setIos(isIOS());

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS doesn't fire beforeinstallprompt — show manual tip after delay
    if (isIOS()) {
      const t = setTimeout(() => setShow(true), 4000);
      return () => { clearTimeout(t); window.removeEventListener("beforeinstallprompt", handler); };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(LS_KEY, "true");
    setShow(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") dismiss();
      else setShow(false);
    }
  };

  const bg = darkMode ? "bg-[#1a2332] border-white/15" : "bg-white border-black/10";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[198] w-[calc(100%-2rem)] max-w-sm"
        >
          <div className={`rounded-2xl shadow-2xl border px-5 py-4 backdrop-blur-xl ${bg}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  <img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg" className="w-full h-full scale-150 object-cover" />
                </div>
                <div>
                  <p className={`font-bold text-sm ${text}`}>Add KinnectFi to Home Screen</p>
                  <p className={`text-xs ${muted}`}>Instant access, no browser needed</p>
                </div>
              </div>
              <button onClick={dismiss} className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-white/10 text-white/50" : "bg-black/8 text-black/40"}`}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {ios ? (
              <div className={`rounded-xl p-3 text-xs ${darkMode ? "bg-white/8" : "bg-black/5"} ${muted} mb-3`}>
                <p>Tap <Share className="inline w-3.5 h-3.5 mx-0.5" /> <strong>Share</strong> → <strong>"Add to Home Screen"</strong> in Safari</p>
              </div>
            ) : null}

            <div className="flex gap-2">
              {!ios && (
                <button onClick={handleInstall}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-secondary font-bold py-2.5 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all">
                  <Download className="w-4 h-4" /> Install App
                </button>
              )}
              <button onClick={dismiss}
                className={`${ios ? "flex-1" : ""} px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${darkMode ? "border-white/15 text-white/50" : "border-black/10 text-[#1a2a4a]/50"}`}>
                {ios ? "Got it" : "Not now"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}