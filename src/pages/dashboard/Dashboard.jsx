import { useOutletContext, useNavigate } from "react-router-dom";
import TransactionDetailSheet from "@/components/transactions/TransactionDetailSheet";
import { getUpcomingHoliday } from "@/utils/holidays";
import { TrendingUp, Calendar, Plus, RefreshCw, ArrowDown, ArrowDownToLine } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useLiveRates } from "@/hooks/useLiveRates";
import { AnimatePresence } from "framer-motion";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import OnboardingBanner from "@/components/onboarding/OnboardingBanner";
import CommunityStories from "@/components/dashboard/CommunityStories";
import CelebrationsWidget from "@/components/dashboard/CelebrationsWidget";
import { useCountUp } from "@/hooks/useCountUp";
import { WalletSkeleton, TransactionSkeleton, NetWorthSkeleton } from "@/components/ui/SkeletonLoader";
import EmptyState from "@/components/ui/EmptyState";
import SpendingPulse from "@/components/dashboard/SpendingPulse";
import { fetchWithCache } from "@/utils/offlineCache";
import FundWalletModal from "@/components/wallet/FundWalletModal.jsx";
import ZeroBalanceBanner from "@/components/dashboard/ZeroBalanceBanner";
import PostOnboardingCard from "@/components/dashboard/PostOnboardingCard";
import { usePrivyWallet } from "@/hooks/usePrivyWallet";
import WalletCard from "@/components/dashboard/WalletCard";
import { useYieldAccrual } from "@/hooks/useYieldAccrual";

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
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFundWallet, setShowFundWallet] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [yieldExpanded, setYieldExpanded] = useState(false);
  const { rates, loading: ratesLoading, lastUpdatedLabel } = useLiveRates();
  const { walletAddress, usdcBalance, refetchBalance } = usePrivyWallet();
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
      fetchWithCache("transfers_dash", () => base44.entities.Transfer.list("-created_date", 20)).catch(() => ({ data: [], fromCache: false })),
    ]);
    if (u) {
      setUser(u);
      if (!u.onboarding_completed) setShowOnboarding(true);
    }
    let walletData = walletsResult.data || [];
    // Auto-seed starter wallets if none exist yet
    if (walletData.length === 0 && !walletsResult.fromCache) {
      try {
        await base44.entities.WalletBalance.bulkCreate([
          { currency_code: "USD", currency_name: "US Dollar", flag: "🇺🇸", balance: 0, yield_pct: "4.5%" },
          { currency_code: "PHP", currency_name: "Philippine Peso", flag: "🇵🇭", balance: 0, yield_pct: "2.1%" },
        ]);
        walletData = await base44.entities.WalletBalance.list().catch(() => []);
      } catch {}
    }
    setWallets(walletData);
    const allTransfers = transfersResult.data || [];
    setTransfers(allTransfers.filter(t => t.category !== "yield" && t.category !== "savings").slice(0, 5));
    setOffline(walletsResult.fromCache || transfersResult.fromCache);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time: when a new transfer is created, update balance and activity feed
  useEffect(() => {
    const unsub = base44.entities.Transfer.subscribe((event) => {
      if (event.type === "create") {
        const newTx = event.data;
        if (newTx.category === "yield") return;
        setTransfers(prev => [newTx, ...prev].slice(0, 5));
        // Deduct from USD wallet balance immediately
        setWallets(prev => prev.map(w =>
          w.currency_code === "USD"
            ? { ...w, balance: Math.max(0, (w.balance || 0) - (newTx.amount_usd || 0)) }
            : w
        ));
      } else if (event.type === "update") {
        setTransfers(prev => prev.map(t => t.id === event.id ? event.data : t));
      }
    });
    return unsub;
  }, []);

  const { containerRef, pullY, phase } = usePullToRefresh(fetchData);
  const pulling = phase === "pulling" || phase === "ready";
  const refreshing = phase === "refreshing";

  const usdWallet = wallets.find(w => w.currency_code === "USD");
  const totalUSD = usdWallet?.balance || 0;
  const totalPHP = wallets.find(w => w.currency_code === "PHP")?.balance || 0;
  const { yieldEarned, dailyYield, apyPct } = useYieldAccrual({
    balance: totalUSD,
    walletCreatedDate: usdWallet?.created_date,
    yieldPctStr: usdWallet?.yield_pct,
  });
  const netWorth = totalUSD + yieldEarned + (totalPHP / liveRate);
  const { value: animatedNetWorth, ref: netWorthRef } = useCountUp(netWorth, 1000, 200);
  const primaryAmount = `$ ${(loading ? 0 : animatedNetWorth).toFixed(2)}`;
  const secondaryAmount = `₱ ${totalPHP.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

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
      {/* Celebrations Widget — Philippine cultural milestones */}
      <CelebrationsWidget darkMode={darkMode} taglish={taglish} />

      {/* Dynamic holiday banner */}
      {(() => {
        const holiday = getUpcomingHoliday();
        if (!holiday) return null;
        return (
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${darkMode ? "bg-[#1a2332] border border-white/5" : "bg-[#f0e8d8] border border-[#e8dece]"}`}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg flex-shrink-0">{holiday.emoji}</span>
              <div className="min-w-0">
                <span className={`text-xs font-bold uppercase tracking-wider ${muted}`}>UPCOMING: </span>
                <span className={`text-sm font-semibold ${textMain}`}>{taglish ? holiday.tl : holiday.en}</span>
                <span className={`text-sm ${muted} hidden sm:inline`}> · {holiday.diff === 0 ? "Today!" : holiday.diff === 1 ? "Tomorrow" : `In ${holiday.diff} days`}</span>
              </div>
            </div>
            <Calendar className={`w-4 h-4 ${muted} flex-shrink-0`} />
          </div>
        );
      })()}

      {/* Post-onboarding "3 next steps" card — shown once after KYC complete */}
      {user?.onboarding_completed && (
        <PostOnboardingCard darkMode={darkMode} onFund={() => setShowFundWallet(true)} user={user} />
      )}

      {/* KYC Completion Banner — only if onboarding incomplete */}
      {user && !user.onboarding_completed && (
        <OnboardingBanner
          user={user}
          onOpen={() => setShowOnboarding(true)}
          darkMode={darkMode}
        />
      )}

      {/* Net Worth Card */}
      <div ref={netWorthRef} className="kf-hero-card relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2e00 50%, #8a6a00 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(201,160,80,0.5) 0%, transparent 60%)" }} />
        <div className="relative z-10 px-4 pt-4 pb-5 sm:px-8 sm:pt-8 sm:pb-8">
          <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">{taglish ? "Kabuuang Halaga" : "Total Net Worth"}</p>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl sm:text-5xl font-black text-white mb-0.5 break-all leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ${loading ? "0.00" : animatedNetWorth.toFixed(2)}
              </p>
              <p className="text-white/50 text-xs">{secondaryAmount}</p>
              <p className="text-white/30 text-[10px] mt-0.5">
                {ratesLoading ? "Fetching rate..." : `₱${liveRate.toFixed(2)}/USD · Live${lastUpdatedLabel ? ` · ${lastUpdatedLabel}` : ""}`}
              </p>
              {totalUSD > 0 && yieldEarned > 0 && (
                <p className="text-emerald-400 text-[10px] mt-1 font-semibold">
                  ⚡ +${yieldEarned.toFixed(4)} earned · +${dailyYield.toFixed(4)}/day · {apyPct}% APY
                </p>
              )}
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

      {/* Zero balance nudge */}
      {!loading && totalUSD === 0 && (
        <ZeroBalanceBanner darkMode={darkMode} onFund={() => setShowFundWallet(true)} />
      )}

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
          {loading ? <WalletSkeleton darkMode={darkMode} /> : null}
          {!loading && wallets.length === 0 && (
            <div className="col-span-2 text-center py-6">
              <p className={`text-sm font-semibold mb-1 ${textMain}`}>No wallets yet</p>
              <p className={`text-xs ${muted} mb-3`}>Add funds to create your USD wallet and start sending.</p>
              <button onClick={() => setShowFundWallet(true)} className="bg-primary text-secondary font-bold px-4 py-2 rounded-xl text-xs">Add Funds →</button>
            </div>
          )}
          {!loading && wallets.length > 0 ? wallets.map(w => (
            <WalletCard
              key={w.currency_code}
              w={w}
              usdcBalance={usdcBalance}
              walletAddress={walletAddress}
              liveRate={liveRate}
              taglish={taglish}
            />
          )) : null}
        </div>
      </div>

      {/* Quick Send */}
      <div>
        <h2 className={`font-bold text-sm mb-3 ${textMain}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{taglish ? "Mabilis na Padala" : "Quick Send"}</h2>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-2 pr-8" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {QUICK_SEND.map((p, i) => {
              const avatarColors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-rose-500","bg-amber-500"];
              const avatarColor = avatarColors[i % avatarColors.length];
              return (
                <button key={i} onClick={() => navigate("/dashboard/pay")}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform">
                  <div className={`w-13 h-13 w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-xl shadow-md ${p.isAdd ? `border-2 border-dashed ${darkMode ? "border-white/20" : "border-black/20"}` : `${avatarColor} text-white`}`}>
                    {p.isAdd ? <Plus className="w-5 h-5 opacity-40" /> : p.emoji}
                  </div>
                  <span className={`text-[10px] font-semibold ${muted} max-w-[52px] truncate text-center`}>{p.label}</span>
                  {!p.isAdd && <span className="text-[9px] text-primary font-bold uppercase">{taglish ? "PADALA" : "SEND"}</span>}
                </button>
              );
            })}
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
          <div className={`border rounded-2xl mb-4 px-5 py-6 flex items-center gap-4 ${darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/5"}`}>
            <span className="text-3xl flex-shrink-0">📬</span>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm mb-0.5 ${textMain}`}>No transfers yet</p>
              <p className={`text-xs ${muted}`}>Send money home to your family — zero fees, live rates.</p>
            </div>
            <button onClick={() => navigate("/dashboard/pay")}
              className="bg-primary text-secondary font-bold px-4 py-2 rounded-xl text-xs flex-shrink-0 active:scale-95 transition-transform">
              Send →
            </button>
          </div>
        )}
        {/* Monthly Yield Credit Entry */}
        {!loading && totalUSD > 0 && yieldEarned > 0 && (() => {
          const now = new Date();
          const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          const daysPassed = now.getDate();
          const dailyYieldAmt = dailyYield;
          const monthYield = dailyYieldAmt * daysPassed;
          // Last month's yield
          const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
          const lastMonthYield = dailyYieldAmt * daysInLastMonth;
          const lastMonthLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
          const dailyRows = Array.from({ length: daysPassed }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
            return { date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), amount: dailyYieldAmt };
          }).reverse();
          return (
            <div className={`rounded-2xl border overflow-hidden mb-3 ${darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/5"}`}>
              <button
                onClick={() => setYieldExpanded(e => !e)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-emerald-500/5 ${yieldExpanded ? (darkMode ? "border-b border-white/5" : "border-b border-black/5") : ""}`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-lg flex-shrink-0">⚡</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${textMain}`}>Yield Credit</p>
                  <p className={`text-[10px] font-medium ${muted}`}>{monthLabel} · {apyPct}% APY · {daysPassed} days</p>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-2">
                  <div>
                    <p className="font-bold text-sm text-emerald-400">+${monthYield.toFixed(4)}</p>
                    <p className={`text-[10px] ${muted}`}>+${dailyYieldAmt.toFixed(4)}/day</p>
                  </div>
                  <span className={`text-[10px] font-bold transition-transform inline-block ${yieldExpanded ? "rotate-180" : ""} ${muted}`}>▼</span>
                </div>
              </button>
              {yieldExpanded && (
                <div className="max-h-56 overflow-y-auto">
                  {/* Last month summary row */}
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? "border-white/5 bg-white/3" : "border-black/5 bg-black/3"}`}>
                    <div>
                      <p className={`text-xs font-semibold ${textMain}`}>{lastMonthLabel}</p>
                      <p className={`text-[10px] ${muted}`}>Previous month · {daysInLastMonth} days</p>
                    </div>
                    <p className="text-xs font-bold text-emerald-400">+${lastMonthYield.toFixed(4)}</p>
                  </div>
                  {/* Current month daily rows */}
                  {dailyRows.map((row, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-2.5 border-b last:border-0 ${darkMode ? "border-white/5" : "border-black/5"}`}>
                      <p className={`text-xs ${muted}`}>{row.date}</p>
                      <p className="text-xs font-semibold text-emerald-400">+${row.amount.toFixed(4)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {!loading && transfers.length > 0 && (
          <div className={`rounded-2xl border overflow-hidden mb-4 ${darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/5"}`}>
            {transfers.map((t, i) => {
              const initials = (t.recipient_name || "?").slice(0, 2).toUpperCase();
              const avatarColors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-rose-500","bg-amber-500"];
              const avatarColor = avatarColors[t.recipient_name?.charCodeAt(0) % avatarColors.length] || "bg-primary";
              return (
                <button key={i} onClick={() => setSelectedTx(t)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors border-b last:border-0 hover:bg-primary/5 ${darkMode ? "border-white/5" : "border-black/5"}`}>
                  <div className={`w-10 h-10 rounded-xl ${avatarColor} flex items-center justify-center text-white font-black text-xs flex-shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${textMain}`}>{t.recipient_name}</p>
                    <p className={`text-[10px] font-medium ${muted}`}>
                      {new Date(t.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · via {t.recipient_bank || "Transfer"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-primary">−${t.amount_usd}</p>
                    {t.amount_php && <p className={`text-[10px] ${muted}`}>₱{Number(t.amount_php).toLocaleString("en-PH", { maximumFractionDigits: 0 })}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <CommunityStories darkMode={darkMode} taglish={taglish} />

        {/* Family invite */}
        <div className="kf-hero-card rounded-2xl p-5 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #c97a20, #e8a030)" }}>
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
          <FundWalletModal
            onClose={() => { setShowFundWallet(false); fetchData(); }}
            darkMode={darkMode}
            user={user}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTx && (
          <TransactionDetailSheet
            tx={selectedTx}
            onClose={() => setSelectedTx(null)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}