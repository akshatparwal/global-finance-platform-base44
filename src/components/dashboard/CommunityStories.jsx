/**
 * CommunityStories — pulls real testimonials from the Testimonial entity.
 * Falls back to a curated static set if no data exists.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

const FALLBACK = [
  { name: "Maria D.", location: "Dubai → Cebu", message: "Sent $500 for my younger sibling's tuition in under 30 seconds. Best rate I've ever gotten!", rating: 5, amount_sent: "$500", image_url: "" },
  { name: "Jose R.", location: "Riyadh → Manila", message: "Finally reached my House in the Phils savings goal! KinnectFi made it possible with their auto-save.", rating: 5, amount_sent: "$1,200", image_url: "" },
  { name: "Ana M.", location: "London → Davao", message: "$1,200 zero-spread transfer to Cebu. No hidden fees, no surprises. My family got every peso.", rating: 5, amount_sent: "$1,200", image_url: "" },
];

const STARS = [1,2,3,4,5];

export default function CommunityStories({ darkMode, taglish }) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";

  useEffect(() => {
    base44.entities.Testimonial.list("-created_date", 10)
      .then(t => { setTestimonials(t.length > 0 ? t : FALLBACK); setLoading(false); })
      .catch(() => { setTestimonials(FALLBACK); setLoading(false); });
  }, []);

  if (loading) return null;

  const list = testimonials;
  const current = list[active];

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-primary">⚡</span>
          <h3 className={`font-bold ${text}`}>{taglish ? "Mga Kwento ng Komunidad" : "Community Stories"}</h3>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${darkMode ? "bg-white/10 text-white/60" : "bg-black/10 text-black/60"}`}>
          {list.length} stories
        </span>
      </div>

      {/* Featured card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className={`rounded-2xl p-5 mb-3 border ${darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/5"}`}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-base flex-shrink-0">
              {current.image_url
                ? <img src={current.image_url} alt={current.name} className="w-full h-full rounded-full object-cover" />
                : (current.name?.[0] || "U")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className={`font-bold text-sm ${text}`}>{current.name}</p>
                {current.amount_sent && (
                  <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {current.amount_sent}
                  </span>
                )}
              </div>
              <p className={`text-[10px] ${muted} mb-2`}>{current.location}</p>
              {/* Stars */}
              <div className="flex gap-0.5 mb-2">
                {STARS.map(s => (
                  <span key={s} className={s <= (current.rating || 5) ? "text-primary text-xs" : "text-gray-300 text-xs"}>★</span>
                ))}
              </div>
              <p className={`text-sm leading-relaxed ${text}`}>"{current.message}"</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot navigation + arrow row */}
      {list.length > 1 && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 flex-1">
            {list.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${i === active ? "bg-primary w-5" : `w-1.5 ${darkMode ? "bg-white/20" : "bg-black/20"}`}`}
              />
            ))}
          </div>
          <button onClick={() => setActive(p => (p - 1 + list.length) % list.length)}
            className={`text-xs font-bold px-2 py-1 rounded-lg ${darkMode ? "bg-white/10 text-white/60" : "bg-black/10 text-black/60"}`}>‹</button>
          <button onClick={() => setActive(p => (p + 1) % list.length)}
            className={`text-xs font-bold px-2 py-1 rounded-lg ${darkMode ? "bg-white/10 text-white/60" : "bg-black/10 text-black/60"}`}>›</button>
        </div>
      )}
    </div>
  );
}