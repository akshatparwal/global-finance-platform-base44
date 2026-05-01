import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, Award, Heart, Shield, TrendingUp } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const SLIDES_CONFIG = (stats, firstName, taglish) => [
  {
    id: "intro",
    title: `Your 2026 KinnectFi Story`,
    subtitle: `A year of connection, sacrifice, and love.`,
    emoji: "🌟",
    gradient: "from-[#c97a20] to-[#e8a030]",
    content: `Ready to see how far your hard work reached, ${firstName}?`,
  },
  {
    id: "total_sent",
    title: taglish ? "Nagpadala ka ng kabuuang" : "You sent a total of",
    value: stats.displayTotalPHP,
    subtitle: `across ${stats.transferCount} transfer${stats.transferCount !== 1 ? "s" : ""} this year.`,
    emoji: "💸",
    gradient: "from-[#1a2a4a] to-[#3d2e00]",
    content: taglish
      ? "Bawat piso ay patunay ng iyong pagmamahal."
      : "Every peso is a testament to your hard work abroad.",
  },
  {
    id: "savings",
    title: taglish ? "Nakatipid ka ng" : "You saved",
    value: stats.feesSaved,
    subtitle: taglish ? "sa nakatagong bayad ng bangko." : "in hidden bank fees.",
    emoji: "🛡️",
    gradient: "from-emerald-700 to-teal-500",
    content: taglish
      ? "Dahil ang pamilya mo ay nararapat sa bawat sentimo."
      : "Because your family deserves every single cent.",
  },
  {
    id: "top_recipient",
    title: taglish ? "Pinaka-madalas mong tatanggap" : "Your Top Recipient",
    value: stats.topRecipientName,
    subtitle: `${taglish ? "Nagpadala ka sa kanila" : "You sent to them"} ${stats.topRecipientCount} ${stats.topRecipientCount !== 1 ? "times" : "time"}.`,
    emoji: "❤️",
    gradient: "from-purple-700 to-[#c97a20]",
    content: taglish
      ? "Walang pamilyang naiwan. Salamat sa pagiging bayani nila."
      : "No family left behind. Thank you for being their hero.",
  },
];

export default function KinnectFiStory() {
  const { darkMode, taglish } = useOutletContext() || {};
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transfers, setTransfers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.Transfer.list("-created_date", 100).catch(() => []),
    ]).then(([u, t]) => {
      setUser(u);
      setTransfers(t || []);
      setLoading(false);
    });
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || "OFW";

  const stats = useMemo(() => {
    const now = new Date();
    const yearTxs = transfers.filter((t) => {
      const d = new Date(t.created_date);
      return d.getFullYear() === now.getFullYear();
    });
    const transferCount = yearTxs.length;
    const totalPHP = yearTxs.reduce((s, t) => s + (t.amount_php || (t.amount_usd || 0) * 56.24), 0);
    const totalUSD = yearTxs.reduce((s, t) => s + (t.amount_usd || 0), 0);
    const feesSavedUSD = totalUSD * 0.028;
    const recipientMap = {};
    yearTxs.forEach((t) => {
      const r = t.recipient_name;
      if (r) recipientMap[r] = (recipientMap[r] || 0) + 1;
    });
    const topEntry = Object.entries(recipientMap).sort(([, a], [, b]) => b - a)[0];
    return {
      transferCount: transferCount > 0 ? transferCount : 45,
      displayTotalPHP:
        totalPHP > 0
          ? `₱${Math.round(totalPHP).toLocaleString("en-US")}`
          : "₱1,250,000",
      feesSaved:
        feesSavedUSD > 0
          ? `$${Math.max(1, Math.round(feesSavedUSD)).toLocaleString("en-US")}`
          : "$425",
      topRecipientName: topEntry?.[0] || "Nanay",
      topRecipientCount: topEntry?.[1] || 24,
      hasRealData: transferCount > 0,
    };
  }, [transfers]);

  const SLIDES = SLIDES_CONFIG(stats, firstName, taglish);

  // Auto-advance every 5s
  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setCurrentSlide((p) => (p < SLIDES.length - 1 ? p + 1 : p));
    }, 5000);
    return () => clearInterval(timer);
  }, [loading, SLIDES.length]);

  const slide = SLIDES[currentSlide];

  const handleShare = async () => {
    const text = `I sent ${stats.displayTotalPHP} home this year and saved ${stats.feesSaved} in bank fees. Check out KinnectFi! 🇵🇭`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My 2026 KinnectFi Story", text, url: "https://kinnectfi.com" });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text} https://kinnectfi.com`).catch(() => {});
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "calc(100vh - 80px)" }}>
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl flex flex-col max-w-lg mx-auto"
      style={{ height: "calc(100vh - 100px)", minHeight: 500 }}
    >
      {/* Background gradient */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
        />
      </AnimatePresence>

      {/* Radial glow */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 70% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />

      {/* Progress bars */}
      <div className="relative z-10 flex gap-1.5 px-5 pt-5">
        {SLIDES.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: i < currentSlide ? "100%" : "0%" }}
              animate={{ width: i < currentSlide ? "100%" : i === currentSlide ? "100%" : "0%" }}
              transition={i === currentSlide ? { duration: 5, ease: "linear" } : { duration: 0.2 }}
            />
          </div>
        ))}
      </div>

      {/* Top controls */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          {stats.hasRealData && (
            <span className="bg-emerald-400/30 border border-emerald-400/40 text-emerald-300 text-[9px] font-black px-2 py-1 rounded-full">
              YOUR REAL DATA
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.span
              animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
              className="text-6xl"
            >
              {slide.emoji}
            </motion.span>

            <h2 className="text-white/80 text-lg font-semibold leading-snug">{slide.title}</h2>

            {slide.value && (
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-white font-black text-4xl sm:text-5xl leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {slide.value}
              </motion.p>
            )}

            <p className="text-white/60 text-sm">{slide.subtitle}</p>
            <p className="text-white/80 text-base font-medium leading-relaxed max-w-xs">{slide.content}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation tap areas */}
      <div className="absolute inset-0 flex z-10">
        <div className="flex-1" onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))} />
        <div className="flex-1" onClick={() => setCurrentSlide((p) => Math.min(SLIDES.length - 1, p + 1))} />
      </div>

      {/* Bottom: dots + share on last slide */}
      <div className="relative z-20 px-8 pb-8 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/30"}`}
            />
          ))}
        </div>

        {currentSlide === SLIDES.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 w-full"
          >
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-[#1a2a4a] font-black py-3.5 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              {shared ? "Copied! 🎉" : taglish ? "I-share ang Story" : "Share My Story"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 flex items-center justify-center bg-white/20 backdrop-blur border border-white/30 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-white/30 transition-colors"
            >
              {taglish ? "Tapos na" : "Done"}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}