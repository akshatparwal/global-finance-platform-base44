import { useOutletContext, useNavigate } from "react-router-dom";
import { TrendingUp, Calendar, Plus, RefreshCw, ArrowDown, ArrowDownToLine } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useLiveRates } from "@/hooks/useLiveRates";
import { AnimatePresence } from "framer-motion";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import OnboardingBanner from "@/components/onboarding/OnboardingBanner";
import CommunityStories from "@/components/dashboard/CommunityStories";
import { WalletSkeleton, TransactionSkeleton, NetWorthSkeleton } from "@/components/ui/SkeletonLoader";
import EmptyState from "@/components/ui/EmptyState";
import SpendingPulse from "@/components/dashboard/SpendingPulse";
import { fetchWithCache } from "@/utils/offlineCache";
import FundWalletModal from "@/components/wallet/FundWalletModal";

const COMMUNITY = [
  { emoji: "🎓", label: "Sent $500 for younger sibling's tuition", sub: "EXAMPLE PADALA", highlight: true },
  { emoji: "🏠", label: "Reached the 'House in the Phils' savings goal!", sub: "EXAMPLE SAVINGS MILESTONE" },
  { emoji: "💸", label: "$1,200 zero-spread transfer to Cebu", sub: "EXAMPLE TRANSFER" },
  { emoji: "✈️", label: "Claimed Bayani Tier perks at NAIA lounge", sub: "EXAMPLE PERK", highlight: true },
];

