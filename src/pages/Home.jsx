import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Zap, Shield, Clock, TrendingUp, Users, Star, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveRates } from "@/hooks/useLiveRates";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import LiveRateCalc from "@/components/home/LiveRateCalc";

const HERO_SLIDES = [
  {
    img: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/449dd6e54_generated_image.png",
    en:  { title: "Built by Filipinos. For the World.",     desc: "Fiesta & Celebration — banderitas, lechon, kamayan feast — authentic Filipino joy." },
    tl:  { title: "Para sa Pamilya. Para sa Mundo.",         desc: "Salu-salo at pagdiriwang — ang tunay na kagalakan ng bawat Pilipino." },
  },
  {
    img: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/e70ef8335_generated_image.png",
    en:  { title: "Connected, No Matter the Distance.",      desc: "The OFW Connection — mano po across oceans — the sacrifice and love of working abroad." },
    tl:  { title: "Konektado, Kahit Malayo.",                desc: "Ang pagmamahal ng OFW — mano po kahit nasa ibang bansa — lagi kang nandito para sa pamilya." },
  },
  {
    img: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/ef027e246_generated_image.png",
    en:  { title: "Trust in Every Peso Sent.",               desc: "Padala's Home — capiz windows, Santo Nino, Filipino food — the warmth of receiving." },
    tl:  { title: "Tiwala sa Bawat Pisong Ipinapadala.",     desc: "Ang init ng tahanan — capiz windows, Santo Nino, lutong Pilipino — ang saya ng pagtanggap." },
  },
  {
    img: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/c2c6a74a4_generated_image.png",
    en:  { title: "The Philippines, Connected.",             desc: "Banaue Rice Terraces, El Nido, Manila Bay — golden bridges of finance linking them all." },
    tl:  { title: "Pilipinas, Magkakonekta.",                desc: "Banaue, El Nido, Maynila Bay — gintong tulay ng pera na nagbubuklod sa lahat." },
  },
];

