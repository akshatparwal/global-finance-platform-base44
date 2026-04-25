/**
 * TestimonialsSection — pulls from Testimonial entity, falls back to curated set.
 * Wise/Remitly-style social proof strip for the Home landing page.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

const FALLBACK = [
  { name: "Maria S.", location: "Dubai → Cebu", message: "Finally a remittance app that actually cares about us OFWs. Zero fees and the money arrives in 30 seconds. Sobrang ganda!", rating: 5, amount_sent: "$1,200/mo", image_url: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/98148142a_i_pravatar_cc_100_c2961a44.png" },
  { name: "Jose R.", location: "London → Manila", message: "I switched from Western Union after paying $35 in fees. KinnectFi charged me $0. My family gets every single peso.", rating: 5, amount_sent: "$800/mo", image_url: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/d889dd544_i_pravatar_cc_100_70a8a187.png" },
  { name: "Ana P.", location: "Toronto → Iloilo", message: "The rate alerts changed everything. I wait for the perfect rate then send — my family gets 3% more every time. Salamat KinnectFi!", rating: 5, amount_sent: "$600/mo", image_url: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/994bcae68_i_pravatar_cc_100_22c8e547.png" },
  { name: "Rodel M.", location: "Riyadh → Davao", message: "GCash delivery in under a minute. My nanay messaged me before I even put my phone down. This is the future of padala.", rating: 5, amount_sent: "$950/mo", image_url: "https://i.pravatar.cc/100?img=12" },
  { name: "Liza T.", location: "Singapore → Pampanga", message: "Kaya AI helped me set up a savings goal for my daughter's college. It's not just a remittance app — it's a financial partner.", rating: 5, amount_sent: "$450/mo", image_url: "https://i.pravatar.cc/100?img=47" },
];

export default function TestimonialsSection({ taglish }) {
  const [testimonials, setTestimonials] = useState(FALLBACK);
  const [active, setActive] = useState(0);

  useEffect(() => {
    base44.entities.Testimonial.list("-created_date", 6)
      .then(data => { if (data?.length >= 3) setTestimonials(data); })
      .catch(() => {});
    const interval = setInterval(() => setActive(i => (i + 1) % FALLBACK.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[active] || FALLBACK[0];

  return (
    <section style={{ backgroundColor: "#F5EFE3" }} className="px-6 py-16 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#C97B22" }}>
          {taglish ? "Mga Kwento ng Tagumpay" : "Real Stories"}
        </p>
        <h2 className="text-3xl sm:text-4xl font-black" style={{ color: "#0D1F3C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {taglish ? "Pinagkakatiwalaan ng pamilya." : "Trusted by 10,000+ families."}
        </h2>
      </div>

      {/* Featured testimonial */}
      <div
        className="rounded-3xl p-8 sm:p-10 mb-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D1F3C 0%, #3d2e00 60%, #8a6a00 100%)" }}
      >
        <div className="absolute top-0 right-0 text-[180px] opacity-5 leading-none select-none">"</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-1 mb-5">
              {[...Array(t.rating || 5)].map((_, i) => <span key={i} className="text-[#C97B22] text-lg">★</span>)}
            </div>
            <p className="text-white text-lg sm:text-xl font-semibold leading-relaxed mb-6 max-w-2xl">
              "{t.message}"
            </p>
            <div className="flex items-center gap-3">
              {t.image_url && (
                <img src={t.image_url} className="w-11 h-11 rounded-full border-2 object-cover" style={{ borderColor: "rgba(201,123,34,0.5)" }} />
              )}
              <div>
                <p className="text-white font-bold text-sm">{t.name}</p>
                <p className="text-white/50 text-xs">{t.location}</p>
              </div>
              {t.amount_sent && (
                <div className="ml-auto bg-[#C97B22]/20 border border-[#C97B22]/30 rounded-full px-3 py-1">
                  <p className="text-[#C97B22] text-xs font-black">{t.amount_sent}</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-2 mt-6">
          {testimonials.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === active ? 28 : 7, background: i === active ? "#C97B22" : "rgba(255,255,255,0.2)" }}
            />
          ))}
        </div>
      </div>

      {/* Grid of mini cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {testimonials.slice(0, 3).map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-5 border"
            style={{ background: "#FFFFFF", borderColor: "rgba(13,31,60,0.08)" }}
          >
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, j) => <span key={j} className="text-[#C97B22] text-xs">★</span>)}
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(13,31,60,0.65)" }}>"{t.message?.slice(0, 100)}{t.message?.length > 100 ? "..." : ""}"</p>
            <div className="flex items-center gap-2">
              {t.image_url && <img src={t.image_url} className="w-8 h-8 rounded-full object-cover" />}
              <div>
                <p className="text-xs font-bold" style={{ color: "#0D1F3C" }}>{t.name}</p>
                <p className="text-[10px]" style={{ color: "rgba(13,31,60,0.4)" }}>{t.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}