export default function Dashboard() {
  const { darkMode, taglish, bahay } = useOutletContext() || {};
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFundWallet, setShowFundWallet] = useState(false);
  const { rates, loading: ratesLoading } = useLiveRates();
  const liveRate = rates?.USDPHP || 56.24;
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/5";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const textMain = darkMode ? "text-white" : "text-[#1a2a4a]";

  const [offline, setOffline] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [u, walletsResult, transfersResult] = await Promise.all([
      base44.auth.me().catch(() => null),
      fetchWithCache("wallets", () => base44.entities.WalletBalance.list()).catch(() => ({ data: [], fromCache: false })),
      fetchWithCache("transfers_dash", () => base44.entities.Transfer.list("-created_date", 5)).catch(() => ({ data: [], fromCache: false })),
    ]);
    if (u) {
      setUser(u);
      if (!u.onboarding_completed) setShowOnboarding(true);
    }
    setWallets(walletsResult.data || []);
    setTransfers(transfersResult.data || []);
    setOffline(walletsResult.fromCache || transfersResult.fromCache);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { containerRef, pullY, phase } = usePullToRefresh(fetchData);
  const pulling = phase === "pulling" || phase === "ready";
  const refreshing = phase === "refreshing";

  const totalUSD = wallets.find(w => w.currency_code === "USD")?.balance || 0;
  const totalPHP = wallets.find(w => w.currency_code === "PHP")?.balance || 0;
  const netWorth = totalUSD + (totalPHP / liveRate);
  // Bahay mode: PHP-centric display
  const primaryAmount = bahay ? `₱ ${(netWorth * liveRate).toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : `$ ${netWorth.toFixed(2)}`;
  const secondaryAmount = bahay ? `$ ${netWorth.toFixed(2)}` : `₱ ${totalPHP.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  const greeting = (() => {
    const h = new Date().getHours();
    if (taglish) return h < 12 ? "Magandang umaga" : h < 18 ? "Magandang hapon" : "Magandang gabi";
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  const [recipients, setRecipients] = useState([]);
  useEffect(() => {
    base44.entities.Recipient.list("-transfer_count", 5).then(setRecipients).catch(() => {});
  }, []);

  const QUICK_SEND = [
    ...recipients.map(r => ({ emoji: r.emoji || "👤", label: r.nickname || r.full_name, id: r.id })),
    { emoji: "+", label: taglish ? "Bagong Padala" : "New Send", isAdd: true },
  ];

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    // Refresh user to get latest onboarding state
    const u = await base44.auth.me().catch(() => null);
    if (u) setUser(u);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Onboarding modal */}
      <AnimatePresence>
        {showOnboarding && user && (
          <OnboardingModal
            user={user}
            onComplete={handleOnboardingComplete}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
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
      <div ref={containerRef} className="space-y-4 overflow-y-auto">
      {/* Banner */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${darkMode ? "bg-[#1a2332] border border-white/5" : "bg-[#f0e8d8] border border-[#e8dece]"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-primary text-lg flex-shrink-0">🙏</span>
          <div className="min-w-0">
            <span className={`text-xs font-bold uppercase tracking-wider ${muted}`}>UPCOMING: </span>
            <span className={`text-sm font-semibold ${textMain}`}>Semana Santa</span>
            <span className={`text-sm ${muted} hidden sm:inline`}> · {taglish ? "Banal na Linggo" : "Reflecting during the Holy Week"}</span>
          </div>
        </div>
        <Calendar className={`w-4 h-4 ${muted} flex-shrink-0`} />
      </div>

      {/* KYC Completion Banner — only if onboarding incomplete */}
      {user && !user.onboarding_completed && (
        <OnboardingBanner
          user={user}
          onOpen={() => setShowOnboarding(true)}
          darkMode={darkMode}
        />
      )}

      {/* Net Worth Card */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2e00 50%, #8a6a00 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(201,160,80,0.5) 0%, transparent 60%)" }} />
        <div className="relative z-10 px-4 pt-4 pb-5 sm:px-8 sm:pt-8 sm:pb-8">
          <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">{taglish ? "Kabuuang Halaga" : "Total Net Worth"}</p>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-3xl sm:text-5xl font-black text-white mb-0.5 truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {primaryAmount}
              </p>
              <p className="text-white/50 text-xs">{secondaryAmount}</p>
              <p className="text-white/30 text-[10px] mt-0.5">
                {ratesLoading ? "Fetching rate..." : `₱${liveRate.toFixed(2)}/USD · Live`}
              </p>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2.5 py-1 flex items-center gap-1 flex-shrink-0 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-bold">+2.34%</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <p className="text-white/60 text-xs">{greeting}, <span className="font-bold text-white">{user?.full_name?.split(" ")[0] || (user === null ? "..." : "OFW")}</span> 👋</p>
            <button onClick={() => navigate("/dashboard/pay")}
              className="bg-primary text-secondary text-[10px] font-black px-3 py-1.5 rounded-full active:scale-95 transition-transform">
              {taglish ? "MAGPADALA" : "SEND"} →
            </button>
          </div>
        </div>
      </div>

      {/* Wallets */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className={`font-bold text-sm ${textMain}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{taglish ? "Mga Pitaka" : "Wallets"}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFundWallet(true)} className="flex items-center gap-1 text-primary text-[10px] font-bold uppercase tracking-wider hover:opacity-70">
              <ArrowDownToLine className="w-3 h-3" />{taglish ? "Mag-deposit" : "Add Funds"}
            </button>
            <span className={`text-[10px] ${darkMode ? "text-white/20" : "text-black/20"}`}>·</span>
            <button onClick={() => navigate("/dashboard/pay")} className="text-primary text-[10px] font-bold uppercase tracking-wider hover:opacity-70">
              {taglish ? "Padala →" : "Send →"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {loading ? <WalletSkeleton darkMode={darkMode} /> : wallets.length === 0 ? (
            <div className="col-span-2">
              <EmptyState darkMode={darkMode} illustration="👛" title="No wallets yet" description="Your USD and PHP wallets will appear here." size="sm" />
            </div>
          ) : null}
          {!loading && wallets.length > 0 ? (bahay ? [...wallets].reverse() : wallets).map(w => (
            <div key={w.currency_code} className="rounded-2xl p-4 relative overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
              style={{ background: w.currency_code === "USD" ? "linear-gradient(135deg, #1a2a4a, #3d2e00)" : "linear-gradient(135deg, #0d1a3a, #1a3a6a)" }}
              onClick={() => navigate("/dashboard/pay")}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{w.flag}</span>
                  <div><div className="text-white font-bold text-xs">{w.currency_code}</div><div className="text-white/40 text-[9px]">{w.currency_name}</div></div>
                </div>
                <span className="bg-primary/20 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">⚡{w.yield_pct}</span>
              </div>
              <div>
                <div className="text-white/40 text-[9px] uppercase tracking-wider mb-0.5">{taglish ? "Balanse" : "Balance"}</div>
                <div className="text-white font-black text-lg leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {w.currency_code === "USD" ? `$${w.balance.toFixed(2)}` : `₱${w.balance.toLocaleString("en-PH", {minimumFractionDigits: 0})}`}
                </div>
                {bahay && w.currency_code === "USD" && (
                  <div className="text-white/40 text-xs mt-1">≈ ₱{(w.balance * liveRate).toLocaleString("en-PH", {maximumFractionDigits: 0})}</div>
                )}
              </div>
            </div>
          )) : null}
        </div>
      </div>

      {/* Quick Send */}
      <div>
        <h2 className={`font-bold text-sm mb-3 ${textMain}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{taglish ? "Mabilis na Padala" : "Quick Send"}</h2>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-2 pr-8" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {QUICK_SEND.map((p, i) => (
              <button key={i} onClick={() => navigate("/dashboard/pay")}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow ${p.isAdd ? `border-2 border-dashed ${darkMode ? "border-white/20" : "border-black/20"}` : `${darkMode ? "bg-white/10" : "bg-black/10"}`}`}>
                  {p.isAdd ? <Plus className="w-5 h-5 opacity-40" /> : p.emoji}
                </div>
                <span className={`text-[10px] font-semibold ${muted}`}>{p.label}</span>
                {!p.isAdd && <span className="text-[9px] text-primary font-bold uppercase">{taglish ? "PADALA" : "SEND"}</span>}
              </button>
            ))}
          </div>
          <div className={`absolute right-0 top-0 bottom-0 w-10 pointer-events-none ${darkMode ? "bg-gradient-to-l from-[#0a0f1a]" : "bg-gradient-to-l from-[#f5efe6]"}`} />
        </div>
      </div>

      {/* Offline banner */}
      {offline && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20" role="alert" aria-live="polite">
          <span className="text-yellow-400 text-base">📶</span>
          <p className="text-yellow-400 text-xs font-semibold">Showing cached data — you appear to be offline</p>
        </div>
      )}

      {/* Spending Pulse */}
      {!loading && transfers.length > 0 && (
        <SpendingPulse transfers={transfers} darkMode={darkMode} />
      )}

      {/* Activity Feed */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className={`font-bold text-sm ${textMain}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{taglish ? "Mga Aktibidad" : "Activity"}</h2>
          <button onClick={() => navigate("/dashboard/transactions")} className="text-primary text-[10px] font-bold uppercase tracking-wider hover:opacity-70">VIEW ALL</button>
        </div>

        {/* Recent Transfers */}
        {loading && (
          <div className="mb-4">
            <TransactionSkeleton darkMode={darkMode} count={3} />
          </div>
        )}
        {!loading && transfers.length === 0 && (
          <div className={`border rounded-2xl mb-4 ${darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/5"}`}>
            <EmptyState
              darkMode={darkMode}
              illustration="📬"
              title="No padala yet"
              description="Send your first transfer to see your activity here."
              ctaLabel="Send Now →"
              onCta={() => navigate("/dashboard/pay")}
              size="sm"
            />
          </div>
        )}
        {!loading && transfers.length > 0 && (
          <div className="space-y-2 mb-4">
            {transfers.map((t, i) => (
              <div key={i} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                  {t.recipient_name?.[0] || "?"}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${textMain}`}>
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

        <CommunityStories darkMode={darkMode} taglish={taglish} />

        {/* Family invite */}
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #c97a20, #e8a030)" }}>
          <span className="text-4xl flex-shrink-0">❤️</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-extrabold text-base mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {taglish ? "Isama ang pamilya!" : "Invite your family!"}
            </h3>
            <p className="text-white/70 text-xs">You both earn <span className="font-black text-white">500 pts</span></p>
          </div>
          <button onClick={() => navigate("/dashboard/profile")}
            className="bg-white text-[#c97a20] font-black px-4 py-2 rounded-full text-xs flex-shrink-0 active:scale-95 transition-transform">
            {taglish ? "Imbitahan" : "Invite →"}
          </button>
        </div>
      </div>
      </div>{/* end containerRef */}

      <AnimatePresence>
        {showFundWallet && (
          <FundWalletModal onClose={() => setShowFundWallet(false)} darkMode={darkMode} user={user} />
        )}
      </AnimatePresence>
    </div>
  );
}