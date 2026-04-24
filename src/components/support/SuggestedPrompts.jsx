const PROMPTS = [
  { emoji: "💱", text: "What's the current USD/PHP rate?" },
  { emoji: "💸", text: "How long does a transfer take?" },
  { emoji: "🔒", text: "Is my money safe with KinnectFi?" },
  { emoji: "📋", text: "What documents do I need for KYC?" },
  { emoji: "💳", text: "How do I get a KinnectFi card?" },
  { emoji: "🏦", text: "Which Philippine banks are supported?" },
];

export default function SuggestedPrompts({ onSelect, darkMode }) {
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  return (
    <div className="px-4 pb-2">
      <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2 text-center`}>Quick questions</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(p.text)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-colors active:scale-95 ${
              darkMode
                ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                : "border-black/10 bg-black/4 text-[#1a2a4a]/70 hover:bg-black/8 hover:text-[#1a2a4a]"
            }`}
          >
            <span>{p.emoji}</span>
            <span>{p.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}