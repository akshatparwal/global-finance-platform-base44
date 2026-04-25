/**
 * NetworkErrorBanner — Shows when network request fails, with retry option.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RotateCcw, X } from "lucide-react";

export default function NetworkErrorBanner({ darkMode, onRetry, autoHide = true }) {
  const [show, setShow] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetry?.();
      if (autoHide) setShow(false);
    } finally {
      setRetrying(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
            darkMode
              ? "bg-red-500/10 border-red-500/20"
              : "bg-red-500/8 border-red-500/15"
          }`}
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-500 text-xs font-semibold">Connection error</p>
            <p className={`text-[11px] ${darkMode ? "text-red-400/70" : "text-red-600/70"}`}>
              Check your connection and try again
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/30 active:scale-95 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" />
              {retrying ? "Retrying..." : "Retry"}
            </button>
            <button
              onClick={() => setShow(false)}
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                darkMode ? "text-red-500/50 hover:bg-red-500/10" : "text-red-600/50 hover:bg-red-500/10"
              }`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}