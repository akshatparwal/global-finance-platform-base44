/**
 * NoCardEmptyState — ARQ-style full-bleed hero shown before a card is issued.
 * Dark photography vibe: black background, gold accent, single clear CTA.
 */
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function NoCardEmptyState({ onIssue, issuing }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative w-full rounded-3xl overflow-hidden flex flex-col items-center justify-center text-center"
      style={{ minHeight: 380, background: "#080A12" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 60%, rgba(244,201,78,0.13) 0%, transparent 70%)",
        }}
      />

      {/* Card ghost illustration */}
      <div className="relative z-10 mb-8 flex items-center justify-center">
        <div
          className="w-64 h-40 rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0d1120 0%, #1a2035 50%, #0d0c08 100%)",
            border: "1px solid rgba(244,201,78,0.18)",
            boxShadow: "0 0 80px rgba(244,201,78,0.10)",
          }}
        >
          {/* Chip */}
          <div
            className="absolute top-4 left-4 w-8 h-6 rounded-sm"
            style={{
              background: "rgba(244,201,78,0.22)",
              border: "1px solid rgba(244,201,78,0.30)",
            }}
          />
          {/* Contactless icon */}
          <div className="absolute top-4 right-4 opacity-25">
            <div className="w-5 h-5 border-2 border-white/40 rounded-full" />
          </div>
          {/* Number dots */}
          <div className="absolute bottom-10 left-4 flex gap-3">
            {[0, 1, 2, 3].map(g => (
              <div key={g} className="flex gap-0.5">
                {[0, 1, 2, 3].map(d => (
                  <div
                    key={d}
                    className="w-1 h-1 rounded-full"
                    style={{
                      background:
                        g === 3 ? "rgba(244,201,78,0.50)" : "rgba(255,255,255,0.18)",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Mastercard rings */}
          <div className="absolute bottom-4 right-4 flex -space-x-2 opacity-40">
            <div className="w-6 h-6 rounded-full bg-red-500/60" />
            <div className="w-6 h-6 rounded-full bg-yellow-500/60" />
          </div>
          {/* Name line */}
          <div
            className="absolute bottom-4 left-4 w-24 h-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.10)" }}
          />
        </div>
      </div>

      {/* Copy */}
      <div className="relative z-10 px-6">
        <p
          className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2"
        >
          KinnectFi Card
        </p>
        <h2
          className="text-white font-light text-3xl mb-3"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}
        >
          Issue your card
        </h2>
        <p className="text-white/35 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
          A virtual Visa card, instant. Spend in dollars at home or abroad — zero foreign transaction fees.
        </p>

        <motion.button
          onClick={onIssue}
          disabled={issuing}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-50 transition-opacity"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          }}
        >
          {issuing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Issuing…</>
          ) : (
            "Issue Virtual Card — Instant →"
          )}
        </motion.button>

        <p className="text-white/18 text-[10px] mt-4 tracking-wider">
          ZERO LIABILITY · ENCRYPTED · INSTANT ISSUE
        </p>
      </div>
    </motion.div>
  );
}