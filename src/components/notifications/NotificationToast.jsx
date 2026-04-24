/**
 * NotificationToast — Monzo-style push banner that slides in from the top.
 * Auto-dismisses after 5s. Shows rich content with merchant/recipient.
 */
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TYPE_NAV = {
  transfer_sent:      "/dashboard/transactions",
  transfer_delivered: "/dashboard/transactions",
  transfer_failed:    "/dashboard/pay",
  rate_alert:         "/dashboard/pay",
  savings_milestone:  "/dashboard/insights",
};

const ACCENT = {
  transfer_sent:      "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  transfer_delivered: "from-emerald-400/20 to-emerald-400/5 border-emerald-400/30",
  transfer_failed:    "from-red-500/20 to-red-500/5 border-red-500/30",
  rate_alert:         "from-amber-400/20 to-amber-400/5 border-amber-400/30",
  savings_milestone:  "from-primary/20 to-primary/5 border-primary/30",
};

export default function NotificationToast({ toast, onDismiss, darkMode }) {
  const navigate = useNavigate();
  if (!toast) return null;

  const accent = ACCENT[toast.type] || "from-primary/20 to-primary/5 border-primary/30";

  const handleClick = () => {
    const path = TYPE_NAV[toast.type];
    if (path) navigate(path);
    onDismiss();
  };

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      onClick={handleClick}
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-[200] w-[calc(100vw-2rem)] max-w-sm cursor-pointer`}
    >
      <div className={`bg-gradient-to-br ${accent} backdrop-blur-xl border rounded-2xl px-4 py-3 shadow-2xl flex items-start gap-3`}>
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${darkMode ? "bg-white/10" : "bg-white/80"}`}>
          {toast.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-black uppercase tracking-wider text-primary mb-0.5`}>KinnectFi</p>
          <p className={`text-sm font-bold leading-snug ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>{toast.title}</p>
          <p className={`text-xs mt-0.5 leading-relaxed ${darkMode ? "text-white/60" : "text-[#1a2a4a]/60"}`}>{toast.desc}</p>
        </div>

        {/* Dismiss */}
        <button
          onClick={e => { e.stopPropagation(); onDismiss(); }}
          className={`flex-shrink-0 p-1 rounded-lg ${darkMode ? "text-white/30 hover:text-white/60" : "text-black/30 hover:text-black/60"} transition-colors`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 5, ease: "linear" }}
        style={{ originX: 0 }}
        className="h-0.5 bg-primary/60 rounded-full mt-1 mx-1"
      />
    </motion.div>
  );
}