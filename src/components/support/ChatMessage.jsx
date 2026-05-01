import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function ChatMessage({ message, darkMode, onFeedback }) {
  const isUser = message.role === "user";
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";
  const feedback = message.feedback; // "up" | "down" | null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <span className="text-sm">🤖</span>
        </div>
      )}

      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-secondary rounded-br-sm font-medium"
              : darkMode
                ? "bg-[#1a2332] text-white rounded-bl-sm border border-white/8"
                : "bg-white text-[#1a2a4a] rounded-bl-sm border border-black/8 shadow-sm"
          }`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {message.content}
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className={`text-[9px] font-semibold ${muted}`}>
            {new Date(message.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>

          {/* Thumbs feedback — only on Kaya responses */}
          {!isUser && onFeedback && (
            <div className="flex items-center gap-1">
              {feedback === null ? (
                <>
                  <button
                    onClick={() => onFeedback("up")}
                    title="Helpful"
                    className={`p-1 rounded-lg transition-colors hover:bg-emerald-500/10 ${muted} hover:text-emerald-500`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onFeedback("down")}
                    title="Not helpful"
                    className={`p-1 rounded-lg transition-colors hover:bg-red-500/10 ${muted} hover:text-red-400`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </>
              ) : feedback === "up" ? (
                <span className="text-emerald-500 text-[10px] font-semibold flex items-center gap-0.5">
                  <ThumbsUp className="w-3 h-3" /> Thanks!
                </span>
              ) : (
                <span className="text-red-400 text-[10px] font-semibold flex items-center gap-0.5">
                  <ThumbsDown className="w-3 h-3" /> Noted
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-black ${darkMode ? "bg-white/10 text-white" : "bg-[#1a2a4a]/10 text-[#1a2a4a]"}`}>
          👤
        </div>
      )}
    </motion.div>
  );
}