export default function Home() {
  const [darkHero, setDarkHero] = useState(true);
  const [taglish, setTaglish] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const { rates } = useLiveRates();
  const liveRate = rates?.USDPHP ? rates.USDPHP.toFixed(2) : "56.24";

  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[slideIdx];
  const txt = taglish ? slide.tl : slide.en;

  const panelBg    = darkHero ? "#0D1F3C" : "#F0E9DC";
  const panelText  = darkHero ? "#FFFFFF" : "#0D1F3C";
  const panelMuted = darkHero ? "rgba(255,255,255,0.5)" : "rgba(13,31,60,0.5)";
  const panelBorder= darkHero ? "rgba(255,255,255,0.08)" : "rgba(13,31,60,0.1)";
  const dotInactive= darkHero ? "rgba(255,255,255,0.2)" : "rgba(13,31,60,0.18)";

  return (
    <div style={{ backgroundColor: "#F5EFE3", fontFamily: "'Inter', sans-serif" }}>
      <section className="flex flex-col lg:flex-row" style={{ minHeight: "100svh" }}>

        {/* LEFT: full-bleed photo */}
        <div className="relative flex-1 overflow-hidden min-h-[50svh] landscape:min-h-[100svh] lg:min-h-0">
          <img
            src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1400&q=90"
            alt="Filipino family celebration"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 38%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0.08) 100%)" }} />

          {/* Logo */}
          <div className="absolute top-4 left-4 sm:top-7 sm:left-7 flex items-center gap-2 z-10 bg-black/40 backdrop-blur-sm rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl overflow-hidden bg-white/15 flex items-center justify-center">
              <img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg" className="w-full h-full scale-150 object-cover" />
            </div>
            <div>
              <div className="font-extrabold text-white text-sm sm:text-base leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Kinnect<span className="text-[#C97B22]">Fi</span>
              </div>
              <div className="text-white/40 text-[7px] sm:text-[8px] uppercase tracking-widest hidden xs:block">Cross-Border Neobank</div>
            </div>
          </div>

          {/* Hero copy */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 sm:px-8 sm:pb-10 lg:px-12 lg:pb-14 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`hero-text-${taglish}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {taglish ? (
                  <h1 className="text-2xl sm:text-4xl lg:text-[3.5rem] font-black text-white leading-[1.06] mb-2 sm:mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Ang pera mo,{" "}
                    <span className="text-[#C97B22]">konektado</span>{" "}
                    sa puso mo.
                  </h1>
                ) : (
                  <h1 className="text-2xl sm:text-4xl lg:text-[3.5rem] font-black text-white leading-[1.06] mb-2 sm:mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Your money,{" "}
                    <span className="text-[#C97B22]">connected</span>{" "}
                    to your heart.
                  </h1>
                )}
                {/* Live rate badge in hero */}
                <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full" style={{ background: "rgba(201,123,34,0.18)", border: "1px solid rgba(201,123,34,0.35)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/60 text-[10px] sm:text-[11px] font-semibold">Live rate:</span>
                  <span className="text-[#C97B22] text-[12px] sm:text-[13px] font-black">₱{liveRate}/USD</span>
                  <span className="text-white/40 text-[9px] sm:text-[10px]">· $0 fee</span>
                </div>
                <p className="text-white/75 text-sm sm:text-base mb-5 sm:mb-7 max-w-sm leading-relaxed hidden sm:block">
                  {taglish
                    ? "Ipadala ang pera sa pamilya mo — mabilis, ligtas, at walang bayad."
                    : "Send money home instantly, securely, and with zero hidden fees."}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Social proof */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex -space-x-2">
                {[
                  "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/98148142a_i_pravatar_cc_100_c2961a44.png",
                  "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/d889dd544_i_pravatar_cc_100_70a8a187.png",
                  "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/994bcae68_i_pravatar_cc_100_22c8e547.png",
                ].map((src, i) => (
                  <img key={i} src={src} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white/30 object-cover" />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-[#C97B22] text-xs">★</span>)}
                </div>
                <p className="text-white/65 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
                  {taglish ? "10,000+ Pilipino sa buong mundo" : "Trusted by 10,000+ Filipinos worldwide"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: info panel */}
        <div
          className="flex-shrink-0 w-full lg:w-[400px] xl:w-[440px] flex flex-col"
          style={{ background: panelBg, transition: "background 0.4s", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", overflowY: "auto" }}
        >
          {/* Top toolbar */}
          <div className="flex items-center justify-between px-4 sm:px-7 pt-4 sm:pt-7 pb-2">
            <button
              onClick={() => setDarkHero(!darkHero)}
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
              style={{ background: darkHero ? "rgba(255,255,255,0.1)" : "rgba(13,31,60,0.08)", color: panelMuted }}
            >
              {darkHero ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              {darkHero ? "Light" : "Dark"}
            </button>

            <div
              className="flex rounded-full p-0.5 text-[11px] font-bold"
              style={{ background: darkHero ? "rgba(255,255,255,0.08)" : "rgba(13,31,60,0.07)" }}
            >
              {["EN", "Taglish"].map(lang => (
                <button
                  key={lang}
                  onClick={() => setTaglish(lang === "Taglish")}
                  className="px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: (lang === "Taglish") === taglish ? "#C97B22" : "transparent",
                    color: (lang === "Taglish") === taglish ? "#fff" : panelMuted,
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Slide content */}
          <div className="flex-1 flex flex-col justify-center px-4 sm:px-7 py-4 sm:py-6">
            <div className="flex justify-center mb-4 sm:mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideIdx}
                  initial={{ opacity: 0, scale: 0.94, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -8 }}
                  transition={{ duration: 0.38 }}
                  className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img src={slide.img} alt={txt.title} className="w-full h-full object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${slideIdx}-${taglish}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-5 sm:mb-8"
              >
                <h2 className="text-lg sm:text-[1.45rem] font-black mb-2 leading-snug" style={{ color: panelText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {txt.title}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed max-w-xs mx-auto hidden sm:block" style={{ color: panelMuted }}>
                  {txt.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            <Link
              to="/auth"
              aria-label={taglish ? "Magsimula na sa KinnectFi" : "Get started with KinnectFi — create your free account"}
              className="flex items-center justify-center gap-2 font-bold rounded-xl py-3.5 sm:py-4 px-6 text-sm sm:text-base mb-2.5 sm:mb-3 hover:opacity-90 transition-opacity"
              style={{ background: "#C97B22", color: "#fff" }}
            >
              {taglish ? "Magsimula Na →" : "Get Started →"}
            </Link>
            <p className="text-center text-[11px] mb-4 sm:mb-7" style={{ color: panelMuted }}>
              <Link to="/auth" aria-label="Sign in to your existing KinnectFi account" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
                {taglish ? "May account ka na? Maligayang pagbabalik!" : "Already have an account? Welcome back!"}
              </Link>
            </p>

            <div className="flex items-center justify-center gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: i === slideIdx ? 28 : 7, background: i === slideIdx ? "#C97B22" : dotInactive }}
                />
              ))}
            </div>
          </div>

          {/* Bottom status bar */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-3 border-t text-[10px] font-semibold uppercase tracking-wider"
            style={{ borderColor: panelBorder, background: darkHero ? "rgba(0,0,0,0.25)" : "rgba(13,31,60,0.04)" }}
          >
            <div className="flex items-center gap-1.5" style={{ color: panelMuted }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="hidden sm:inline">{taglish ? "Secured ng 256-bit Encryption" : "Secured by 256-bit Encryption"}</span>
              <span className="sm:hidden">256-bit Secure</span>
            </div>
            <div className="flex items-center gap-3" style={{ color: panelMuted }}>
              <span>₱<span className="font-black" style={{ color: "#C97B22" }}>{liveRate}</span>/USD</span>
              <span>{taglish ? "Bayad" : "Fee"} <span className="font-black" style={{ color: "#C97B22" }}>$0</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Strip ── */}
      <section style={{ backgroundColor: "#F5EFE3" }} className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#C97B22" }}>Why KinnectFi</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-3" style={{ color: "#0D1F3C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Built for the OFW. <span style={{ color: "#C97B22" }}>Zero compromises.</span>
          </h2>
          <p className="text-sm sm:text-base max-w-md mx-auto" style={{ color: "rgba(13,31,60,0.55)" }}>
            Every feature is designed around the real needs of Filipino families sending love across oceans.
          </p>
        </div>

        {/* Features — horizontal scroll on mobile, grid on desktop */}
        <div className="mb-16">
          {/* Mobile carousel */}
          <div className="flex gap-3 overflow-x-auto pb-3 sm:hidden" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {[
              { emoji: "⚡", title: "30-Second Delivery", desc: "GCash & Maya transfers arrive instantly.", badge: "INSTANT" },
              { emoji: "🔒", title: "Zero Hidden Fees", desc: "No spread markup, no service charge.", badge: "FREE" },
              { emoji: "📈", title: "Live Exchange Rate", desc: `Today: ₱${liveRate}/USD`, badge: "LIVE" },
              { emoji: "🔔", title: "Rate Alerts", desc: "Get notified when your target rate hits.", badge: "SMART" },
              { emoji: "👨‍👩‍👧", title: "Family Wallets", desc: "Linked wallets for your loved ones.", badge: "FAMILY" },
              { emoji: "🎁", title: "Kinnect Points", desc: "Earn points on every padala.", badge: "REWARDS" },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl p-5 border flex-shrink-0 w-[240px]"
                style={{ background: "#FFFFFF", borderColor: "rgba(13,31,60,0.08)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(201,123,34,0.1)" }}>{f.emoji}</div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(201,123,34,0.12)", color: "#C97B22" }}>{f.badge}</span>
                </div>
                <h3 className="font-extrabold text-base mb-1" style={{ color: "#0D1F3C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(13,31,60,0.5)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
          {/* Desktop grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { emoji: "⚡", title: "30-Second Delivery", desc: "GCash & Maya transfers arrive before your next heartbeat. No waiting, no anxiety.", badge: "INSTANT" },
              { emoji: "🔒", title: "Zero Hidden Fees", desc: "What you see is what they get. No spread markup, no service charge, no surprises.", badge: "FREE" },
              { emoji: "📈", title: "Live Exchange Rate", desc: `Today's rate: ₱${liveRate}/USD — the real mid-market rate, always.`, badge: "LIVE" },
              { emoji: "🔔", title: "Rate Alerts", desc: "Set your target rate and get notified the moment it hits. Never miss a peak.", badge: "SMART" },
              { emoji: "👨‍👩‍👧", title: "Family Wallets", desc: "Give your loved ones in the Philippines a linked wallet. Support them directly.", badge: "FAMILY" },
              { emoji: "🎁", title: "Kinnect Points", desc: "Earn points on every padala. Redeem for fee credits, cash back, or donations.", badge: "REWARDS" },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                className="rounded-2xl p-5 border" style={{ background: "#FFFFFF", borderColor: "rgba(13,31,60,0.08)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(201,123,34,0.1)" }}>{f.emoji}</div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(201,123,34,0.12)", color: "#C97B22" }}>{f.badge}</span>
                </div>
                <h3 className="font-extrabold text-base mb-1" style={{ color: "#0D1F3C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(13,31,60,0.5)" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-3xl overflow-hidden mb-10 sm:mb-16" style={{ background: "linear-gradient(135deg, #0D1F3C 0%, #3d2e00 60%, #8a6a00 100%)" }}>
          <div className="px-5 py-8 sm:px-12 sm:py-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(201,123,34,0.7)" }}>How it works</p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-6 sm:mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Send padala in <span style={{ color: "#C97B22" }}>3 simple steps</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Fund your wallet", desc: "Add USD via ACH bank transfer, wire, or debit card. Funds arrive instantly." },
                { step: "02", title: "Choose your recipient", desc: "Add your family once. Select their GCash, Maya, or bank account." },
                { step: "03", title: "Send & they receive", desc: "Hit send. Your family gets notified in seconds. Zero fees deducted." },
              ].map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: "rgba(201,123,34,0.2)", color: "#C97B22" }}>{s.step}</div>
                  <div>
                    <h4 className="text-white font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.title}</h4>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <Link to="/auth"
                className="inline-flex items-center gap-2 font-bold rounded-xl py-3.5 px-7 text-sm hover:opacity-90 transition-opacity"
                style={{ background: "#C97B22", color: "#fff" }}>
                {taglish ? "Magsimula Na →" : "Create Free Account →"}
              </Link>
              <Link to="/HowItWorks" className="inline-flex items-center gap-2 ml-4 text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: "rgba(255,255,255,0.5)" }}>
                Learn more <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      <TestimonialsSection taglish={taglish} />

      {/* Live rate calculator */}
      <div className="mb-16">
        <LiveRateCalc taglish={taglish} />
      </div>

      {/* Trust bar */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-6 lg:gap-10 pb-4">
          {[
            { icon: "🔒", label: "256-bit Encryption" },
            { icon: "🏦", label: "FDIC-Insured Partners" },
            { icon: "⭐", label: "4.9 App Store Rating" },
            { icon: "🇵🇭", label: "10,000+ OFW Families" },
            { icon: "💸", label: "$0 Transfer Fees" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-base sm:text-lg">{t.icon}</span>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(13,31,60,0.45)" }}>{t.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}