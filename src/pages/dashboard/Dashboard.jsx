import { useOutletContext, useNavigate } from "react-router-dom";
import { TrendingUp, Calendar, Plus, RefreshCw, ArrowDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

const COMMUNITY = [
  { emoji: "🎓", label: "Sent $500 for younger sibling's tuition", sub: "EXAMPLE PADALA", highlight: true },
  { emoji: "🏠", label: "Reached the 'House in the Phils' savings goal!", sub: "EXAMPLE SAVINGS MILESTONE" },
  { emoji: "💸", label: "$1,200 zero-spread transfer to Cebu", sub: "EXAMPLE TRANSFER" },
  { emoji: "✈️", label: "Claimed Bayani Tier perks at NAIA lounge", sub: "EXAMPLE PERK", highlight: true },
];

export default function Dashboard() {
  const { darkMode, taglish } = useOutletContext() || {};
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/5";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  const fetchData = useCallback(async () => {
    const [u, w, t] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.WalletBalance.list().catch(() => []),
      base44.entities.Transfer.list("-created_date", 5).catch(() => []),
    ]);
    if (u) setUser(u);
    setWallets(w);
    setTransfers(t);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { containerRef, pullY, phase } = usePullToRefresh(fetchData);
  const pulling = phase === "pulling" || phase === "ready";
  const refreshing = phase === "refreshing";

  const totalUSD = wallets.find(w => w.currency_code === "USD")?.balance || 0;
  const totalPHP = wallets.find(w => w.currency_code === "PHP")?.balance || 0;
  const netWorth = totalUSD + (totalPHP / 56.24);

  const greeting = (() => {
    const h = new Date().getHours();
    if (taglish) return h < 12 ? "Magandang umaga" : h < 18 ? "Magandang hapon" : "Magandang gabi";
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  const QUICK_SEND = [
    { emoji: "👩", label: taglish ? "Nanay" : "Mom" },
    { emoji: "👴", label: taglish ? "Tatay" : "Dad" },
    { emoji: "👩‍🦱", label: taglish ? "Ate" : "Sister" },
    { emoji: "👦", label: taglish ? "Kuya" : "Brother" },
    { emoji: "💛", label: taglish ? "Kaibigan" : "Friend" },
    { emoji: "+", label: taglish ? "Bagong Padala" : "New Send", isAdd: true },
  ];

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Pull-to-refresh indicator — sits above scroll content, never clipped */}
      <div
        className="sticky top-0 z-10 flex items-center justify-center gap-2 text-primary text-xs font-bold uppercase tracking-wider overflow-hidden transition-all duration-200 pointer-events-none"
        style={{
          height: refreshing ? 44 : pulling ? Math.max(pullY * 0.7, 0) : 0,
          opacity: refreshing ? 1 : pullY > 15 ? Math.min((pullY - 15) / 40, 1) : 0,
        }}
      >
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${phase === "ready" ? "bg-primary text-secondary" : "bg-primary/10 text-primary"} transition-colors`}
        >
          {refreshing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ArrowDown
              className="w-3.5 h-3.5 transition-transform duration-200"
              style={{ transform: phase === "ready" ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          )}
          <span>{refreshing ? "Refreshing..." : phase === "ready" ? "Release to refresh" : "Pull to refresh"}</span>
        </div>
      </div>
      <div ref={containerRef} className="space-y-6 overflow-y-auto">
      {/* Banner */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${darkMode ? "bg-[#1a2332] border border-white/5" : "bg-[#f0e8d8] border border-black/5"}`}>
        <div className="flex items-center gap-3">
          <span className="text-primary text-lg">🙏</span>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider ${muted}`}>UPCOMING: </span>
            <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>Semana Santa</span>
            <span className={`text-sm ${muted}`}> · {taglish ? "Banal na Linggo" : "Reflecting during the Holy Week"}</span>
          </div>
        </div>
        <Calendar className={`w-4 h-4 ${muted}`} />
      </div>

      {/* Net Worth Card */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2e00 50%, #8a6a00 100%)" }}>
        <div className="p-8">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{taglish ? "Kabuuang Halaga" : "Total Net Worth"}</p>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-5xl font-black text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                $ {netWorth.toFixed(2)}
              </p>
              <p className="text-white/60 text-sm">₱ {totalPHP.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
              <p className="text-white/40 text-xs mt-1">vs. 24h ago · Dual Display</p>
            </div>
            <div className="bg-primary/20 border border-primary/30 rounded-full px-3 py-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-primary text-xs font-bold">+2.34%</span>
            </div>
          </div>
          <p className="text-white/70 text-sm mt-4">{greeting}, <span className="font-bold text-white">{user?.full_name?.split(" ")[0] || "OFW"}</span></p>
        </div>
      </div>

      {/* Wallets */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{taglish ? "Mga Pitaka" : "Wallets"}</h2>
          <button onClick={() => navigate("/dashboard/pay")} className="text-primary text-xs font-bold uppercase tracking-wider hover:opacity-70">
            {taglish ? "MAGPADALA →" : "SEND MONEY →"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {wallets.length > 0 ? wallets.map(w => (
            <div key={w.currency_code} className="rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
              style={{ background: w.currency_code === "USD" ? "linear-gradient(135deg, #1a2a4a, #3d2e00)" : "linear-gradient(135deg, #0d1a3a, #1a3a6a)" }}
              onClick={() => navigate("/dashboard/pay")}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <span>{w.flag}</span>
                  <div><div className="text-white font-bold text-sm">{w.currency_code}</div><div className="text-white/40 text-xs">{w.currency_name}</div></div>
                </div>
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">⚡ Yield {w.yield_pct}</span>
              </div>
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{taglish ? "Balanse" : "Balance"}</div>
                <div className="text-white font-black text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {w.currency_code === "USD" ? `$${w.balance.toFixed(2)}` : `₱${w.balance.toLocaleString("en-PH", {minimumFractionDigits: 2})}`}
                </div>
              </div>
            </div>
          )) : (
            // Fallback while loading
            ["USD","PHP"].map(code => (
              <div key={code} className="rounded-2xl p-5 animate-pulse h-32" style={{ background: "linear-gradient(135deg, #1a2a4a, #3d2e00)" }} />
            ))
          )}
        </div>
      </div>

      {/* Quick Send */}
      <div>
        <h2 className="font-extrabold text-lg mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{taglish ? "Mabilis na Padala" : "Quick Send"}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {QUICK_SEND.map((p, i) => (
            <button key={i} onClick={() => navigate("/dashboard/pay")}
              className="flex flex-col items-center gap-2 flex-shrink-0 group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${p.isAdd ? `border-2 border-dashed ${darkMode ? "border-white/20" : "border-black/20"}` : `${darkMode ? "bg-white/10" : "bg-black/10"}`}`}>
                {p.isAdd ? <Plus className="w-4 h-4 opacity-40" /> : p.emoji}
              </div>
              <span className={`text-[10px] font-semibold ${muted}`}>{p.label}</span>
              {!p.isAdd && <span className="text-[9px] text-primary uppercase">{taglish ? "PADALA" : "SEND"}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{taglish ? "Mga Aktibidad" : "Activity Feed"}</h2>
          <button onClick={() => navigate("/dashboard/pay")} className="text-primary text-xs font-bold uppercase tracking-wider hover:opacity-70">VIEW ALL</button>
        </div>

        {/* Recent Transfers */}
        {transfers.length > 0 && (
          <div className="space-y-2 mb-4">
            {transfers.map((t, i) => (
              <div key={i} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                  {t.recipient_name?.[0] || "?"}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>
                    Sent to {t.recipient_name}
                  </p>
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${muted}`}>
                    {new Date(t.created_date).toLocaleDateString()} · {t.status}
                  </p>
                </div>
                <p className="font-bold text-primary">${t.amount_usd}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-primary">⚡</span>
              <h3 className="font-bold">{taglish ? "Mga Kwento ng Komunidad" : "Community Stories"}</h3>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${darkMode ? "bg-white/10 text-white/60" : "bg-black/10 text-black/60"}`}>HIGHLIGHTS</span>
          </div>
          <div className="space-y-2">
            {COMMUNITY.map((c, i) => (
              <div key={i} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border ${c.highlight ? "border-primary/20 bg-primary/5" : `${darkMode ? "border-white/5" : "border-black/5"}`}`}>
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
        <div className="rounded-2xl p-8 text-center bg-[#f5efe6]">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-primary text-lg">❤️</span>
          </div>
          <span className="bg-primary text-secondary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {taglish ? "Pamilya Network" : "Family Network"}
          </span>
          <h3 className="text-[#1a2a4a] font-extrabold text-xl mt-3 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {taglish ? "Isama mo ang pamilya!" : "Invite your family!"}
          </h3>
          <p className="text-[#1a2a4a]/60 text-sm mb-4">
            {taglish ? "Imbitahan ang pamilya at kaibigan mo sa KinnectFi." : "Invite your family and friends to KinnectFi."} You both earn <span className="text-primary font-bold">500 Kinnect Points</span>!
          </p>
          <button onClick={() => navigate("/dashboard/profile")}
            className="bg-primary text-secondary font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
            {taglish ? "Imbitahan ang Pamilya" : "Invite Family & Friends"}
          </button>
        </div>
      </div>
      </div>{/* end containerRef */}
    </div>
  );
}