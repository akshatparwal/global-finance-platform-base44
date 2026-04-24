/**
 * Reusable EmptyState — Monzo/Chime style delightful zero-state.
 * Props:
 *   illustration: string (emoji or SVG component)
 *   title: string
 *   description: string
 *   ctaLabel?: string
 *   onCta?: () => void
 *   darkMode?: boolean
 *   size?: "sm" | "md" | "lg"
 */
import { motion } from "framer-motion";

export default function EmptyState({
  illustration = "📭",
  title,
  description,
  ctaLabel,
  onCta,
  darkMode,
  size = "md",
}) {
  const sizes = {
    sm: { wrap: "py-8 px-4", icon: "text-4xl mb-3 w-14 h-14", titleCls: "text-sm", descCls: "text-xs" },
    md: { wrap: "py-12 px-6", icon: "text-5xl mb-4 w-18 h-18", titleCls: "text-base", descCls: "text-sm" },
    lg: { wrap: "py-16 px-8", icon: "text-6xl mb-5 w-22 h-22", titleCls: "text-lg", descCls: "text-sm" },
  };
  const s = sizes[size];
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex flex-col items-center text-center ${s.wrap}`}
    >
      {/* Illustration bubble */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`rounded-2xl flex items-center justify-center mb-3 ${
          darkMode ? "bg-white/5" : "bg-black/4"
        } w-20 h-20`}
      >
        <span className="text-4xl select-none">{illustration}</span>
      </motion.div>

      {/* Decorative dots */}
      <div className="flex gap-1 mb-4">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }}
            className={`w-1.5 h-1.5 rounded-full ${darkMode ? "bg-white/30" : "bg-black/20"}`}
          />
        ))}
      </div>

      <h3 className={`font-extrabold mb-1.5 ${s.titleCls} ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {title}
      </h3>
      {description && (
        <p className={`${s.descCls} ${muted} max-w-xs leading-relaxed mb-5`}>{description}</p>
      )}
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="bg-primary text-secondary font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
        >
          {ctaLabel}
        </button>
      )}
    </motion.div>
  );
}