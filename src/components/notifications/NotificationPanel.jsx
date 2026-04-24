/**
 * NotificationPanel — Revolut/Monzo-style rich in-app notification feed.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Trash2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TYPE_META = {
  transfer_sent:      { label: "Transfer",  dot: "bg-emerald-500" },
  transfer_delivered: { label: "Delivered", dot: "bg-emerald-400" },
  transfer_failed:    { label: "Failed",    dot: "bg-red-500" },
  rate_alert:         { label: "Rate Alert",dot: "bg-amber-400" },
  savings_milestone:  { label: "Goal",      dot: "bg-primary" },
};

const TYPE_NAV = {
  transfer_sent:      "/dashboard/transactions",
  transfer_delivered: "/dashboard/transactions",
  transfer_failed:    "/dashboard/pay",
  rate_alert:         "/dashboard/pay",
  savings_milestone:  "/dashboard/insights",
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationPanel({ notifications, onDismiss, onMarkAllRead, onClearAll, onClose, darkMode }) {
  const navigate = useNavigate();
  const unread = notifications.filter(n => n.unread).length;

  const bg = darkMode ? "bg-[#1a2332] border-white/10" : "bg-white border-black/10";
  const rowHover = darkMode ? "hover:bg-white/5 border-white/5" : "hover:bg-black/4 border-black/5";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/40" : "text-black/40";

  const handleRowClick = (notif) => {
    const path = TYPE_NAV[notif.type];
    if (path) {
      navigate(path);
      onClose?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`absolute right-0 top-11 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl shadow-2xl border z-50 overflow-hidden ${bg}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? "border-white/10" : "border-black/10"}`}>
        <div className="flex items-center gap-2">
          <Bell className={`w-4 h-4 ${darkMode ? "text-white/60" : "text-[#1a2a4a]/60"}`} />
          <span className={`font-bold text-sm ${text}`}>Notifications</span>
          {unread > 0 && (
            <span className="bg-primary text-secondary text-[9px] font-black px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={onMarkAllRead} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
              <Check className="w-3 h-3" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={onClearAll} className={`text-xs font-bold hover:underline ${muted}`}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="overflow-y-auto max-h-[420px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <Bell className={`w-8 h-8 ${muted}`} />
            <p className={`text-sm font-semibold ${muted}`}>You're all caught up</p>
            <p className={`text-xs ${muted}`}>Transfers, rate alerts & goal updates appear here</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n) => {
              const meta = TYPE_META[n.type] || { label: "Update", dot: "bg-primary" };
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleRowClick(n)}
                  className={`flex items-start gap-3 px-4 py-3.5 border-b last:border-0 cursor-pointer transition-colors ${rowHover} ${n.unread ? darkMode ? "bg-primary/5" : "bg-primary/3" : ""}`}
                >
                  {/* Icon bubble */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${darkMode ? "bg-white/8" : "bg-black/5"} relative`}>
                    {n.icon}
                    {n.unread && (
                      <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${meta.dot} border-2 ${darkMode ? "border-[#1a2332]" : "border-white"}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider text-primary`}>{meta.label}</span>
                    </div>
                    <p className={`text-sm font-semibold leading-snug ${text}`}>{n.title}</p>
                    <p className={`text-xs mt-0.5 leading-relaxed ${muted}`}>{n.desc}</p>
                    <p className={`text-[10px] mt-1 font-bold ${darkMode ? "text-white/30" : "text-black/30"}`}>{timeAgo(n.time)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 mt-0.5">
                    <button
                      onClick={e => { e.stopPropagation(); onDismiss(n.id); }}
                      className={`p-1 rounded-lg hover:bg-red-500/10 transition-colors ${darkMode ? "text-white/20 hover:text-red-400" : "text-black/20 hover:text-red-400"}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <ChevronRight className={`w-3 h-3 ${muted}`} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}