import { useOutletContext } from "react-router-dom";
import { TrendingUp, Calendar, Plus, ChevronRight } from "lucide-react";

const WALLETS = [
  { flag: "🇺🇸", code: "USD", name: "US Dollar", balance: "$150.00", yield_: "5.1%", dark: true },
  { flag: "🇵🇭", code: "PHP", name: "Philippine Peso", balance: "₱5,000.00", yield_: "6.5%", dark: false },
];

const QUICK_SEND = [
  { emoji: "👩", label: "Nanay" }, { emoji: "👴", label: "Tatay" }, { emoji: "👩‍🦱", label: "Ate" },
  { emoji: "👦", label: "Kuya" }, { emoji: "💛", label: "Friend" }, { emoji: "+", label: "New Padala", isAdd: true },
];

const COMMUNITY = [
  { emoji: "🎓", label: "Sent $500 for younger sibling's tuition", sub: "EXAMPLE PADALA", highlight: true },
  { emoji: "🏠", label: "Reached the 'House in the Phils' savings goal!", sub: "EXAMPLE SAVINGS MILESTONE" },
  { emoji: "💸", label: "$1,200 zero-spread transfer to Cebu", sub: "EXAMPLE TRANSFER" },
  { emoji: "✈️", label: "Claimed Bayani Tier perks at NAIA lounge", sub: "EXAMPLE PERK", highlight: true },
];

export default function Dashboard() {
  const { darkMode } = useOutletContext() || {};
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/5";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${darkMode ? "bg-[#1a2332] border border-white/5" : "bg-[#f0e8d8] border border-black/5"}`}>
        <div className="flex items-center gap-3">
          <span className="text-primary text-lg">🙏</span>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider ${muted}`}>UPCOMING: </span>
            <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>Semana Santa</span>
            <span className={`text-sm ${muted}`}> · Reflecting during the Holy Week</span>
          </div>
        </div>
        <Calendar className={`w-4 h-4 ${muted}`} />
      </div>

      {/* Net Worth Card */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2e00 50%, #8a6a00 100%)" }}>
        <div className="p-8">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Total Net Worth</p>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-5xl font-black text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$ 238.97</p>
              <p className="text-white/60 text-sm">₱ 13,430.00</p>
              <p className="text-white/40 text-xs mt-1">vs. 24h ago · Dual Display</p>
            </div>
            <div className="bg-primary/20 border border-primary/30 rounded-full px-3 py-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-primary text-xs font-bold">+2.34%</span>
            </div>
          </div>
          <p className="text-white/70 text-sm mt-4">Good afternoon, <span className="font-bold text-white">Test</span></p>
        </div>
      </div>

      {/* Wallets */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Wallets</h2>
          <button className="text-primary text-xs font-bold uppercase tracking-wider">SLIDE →</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {WALLETS.map(w => (
            <div key={w.code} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: w.dark ? "linear-gradient(135deg, #1a2a4a, #3d2e00)" : "linear-gradient(135deg, #0d1a3a, #1a3a6a)" }}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <span>{w.flag}</span>
                  <div><div className="text-white font-bold text-sm">{w.code}</div><div className="text-white/40 text-xs">{w.name}</div></div>
                </div>
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">⚡ Yield {w.yield_}</span>
              </div>
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Balance</div>
                <div className="text-white font-black text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{w.balance}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Send */}
      <div>
        <h2 className="font-extrabold text-lg mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quick Send</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {QUICK_SEND.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-transform group-hover:scale-105 ${p.isAdd ? `border-2 border-dashed ${darkMode ? "border-white/20" : "border-black/20"}` : `${darkMode ? "bg-white/10" : "bg-black/10"}`}`}>
                {p.isAdd ? <Plus className="w-4 h-4 opacity-40" /> : p.emoji}
              </div>
              <span className={`text-[10px] font-semibold ${muted}`}>{p.label}</span>
              {!p.isAdd && <span className="text-[9px] text-primary uppercase">ADD</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Activity Feed</h2>
          <button className="text-primary text-xs font-bold uppercase tracking-wider">VIEW ALL</button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-primary">⚡</span>
              <h3 className="font-bold">Community Stories</h3>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${darkMode ? "bg-white/10 text-white/60" : "bg-black/10 text-black/60"}`}>HIGHLIGHTS</span>
          </div>
          <div className="space-y-2">
            {COMMUNITY.map((c, i) => (
              <div key={i} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border ${c.highlight ? `${darkMode ? "border-primary/20 bg-primary/5" : "border-primary/20 bg-primary/5"}` : `${darkMode ? "border-white/5 bg-white/2" : "border-black/5 bg-black/2"}`}`}>
                <span className="text-xl flex-shrink-0">{c.emoji}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>{c.label}</p>
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${muted}`}>{c.sub}</p>
                </div>
                {c.highlight && <span className="text-primary text-xs">★</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Family invite */}
        <div className={`rounded-2xl p-8 text-center ${darkMode ? "bg-[#f5efe6]" : "bg-[#f5efe6]"}`}>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-primary text-lg">❤️</span>
          </div>
          <span className="bg-primary text-secondary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Family Network</span>
          <h3 className="text-[#1a2a4a] font-extrabold text-xl mt-3 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Isama mo ang pamilya!</h3>
          <p className="text-[#1a2a4a]/60 text-sm mb-4">Invite your family and friends to KinnectFi. You both earn <span className="text-primary font-bold">500 Kinnect Points</span> — that's a free padala fee!</p>
          <button className="bg-primary text-secondary font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">Invite Family & Friends</button>
        </div>
      </div>
    </div>
  );
}