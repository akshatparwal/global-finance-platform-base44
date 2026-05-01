import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 8 Philippine cultural events with real month/day anchors
const EVENTS = [
  {
    month: 1, day: 1,
    name: "Bagong Taon",
    emoji: "🎆",
    msg: "Manigong Bagong Taon! Wishing your family abundance this year.",
    tl: "Happy New Year sa inyong pamilya! 🇵🇭",
    window: 3,
    svgAccent: "text-yellow-400",
  },
  {
    month: 2, day: 14,
    name: "Valentine's Day",
    emoji: "💝",
    msg: "Send love home — a padala today is the best Valentine's gift.",
    tl: "Magpadala ng pagmamahal sa pamilya ngayon! 💕",
    window: 2,
    svgAccent: "text-pink-400",
  },
  {
    month: 4, day: 9,
    name: "Araw ng Kagitingan",
    emoji: "🎖️",
    msg: "Day of Valor — honoring Filipino heroes, including you, the OFW.",
    tl: "Ikaw rin ay bayani ng iyong pamilya. 🇵🇭",
    window: 2,
    svgAccent: "text-amber-400",
  },
  {
    month: 5, day: 1,
    name: "Labor Day",
    emoji: "✊",
    msg: "Happy Labor Day! Your hard work abroad keeps your family strong.",
    tl: "Maligayang Araw ng Paggawa sa lahat ng OFW! 💪",
    window: 2,
    svgAccent: "text-blue-400",
  },
  {
    month: 6, day: 12,
    name: "Araw ng Kalayaan",
    emoji: "🇵🇭",
    msg: "Philippine Independence Day — Mabuhay ang Pilipinas!",
    tl: "Ipagdiwang ang kalayaan ng ating bansa! 🌺",
    window: 3,
    svgAccent: "text-red-400",
  },
  {
    month: 11, day: 1,
    name: "Undas",
    emoji: "🕯️",
    msg: "Undas season — a time to honor loved ones near and far.",
    tl: "Alaala natin ang mga nagmahal sa atin. 🙏",
    window: 3,
    svgAccent: "text-purple-400",
  },
  {
    month: 12, day: 16,
    name: "Simbang Gabi",
    emoji: "⛪",
    msg: "Simbang Gabi begins! Send pasalubong home for the holidays.",
    tl: "Maligayang Pasko! Mag-padala ng pagmamahal. 🎄",
    window: 10,
    svgAccent: "text-emerald-400",
  },
  {
    month: 12, day: 25,
    name: "Pasko",
    emoji: "🎄",
    msg: "Maligayang Pasko! Your padala is the best Christmas gift for your family.",
    tl: "Pasko na! I-padala ang iyong pagmamahal. 🎁",
    window: 5,
    svgAccent: "text-red-400",
  },
];

function getActiveEvent() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return EVENTS.find((e) => {
    const eventDate = new Date(now.getFullYear(), e.month - 1, e.day);
    const diff = Math.floor((now - eventDate) / 86400000);
    return diff >= -3 && diff <= e.window;
  });
}

export default function CelebrationsWidget({ darkMode, taglish }) {
  const [event, setEvent] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const active = getActiveEvent();
    if (active) {
      const key = `kf_celebration_dismissed_${active.name}_${new Date().getFullYear()}`;
      if (!localStorage.getItem(key)) setEvent(active);
    }
  }, []);

  if (!event || dismissed) return null;

  const dismissKey = `kf_celebration_dismissed_${event.name}_${new Date().getFullYear()}`;
  const handleDismiss = () => {
    localStorage.setItem(dismissKey, "1");
    setDismissed(true);
  };

  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ duration: 0.35 }}
        className={`relative rounded-2xl px-4 py-4 mb-2 border overflow-hidden flex items-center gap-3
          ${darkMode ? "bg-[#1a2332] border-white/8" : "bg-white border-black/8"}`}
      >
        {/* Animated emoji */}
        <motion.span
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-3xl flex-shrink-0"
        >
          {event.emoji}
        </motion.span>

        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${event.svgAccent} mb-0.5`}>
            {event.name}
          </p>
          <p className={`text-xs font-semibold ${text} leading-snug`}>
            {taglish ? event.tl : event.msg}
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 text-lg leading-none ${muted} hover:opacity-70 transition-opacity p-1`}
          aria-label="Dismiss"
        >
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  );
}