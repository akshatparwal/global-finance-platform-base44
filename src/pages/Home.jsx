import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveRates } from "@/hooks/useLiveRates";

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
    <div className="min-h-screen" style={{ backgroundColor: "#F5EFE3", fontFamily: "'Inter', sans-serif" }}>
      <section className="flex flex-col lg:flex-row" style={{ height: "100vh", minHeight: 600, maxHeight: 900 }}>

        {/* LEFT: full-bleed photo */}
        <div className="relative flex-1 overflow-hidden min-h-[50vh] lg:min-h-0">
          <img
            src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1400&q=90"
            alt="Filipino family celebration"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 38%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0.08) 100%)" }} />

          {/* Logo */}
          <div className="absolute top-7 left-7 flex items-center gap-2.5 z-10 bg-black/40 backdrop-blur-sm rounded-2xl px-3 py-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <img src="https://media.base44.com/images/public/69e68470b4eb59a82dcf3e9c/815953c27_svg_008.svg" className="w-full h-full scale-150 object-cover" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Kinnect<span className="text-[#C97B22]">Fi</span>
              </div>
              <div className="text-white/40 text-[8px] uppercase tracking-widest">Cross-Border Neobank</div>
            </div>
          </div>

          {/* Hero copy */}
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 lg:px-12 lg:pb-14 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`hero-text-${taglish}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {taglish ? (
                  <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-white leading-[1.06] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Ang pera mo,{" "}
                    <span className="text-[#C97B22]">konektado</span>{" "}
                    sa puso mo.
                  </h1>
                ) : (
                  <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-white leading-[1.06] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Your money,{" "}
                    <span className="text-[#C97B22]">connected</span>{" "}
                    to your heart.
                  </h1>
                )}
                <p className="text-white/75 text-base mb-7 max-w-sm leading-relaxed">
                  {taglish
                    ? "Ipadala ang pera sa pamilya mo — mabilis, ligtas, at walang bayad."
                    : "Send money home instantly, securely, and with zero hidden fees."}
                </p>
              </motion.div>
            </AnimatePresence>

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
                <p className="text-white/65 text-[11px] font-semibold uppercase tracking-wider">
                  {taglish ? "Pinagkakatiwalaan ng 10,000+ Pilipino sa buong mundo" : "Trusted by 10,000+ Filipinos worldwide"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: info panel */}
        <div
          className="flex-shrink-0 w-full lg:w-[400px] xl:w-[440px] flex flex-col"
          style={{ background: panelBg, transition: "background 0.4s" }}
        >
          {/* Top toolbar */}
          <div className="flex items-center justify-between px-7 pt-7 pb-2">
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
          <div className="flex-1 flex flex-col justify-center px-7 py-6">
            <div className="flex justify-center mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideIdx}
                  initial={{ opacity: 0, scale: 0.94, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -8 }}
                  transition={{ duration: 0.38 }}
                  className="w-44 h-44 rounded-2xl overflow-hidden shadow-2xl"
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
                className="text-center mb-8"
              >
                <h2 className="text-[1.45rem] font-black mb-2.5 leading-snug" style={{ color: panelText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {txt.title}
                </h2>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: panelMuted }}>
                  {txt.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            <Link
              to="/auth"
              aria-label={taglish ? "Magsimula na sa KinnectFi" : "Get started with KinnectFi — create your free account"}
              className="flex items-center justify-center gap-2 font-bold rounded-xl py-4 px-6 text-base mb-3 hover:opacity-90 transition-opacity"
              style={{ background: "#C97B22", color: "#fff" }}
            >
              {taglish ? "Magsimula Na →" : "Get Started →"}
            </Link>
            <p className="text-center text-[11px] mb-7" style={{ color: panelMuted }}>
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
            className="flex items-center justify-between px-6 py-3.5 border-t text-[10px] font-semibold uppercase tracking-wider"
            style={{ borderColor: panelBorder, background: darkHero ? "rgba(0,0,0,0.25)" : "rgba(13,31,60,0.04)" }}
          >
            <div className="flex items-center gap-1.5" style={{ color: panelMuted }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              {taglish ? "Secured ng 256-bit Encryption" : "Secured by 256-bit Encryption"}
            </div>
            <div className="flex items-center gap-3" style={{ color: panelMuted }}>
              <span>PHP/USD <span className="font-black" style={{ color: "#C97B22" }}>₱{liveRate}</span></span>
              <span>{taglish ? "Bayad" : "Fee"} <span className="font-black" style={{ color: "#C97B22" }}>$0</span></span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}