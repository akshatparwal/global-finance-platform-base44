/**
 * SessionTimeoutWarning — Revolut/Wise-style inactivity warning banner.
 * Shows when the user has been idle for ~13 minutes, counting down to auto-logout.
 */
import { motion } from "framer-motion";
import { Clock, RefreshCw } from "lucide-react";

export default function SessionTimeoutWarning({ secondsLeft, onExtend, onLogout, darkMode }) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`;
  const urgent = secondsLeft <= 30;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm"
    >
      <div
        className={`rounded-2xl shadow-2xl border px-5 py-4 ${
          urgent
            ? "bg-red-900/95 border-red-500/40"
            : darkMode
            ? "bg-[#1a2332]/95 border-white/15"
            : "bg-white/95 border-black/10"
        } backdrop-blur-xl`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${urgent ? "bg-red-500/20" : "bg-primary/15"}`}>
            <Clock className={`w-5 h-5 ${urgent ? "text-red-400" : "text-primary"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${urgent ? "text-red-300" : darkMode ? "text-white" : "text-[#1a2a4a]"}`}>
              Session expiring soon
            </p>
            <p className={`text-xs ${urgent ? "text-red-400/70" : darkMode ? "text-white/50" : "text-[#1a2a4a]/50"}`}>
              You'll be logged out in <span className={`font-black ${urgent ? "text-red-300" : "text-primary"}`}>{timeStr}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExtend}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-secondary font-bold py-2.5 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              darkMode ? "border-white/15 text-white/50 hover:bg-white/5" : "border-black/10 text-[#1a2a4a]/50 hover:bg-black/5"
            }`}
          >
            Log Out
          </button>
        </div>
      </div>
    </motion.div>
  );
}