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
      className={`border rounded-2xl p-6 mb-4 ${card}`}
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h3 className={`font-extrabold text-lg mb-2 ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Who are you sending padala to?
        </h3>
        <p className={`text-sm ${muted} mb-5 max-w-xs leading-relaxed`}>
          Add your family member's bank or e-wallet details once — then send with one tap every time.
        </p>
        <button
          onClick={() => navigate("/dashboard/recipients")}
          className="flex items-center gap-2 bg-primary text-secondary font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Add First Recipient →
        </button>
        <p className={`text-[11px] ${muted} mt-3`}>Takes 30 seconds · Saved securely</p>
      </div>
    </motion.div>
  );
}