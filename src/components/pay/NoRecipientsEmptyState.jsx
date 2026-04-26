/**
 * NoRecipientsEmptyState — shown on Pay page when user has 0 saved recipients.
 * Guides them to add their first recipient before sending.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserPlus, Heart } from "lucide-react";

export default function NoRecipientsEmptyState({ darkMode }) {
  const navigate = useNavigate();
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/8";
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl p-3 mb-3 ${card}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Heart className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold ${text}`}>No recipients yet</p>
          <p className={`text-[10px] ${muted}`}>Add a family member to get started</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/recipients")}
          className="flex items-center gap-1.5 bg-primary text-secondary font-bold px-3 py-1.5 rounded-lg text-xs hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
        >
          <UserPlus className="w-3 h-3" />
          Add →
        </button>
      </div>
    </motion.div>
  );
}