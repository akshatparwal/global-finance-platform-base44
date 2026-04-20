import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, CheckCircle, ChevronDown, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Ticker Bar ─── */
const TICKER_ITEMS = [
  { label: "USD / PHP (KinnectFi Rate)", value: "₱56.24", tag: "0.00%", tagColor: "text-[#C97B22]" },
  { label: "EUR / PHP", value: "₱61.10", tag: "↑ 0.05%", tagColor: "text-emerald-600" },
  { label: "GBP / PHP", value: "₱71.30", tag: "↑ 0.20%", tagColor: "text-emerald-600" },
  { label: "USDC / PHP", value: "₱56.25", tag: "↑ 0.10%", tagColor: "text-emerald-600" },
  { label: "Average Bank Remittance Fee", value: "3.5%", tag: "High", tagColor: "text-red-500" },
  { label: "KinnectFi Transfer Fee", value: "0.00%", tag: "Zero", tagColor: "text-[#C97B22]" },
];

function TickerBar() {
  return (
    <div className="w-full bg-[#0D1F3C] text-white/80 text-xs py-2 overflow-hidden flex">
      <div className="flex animate-[ticker_30s_linear_infinite] whitespace-nowrap">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 border-r border-white/10">
            <span className="text-white/50">{item.label}</span>
            <span className="font-bold text-white">{item.value}</span>
            <span className={`font-semibold ${item.tagColor}`}>{item.tag}</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

/* ─── App Mockup ─── */
function AppMockup() {
  return (
    <div className="relative w-full max-w-[340px] mx-auto select-none">
      {/* Phone shell */}
      <div className="rounded-[2.5rem] bg-[#0D1F3C] shadow-[0_40px_80px_-20px_rgba(13,31,60,0.45)] overflow-hidden border border-[#1a3058] p-0.5">
        <div className="rounded-[2.3rem] overflow-hidden bg-[#0D1F3C]">
          {/* Status bar */}
          <div className="flex justify-between items-center px-6 pt-4 pb-1">
            <span className="text-white/40 text-[10px] font-bold">9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-2 rounded-sm bg-white/30" />
              <div className="w-1 h-2 rounded-sm bg-white/60" />
            </div>
          </div>
          {/* Net worth */}
          <div className="px-5 pt-3 pb-4 flex justify-between items-start">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-0.5">NET WORTH</p>
              <p className="text-white text-3xl font-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$124,592</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#C97B22] flex items-center justify-center text-white font-black text-sm">AK</div>
          </div>
          {/* Card */}
          <div className="mx-4 rounded-2xl overflow-hidden mb-4" style={{ background: "linear-gradient(135deg, #1a3a6a 0%, #0d2645 100%)" }}>
            <div className="p-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-white/40 text-[9px] uppercase tracking-wider">USD WALLET</p>
                  <p className="text-white font-black text-xl">$4,200.00</p>
                </div>
                <div className="bg-white/20 rounded px-2 py-0.5">
                  <span className="text-white font-black text-xs tracking-wider">VISA</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 font-mono text-xs tracking-widest">•••• 4242</span>
                <span className="bg-[#C97B22]/20 text-[#C97B22] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#C97B22]/30">⚡ SMART YIELD 5.10%</span>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-2 mx-4 mb-4">
            {[{ icon: "↗", label: "SEND" }, { emoji: "🇵🇭", label: "PADALA" }, { icon: "📈", label: "GROW" }].map((a, i) => (
              <div key={i} className="flex-1 bg-[#1a2a45] rounded-xl py-3 flex flex-col items-center gap-1">
                <span className="text-white text-lg">{a.emoji || a.icon}</span>
                <span className="text-white/40 text-[9px] font-bold uppercase tracking-wider">{a.label}</span>
              </div>
            ))}
          </div>
          {/* Recent */}
          <div className="mx-4 mb-4">
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-2">RECENT</p>
            {[
              { label: "Padala — Manila", amount: "+₱28,120", color: "text-emerald-400" },
              { label: "Salary", amount: "+$5,200", color: "text-emerald-400" },
              { label: "Apple Store", amount: "-$120", color: "text-white/60" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-white/5">
                <div className="w-6 h-6 rounded-full bg-white/10" />
                <span className="text-white/70 text-xs flex-1">{r.label}</span>
                <span className={`text-xs font-bold ${r.color}`}>{r.amount}</span>
              </div>
            ))}
          </div>
          <div className="h-4" />
        </div>
      </div>
      {/* Floating badges */}
      <div className="absolute -right-4 top-16 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
        <span className="text-[#C97B22] text-sm font-bold">↗</span>
        <div>
          <p className="text-[9px] text-gray-400 uppercase font-bold">DAILY YIELD</p>
          <p className="text-[#0D1F3C] font-black text-sm">5.10% APY</p>
        </div>
      </div>
      <div className="absolute -left-6 bottom-28 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#C97B22]/10 flex items-center justify-center">
          <Shield className="w-4 h-4 text-[#C97B22]" />
        </div>
        <div>
          <p className="text-[#0D1F3C] font-bold text-xs">Protected</p>
          <p className="text-gray-400 text-[9px]">FDIC Insured up to $250k</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Dot background ─── */
const DOT_BG = {
  backgroundImage: "radial-gradient(circle, #c8b89a 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

/* ─── FAQ ─── */
const FAQS = [
  { q: "Is my money safe with KinnectFi?", a: "Yes. Your fiat balances are held in FDIC-insured U.S. partner banks up to $250,000. We use AES-256 encryption and real-time AI fraud monitoring on every transaction." },
  { q: "How can you offer zero fees? What's the catch?", a: "There is no catch. We earn a small, transparent margin on currency conversion at the true mid-market rate — far less than the 2–4% FX spread traditional banks charge. No hidden fees, ever." },
  { q: "What happens if KinnectFi shuts down?", a: "Your funds are held in segregated accounts at regulated U.S. partner banks — not on KinnectFi's balance sheet. They are protected regardless of KinnectFi's operational status." },
  { q: "How fast are transfers to the Philippines?", a: "Most transfers settle in under 2.4 seconds. We use advanced global rails that bypass legacy intermediary banks entirely — no weekend delays, no cutoff times." },
  { q: "Do I need a US credit history to sign up?", a: "No. KinnectFi does not require a US credit history or Social Security Number to open an account. We built this for immigrants who are new to the US financial system." },
  { q: "What documents do I need to get started?", a: "A valid government-issued photo ID (passport, driver's license, or Philippine national ID) and a US phone number. Setup takes under 5 minutes." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-24 bg-[#F5EFE3]" style={DOT_BG}>
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-[#C97B22] text-xs font-bold uppercase tracking-widest text-center mb-3">FAQ</p>
        <h2 className="text-4xl font-black text-[#0D1F3C] text-center mb-12" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Common questions,<br />honest answers.
        </h2>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#e8dece]">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left">
                <span className="font-bold text-[#0D1F3C] text-base pr-4">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#C97B22] flex-shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                    <p className="px-6 pb-5 text-gray-600 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Hero Slides ─── */
const HERO_SLIDES = [
  {
    img: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/449dd6e54_generated_image.png",
    title: "Built by Filipinos. For the World.",
    desc: "Fiesta & Celebration — banderitas, lechon, kamayan feast — authentic Filipino joy.",
  },
  {
    img: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/e70ef8335_generated_image.png",
    title: "Connected, No Matter the Distance.",
    desc: "The OFW Connection — mano po across oceans — the sacrifice and love of working abroad.",
  },
  {
    img: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/ef027e246_generated_image.png",
    title: "Trust in Every Peso Sent.",
    desc: "Padala's Home — capiz windows, Santo Nino, Filipino food — the warmth of receiving.",
  },
  {
    img: "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/c2c6a74a4_generated_image.png",
    title: "The Philippines, Connected.",
    desc: "Banaue Rice Terraces, El Nido, Manila Bay — golden bridges of finance linking them all.",
  },
];

/* ─── Main page ─── */
export default function Home() {
  const [email, setEmail] = useState("");
  const [darkHero, setDarkHero] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[slideIdx];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5EFE3", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Hero — split screen ── */}
      <section className="flex flex-col lg:flex-row" style={{ minHeight: "100vh" }}>

        {/* LEFT — photo side */}
        <div className="relative flex-1 min-h-[55vw] lg:min-h-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85"
            alt="Filipino family celebration"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.15) 100%)" }} />

          {/* Logo top-left */}
          <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
              <img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg" className="w-full h-full scale-150 object-cover" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Kinnect<span className="text-[#C97B22]">Fi</span>
              </div>
              <div className="text-white/40 text-[8px] uppercase tracking-widest">Cross-Border Neobank</div>
            </div>
          </div>

          {/* Hero text bottom-left */}
          <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ang pera mo,{" "}
              <span className="text-[#C97B22]">konektado</span>{" "}
              sa puso mo.
            </h1>
            <p className="text-white/80 text-base mb-6 max-w-sm">
              Your money, connected to your heart.<br />Bridging the distance with trust and community.
            </p>
            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/98148142a_i_pravatar_cc_100_c2961a44.png",
                  "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/d889dd544_i_pravatar_cc_100_70a8a187.png",
                  "https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/994bcae68_i_pravatar_cc_100_22c8e547.png",
                ].map((src, i) => (
                  <img key={i} src={src} className="w-8 h-8 rounded-full border-2 border-white/30 object-cover" />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-[#C97B22] text-xs">★</span>)}
                </div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Trusted by 10,000+ Filipinos worldwide</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — dark panel */}
        <div
          className="flex-shrink-0 w-full lg:w-[420px] flex flex-col justify-between relative"
          style={{ background: darkHero ? "#0D1F3C" : "#F5EFE3" }}
        >
          <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:py-16">
            {/* Slide illustration */}
            <div className="w-full mb-6 flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img src={slide.img} className="w-full h-full object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${slideIdx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="text-center mb-8"
              >
                <h2
                  className="text-2xl font-black mb-3 leading-tight"
                  style={{ color: darkHero ? "#fff" : "#0D1F3C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {slide.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: darkHero ? "rgba(255,255,255,0.6)" : "rgba(13,31,60,0.6)" }}>
                  {slide.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTA */}
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 font-bold rounded-xl py-4 px-6 text-base mb-3 transition-colors"
              style={{ background: "#C97B22", color: "#fff" }}
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-center text-xs mb-6" style={{ color: darkHero ? "rgba(255,255,255,0.5)" : "rgba(13,31,60,0.5)" }}>
              <Link to="/auth" className="underline underline-offset-2">Already have an account? Maligayang pagbabalik!</Link>
            </p>

            {/* Slide dots + dark/light toggle */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlideIdx(i)}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === slideIdx ? 28 : 8,
                      background: i === slideIdx ? "#C97B22" : (darkHero ? "rgba(255,255,255,0.25)" : "rgba(13,31,60,0.2)"),
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setDarkHero(!darkHero)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                style={{
                  background: darkHero ? "rgba(255,255,255,0.1)" : "rgba(13,31,60,0.08)",
                  color: darkHero ? "rgba(255,255,255,0.7)" : "rgba(13,31,60,0.7)",
                }}
              >
                {darkHero ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {darkHero ? "Light" : "Dark"}
              </button>
            </div>
          </div>

          {/* Bottom status bar */}
          <div
            className="px-6 py-3 flex items-center justify-between border-t text-xs"
            style={{
              borderColor: darkHero ? "rgba(255,255,255,0.08)" : "rgba(13,31,60,0.08)",
              background: darkHero ? "rgba(0,0,0,0.2)" : "rgba(13,31,60,0.05)",
            }}
          >
            <div className="flex items-center gap-1.5" style={{ color: darkHero ? "rgba(255,255,255,0.5)" : "rgba(13,31,60,0.5)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span className="font-semibold uppercase tracking-wider">Secured by 256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-3" style={{ color: darkHero ? "rgba(255,255,255,0.5)" : "rgba(13,31,60,0.5)" }}>
              <span>PHP/USD <span className="font-bold" style={{ color: "#C97B22" }}>₱56.24</span></span>
              <span>Padala Fee <span className="font-bold" style={{ color: "#C97B22" }}>$0 Today</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <TickerBar />

      {/* ── Three Values ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[#C97B22] text-xs font-bold uppercase tracking-widest text-center mb-3">Our Promise</p>
          <h2 className="text-4xl font-black text-[#0D1F3C] text-center mb-16" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Three values. One app.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                filipino: "Tiwala",
                title: "Trust, built into every transaction.",
                desc: "Zero hidden fees. The true mid-market exchange rate, every time. Real-time tracking so you always know where your money is.",
                stat: "0.00%",
                statLabel: "Transfer fee — always",
                vs: "vs. 3.5% average bank",
                img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
              },
              {
                filipino: "Bayanihan",
                title: "Your family feels it in 2.4 seconds.",
                desc: "Send padala to Manila instantly. No intermediary banks. No weekend delays. Just the peace of mind that your family is cared for — now.",
                stat: "2.4s",
                statLabel: "Average settlement",
                vs: "vs. 3–5 business days",
                img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
              },
              {
                filipino: "Kinabukasan",
                title: "Your idle money deserves better.",
                desc: "AI-powered savings routing, 5.10% APY, and investment tools built for OFWs. Your hard-earned dollars work for your family's future — automatically.",
                stat: "5.10%",
                statLabel: "APY on USD balance",
                vs: "vs. 0.01% at legacy banks",
                img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80",
              },
            ].map((v, i) => (
              <div key={i} className="bg-[#F5EFE3] rounded-3xl overflow-hidden border border-[#e8dece] hover:-translate-y-1 transition-transform duration-300">
                <div className="h-48 overflow-hidden">
                  <img src={v.img} alt={v.filipino} className="w-full h-full object-cover" />
                </div>
                <div className="p-7">
                  <p className="text-[#C97B22] text-xs font-black uppercase tracking-widest mb-2">{v.filipino}</p>
                  <h3 className="text-xl font-black text-[#0D1F3C] mb-3 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{v.title}</h3>
                  <p className="text-[#0D1F3C]/60 text-sm leading-relaxed mb-5">{v.desc}</p>
                  <div className="bg-white rounded-xl p-4 border border-[#e8dece]">
                    <p className="text-3xl font-black text-[#0D1F3C]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{v.stat}</p>
                    <p className="text-xs text-[#0D1F3C]/60 font-semibold">{v.statLabel}</p>
                    <p className="text-xs text-[#C97B22] font-bold mt-1">{v.vs}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24" style={{ backgroundColor: "#F5EFE3", ...DOT_BG }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[#C97B22] text-xs font-bold uppercase tracking-widest text-center mb-3">How It Works</p>
          <h2 className="text-4xl font-black text-[#0D1F3C] text-center mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Sending padala home<br />in 3 steps.
          </h2>
          <p className="text-center text-[#0D1F3C]/60 mb-16">From your phone to their hands — in under a minute.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Find your family", desc: "Search by name or phone — your family is already saved.", icon: "👨‍👩‍👧" },
              { num: "02", title: "Set the amount", desc: "See exactly what they'll receive. Zero surprises — no hidden fees, no FX spread.", icon: "💸" },
              { num: "03", title: "It arrives instantly", desc: "In ~2.4 seconds, your family feels it. Real-time notification for both of you.", icon: "⚡" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-[#e8dece] relative">
                <div className="text-6xl font-black text-[#0D1F3C]/5 absolute top-4 right-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.num}</div>
                <div className="w-14 h-14 rounded-2xl bg-[#C97B22]/10 flex items-center justify-center text-2xl mb-5">{s.icon}</div>
                <p className="text-[#C97B22] text-xs font-black uppercase tracking-wider mb-2">Step {s.num}</p>
                <h3 className="text-xl font-black text-[#0D1F3C] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.title}</h3>
                <p className="text-[#0D1F3C]/60 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 bg-white" id="pricing">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[#C97B22] text-xs font-bold uppercase tracking-widest text-center mb-3">Pricing</p>
          <h2 className="text-4xl font-black text-[#0D1F3C] text-center mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Simple pricing. No surprises.
          </h2>
          <p className="text-center text-[#0D1F3C]/60 mb-12">Banks charge you to send your own money home. We don't.</p>
          <div className="bg-[#F5EFE3] rounded-3xl overflow-hidden border border-[#e8dece]">
            <div className="grid grid-cols-3 bg-[#0D1F3C] text-white">
              <div className="p-5 text-sm font-bold text-white/50"></div>
              <div className="p-5 text-center border-l border-white/10">
                <p className="text-[#C97B22] text-xs font-black uppercase tracking-widest mb-1">KinnectFi</p>
                <p className="font-black text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Free</p>
              </div>
              <div className="p-5 text-center border-l border-white/10">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Legacy Banks</p>
                <p className="font-black text-xl text-white/60" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Expensive</p>
              </div>
            </div>
            {[
              { label: "Monthly fee", kinnect: "$0 / month", bank: "$12–25 / month", good: true },
              { label: "Transfer fee", kinnect: "0.00%", bank: "$15–35 per wire", good: true },
              { label: "FX spread markup", kinnect: "0.00%", bank: "2–4% markup", good: true },
              { label: "APY on balance", kinnect: "5.10% APY", bank: "0.01% APY", good: true },
              { label: "Transfer speed", kinnect: "~2.4 seconds", bank: "3–5 business days", good: true },
              { label: "FDIC insured", kinnect: "Up to $250,000", bank: "Up to $250,000", good: false },
              { label: "Hidden fees", kinnect: "None — ever", bank: "FX spread, wire fee...", good: true },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-t border-[#e8dece] ${i % 2 === 0 ? "bg-white" : ""}`}>
                <div className="p-4 text-sm font-semibold text-[#0D1F3C]/70">{row.label}</div>
                <div className="p-4 text-sm font-bold text-[#C97B22] text-center border-l border-[#e8dece]">{row.kinnect}</div>
                <div className="p-4 text-sm font-semibold text-[#0D1F3C]/50 text-center border-l border-[#e8dece]">{row.bank}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/auth" className="inline-flex items-center gap-2 bg-[#C97B22] hover:bg-[#b36a1a] text-white font-bold rounded-full px-8 py-4 text-base transition-colors shadow-lg shadow-[#C97B22]/25">
              Get started — it's free <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-gray-400 mt-3">No credit card required · Join 14,204 on the waitlist</p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24" style={{ backgroundColor: "#F5EFE3", ...DOT_BG }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[#C97B22] text-xs font-bold uppercase tracking-widest text-center mb-3">The Community</p>
          <h2 className="text-4xl font-black text-[#0D1F3C] text-center mb-16" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Built for the OFW generation.
          </h2>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {[
              { val: "$32B", label: "Sent to Philippines annually", sub: "from the Filipino diaspora" },
              { val: "4M+", label: "OFWs in the United States", sub: "supporting families back home" },
              { val: "$0", label: "Average fee per transfer", sub: "at KinnectFi — vs. $25 at banks" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-[#e8dece] text-center">
                <p className="text-5xl font-black text-[#0D1F3C] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</p>
                <p className="font-bold text-[#0D1F3C] text-sm mb-1">{s.label}</p>
                <p className="text-gray-400 text-xs">{s.sub}</p>
              </div>
            ))}
          </div>
          {/* Quotes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "I used to send $300 home and my family received ₱15,800. With KinnectFi, they get ₱16,870. That's a full week of groceries — just from the fee I used to lose.", name: "Rica Lim", role: "Nurse", location: "Houston, TX → Cebu", initials: "RL" },
              { quote: "My bank took 3 days and charged $25 per transfer. KinnectFi settles in seconds and costs nothing. I send money home twice a month now instead of once.", name: "Marco Reyes", role: "Software Engineer", location: "San Francisco, CA → Manila", initials: "MR" },
              { quote: "The app is so simple — I just tap, confirm, and my nanay gets the money right away. No hidden fees, no confusing forms. Finally something built for us.", name: "Joy Santos", role: "Domestic Worker", location: "Boston, MA → Iloilo", initials: "JS" },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-[#e8dece]">
                <p className="text-[#0D1F3C] leading-relaxed mb-6 text-sm italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C97B22] flex items-center justify-center text-white font-black text-sm">{t.initials}</div>
                  <div>
                    <p className="font-bold text-[#0D1F3C] text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role} · {t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section className="py-24 bg-[#0D1F3C]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[#C97B22] text-xs font-bold uppercase tracking-widest text-center mb-3">Security</p>
          <h2 className="text-4xl font-black text-white text-center mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Security that doesn't<br />compromise speed.
          </h2>
          <p className="text-white/50 text-center mb-16 max-w-xl mx-auto">We built KinnectFi from the ground up with safety first. Proprietary AI risk engines and leading regulated institutions — lightning-fast and impenetrable.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🔐", title: "Bank-Grade Encryption", desc: "AES-256 bit encryption and dynamic 2FA to ensure your funds and data are impenetrable." },
              { icon: "🌐", title: "Global Compliance", desc: "Fully regulated, built with top-tier compliance vendors. Your money is safe at every step." },
              { icon: "🤖", title: "Real-time Monitoring", desc: "AI-driven fraud detection analyzing patterns 24/7 to instantly freeze suspicious activity." },
              { icon: "🏦", title: "FDIC Insured up to $250k", desc: "Your fiat balances are held in U.S. partner banks, ensuring peace of mind up to standard limits." },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-white mb-2 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-10 flex-wrap">
            {["PLAID", "VISA", "AWS", "FDIC"].map(b => (
              <div key={b} className="bg-white/5 border border-white/10 rounded-xl px-5 py-2.5 text-white/40 font-black text-sm tracking-wider">{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founders / About ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#C97B22] text-xs font-bold uppercase tracking-widest text-center mb-3">About Us</p>
          <h2 className="text-4xl font-black text-[#0D1F3C] text-center mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            We're building the financial bridge<br />for immigrants moving to America.
          </h2>
          <div className="flex justify-center mb-12">
            <img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/052538e80_akshatparwal37--kinnectfi-frontend-fastapi-app_modal_run_filipino_family_remittance_2641e1b7.png" alt="KinnectFi story" className="w-full max-w-2xl rounded-3xl object-cover h-64 shadow-xl" />
          </div>
          <div className="bg-[#F5EFE3] rounded-3xl p-8 border border-[#e8dece] mb-10">
            <p className="text-[#0D1F3C]/70 leading-relaxed text-center max-w-2xl mx-auto">
              Paco is a Filipino who immigrated to the US over 10 years ago. After moving to Harvard Business School, he met Akshat, who had faced remarkably similar challenges when he moved from India. They realized millions of immigrants face the same broken experience — arriving in a new country with no credit history, no local bank account, and no clear path to financial inclusion. <strong className="text-[#0D1F3C]">The idea of KinnectFi was born.</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                name: "Paco Litonjua",
                role: "Co-Founder",
                bullets: ["HBS MBA 2027", "Figure Technologies — Senior Product Manager", "Stanford University, B.S."],
                img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
              },
              {
                name: "Akshat Parwal",
                role: "Co-Founder",
                bullets: ["HBS MBA 2027", "slice — Setup India's first digital bank", "L.E.K. Consulting — Strategy Consulting"],
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
              },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-5 bg-[#F5EFE3] rounded-2xl p-6 border border-[#e8dece]">
                <img src={f.img} alt={f.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
                <div>
                  <p className="font-black text-[#0D1F3C] text-lg mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.name}</p>
                  <p className="text-[#C97B22] text-xs font-bold uppercase tracking-wider mb-3">{f.role}</p>
                  {f.bullets.map((b, j) => (
                    <p key={j} className="text-[#0D1F3C]/60 text-xs flex gap-2 mb-1"><span className="text-[#C97B22]">·</span>{b}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── Final CTA ── */}
      <section className="py-24 bg-[#0D1F3C] text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ready to send your first <span className="text-[#C97B22]">padala</span>?
          </h2>
          <p className="text-white/60 mb-8">Sign up free and send your first transfer with zero fees. It takes less than 5 minutes.</p>
          <Link to="/auth" className="inline-flex items-center gap-2 bg-[#C97B22] hover:bg-[#b36a1a] text-white font-bold rounded-full px-10 py-4 text-base transition-colors shadow-lg shadow-[#C97B22]/30">
            Join the Waitlist <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex justify-center gap-6 mt-6">
            {["Free to join", "No monthly fees", "Cancel anytime"].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5 text-white/40 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5 text-[#C97B22]" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}