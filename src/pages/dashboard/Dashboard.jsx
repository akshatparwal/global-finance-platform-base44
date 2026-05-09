import { useOutletContext, useNavigate } from "react-router-dom";
import TransactionDetailSheet from "@/components/transactions/TransactionDetailSheet";
import { getUpcomingHoliday } from "@/utils/holidays";
import { TrendingUp, Calendar, Plus, RefreshCw, ArrowDown, ArrowDownToLine, Send } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useLiveRates } from "@/hooks/useLiveRates";
import { AnimatePresence } from "framer-motion";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import OnboardingBanner from "@/components/onboarding/OnboardingBanner";
import CelebrationsWidget from "@/components/dashboard/CelebrationsWidget";
import { WalletSkeleton, TransactionSkeleton } from "@/components/ui/SkeletonLoader";
import { fetchWithCache } from "@/utils/offlineCache";
import FundWalletModal from "@/components/wallet/FundWalletModal.jsx";
import ZeroBalanceBanner from "@/components/dashboard/ZeroBalanceBanner";
import { usePrivyWallet } from "@/hooks/usePrivyWallet";
import WalletCard from "@/components/dashboard/WalletCard";
import { useYieldAccrual } from "@/hooks/useYieldAccrual";


export default function Dashboard() {
  const { darkMode } = useOutletContext() || {};
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFundWallet, setShowFundWallet] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [yieldExpanded, setYieldExpanded] = useState(false);
  const [walletSlide, setWalletSlide] = useState(0);
  const sliderRef = useRef(null);
  const touchStartX = useRef(null);
  const { rates, loading: ratesLoading, lastUpdatedLabel } = useLiveRates();
  const { walletAddress, usdcBalance, refetchBalance } = usePrivyWallet();
  const liveRate = rates?.USDPHP || 56.24;
  const card = "kf-glass rounded-2xl";
  const muted = "text-[#0D1F3C]/40";
  const textMain = "text-[#0D1F3C]";

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
    let walletData = (walletsResult.data || []).filter(w => w.currency_code === "USD" || w.currency_code === "PHP");
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
    const EXCLUDED = ["yield", "deposit", "savings"];
    const allTransfers = transfersResult.data || [];
    setTransfers(allTransfers.filter(t => !EXCLUDED.includes(t.category) && t.recipient_name !== "Deposit").slice(0, 5));
    setOffline(walletsResult.fromCache || transfersResult.fromCache);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time: when a new transfer is created, update balance and activity feed
  useEffect(() => {
    const unsub = base44.entities.Transfer.subscribe((event) => {
      if (event.type === "create") {
        const newTx = event.data;
        const EXCLUDED = ["yield", "deposit", "savings"];
        if (EXCLUDED.includes(newTx.category)) return;
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
  const { yieldEarned, dailyYield, apyPct, projectedBalance } = useYieldAccrual({
    balance: totalUSD,
    walletCreatedDate: usdWallet?.created_date,
    yieldPctStr: usdWallet?.yield_pct,
  });


  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  // Derive a friendly first name: prefer legal_name, then full_name, skip if it looks like an email username
  const friendlyName = (() => {
    const src = user?.legal_name || user?.full_name || "";
    if (!src) return "OFW";
    // If it contains no spaces and looks like an email username (no uppercase, has digits), skip it
    const hasSpace = src.includes(" ");
    const looksLikeUsername = !hasSpace && /[0-9]/.test(src) && src === src.toLowerCase();
    if (looksLikeUsername) return "OFW";
    return src.split(" ")[0];
  })();

  const [recipients, setRecipients] = useState([]);
  useEffect(() => {
    base44.entities.Recipient.list("-transfer_count", 5).then(setRecipients).catch(() => {});
  }, []);

  const QUICK_SEND = [
    ...recipients.map(r => ({ emoji: r.emoji || "👤", label: r.nickname || r.full_name, id: r.id })),
    { emoji: "+", label: "New Send", isAdd: true },
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${phase === "ready" ? "bg-primary text-white" : "bg-primary/10 text-primary"} transition-colors`}
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
      <CelebrationsWidget darkMode={darkMode} />

      {/* Dynamic holiday banner */}
      {(() => {
        const holiday = getUpcomingHoliday();
        if (!holiday) return null;
        return (
        <div className="kf-glass flex items-center justify-between px-4 py-3 rounded-xl">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-base flex-shrink-0">{holiday.emoji}</span>
            <div className="min-w-0">
              <span className="text-white/70 text-sm">{holiday.en}</span>
              <span className="text-white/30 text-xs ml-2 hidden sm:inline">{holiday.diff === 0 ? "Today" : holiday.diff === 1 ? "Tomorrow" : `In ${holiday.diff} days`}</span>
            </div>
          </div>
          <Calendar className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
        </div>
        );
      })()}

      {/* KYC Completion Banner — only if onboarding incomplete */}
      {user && !user.onboarding_completed && (
        <OnboardingBanner
          user={user}
          onOpen={() => setShowOnboarding(true)}
          darkMode={darkMode}
        />
      )}

      {/* Greeting */}
      {/* Greeting header — matches design spec */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[#0D1F3C]/35 text-[10px] font-bold uppercase tracking-widest mb-0.5">
            {(() => {
              const h = new Date().getHours();
              return h < 12 ? "Magandang Umaga" : h < 18 ? "Magandang Hapon" : "Magandang Gabi";
            })()}
          </p>
          <p className="text-[#0D1F3C] text-2xl font-black leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {user === null ? "..." : friendlyName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!ratesLoading && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[#0D1F3C]/30 text-[10px]">₱{liveRate.toFixed(2)}/USD</p>
            </div>
          )}
          {/* User initials avatar */}
          <div className="w-9 h-9 rounded-full bg-[#0D1F3C] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">
              {user ? (user.full_name || user.email || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Slider */}
      {loading ? (
        <WalletSkeleton darkMode={darkMode} />
      ) : wallets.length === 0 ? (
      <div className="kf-glass rounded-2xl p-8 text-center">
        <p className="text-[#0D1F3C]/60 text-sm mb-1">No wallets yet</p>
        <p className="text-[#0D1F3C]/30 text-xs mb-3">Add funds to get started.</p>
        <button onClick={() => setShowFundWallet(true)} className="bg-primary text-white font-medium px-4 py-2 rounded-xl text-xs">Add Funds</button>
      </div>
      ) : (
        <div>
          {/* Mobile: swipeable slider — Desktop: show both side by side */}
          <div
            ref={sliderRef}
            className="sm:hidden overflow-hidden rounded-2xl"
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(dx) > 40) setWalletSlide(dx < 0 ? Math.min(walletSlide + 1, wallets.length - 1) : Math.max(walletSlide - 1, 0));
              touchStartX.current = null;
            }}
          >
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${walletSlide * 100}%)` }}
            >
              {wallets.map(w => (
                <div key={w.currency_code} className="w-full flex-shrink-0">
                  <WalletCard w={w} usdcBalance={usdcBalance} walletAddress={walletAddress} liveRate={liveRate} />
                </div>
              ))}
            </div>
          </div>
          {/* Dot indicators — mobile only */}
          {wallets.length > 1 && (
            <div className="sm:hidden flex justify-center gap-1.5 mt-2">
              {wallets.map((_, i) => (
                <button key={i} onClick={() => setWalletSlide(i)}
                  className={`h-1 rounded-full transition-all ${i === walletSlide ? "bg-primary w-6" : "bg-[#0D1F3C]/15 w-1.5"}`} />
              ))}
            </div>
          )}
          {/* Desktop: side by side */}
          <div className="hidden sm:grid grid-cols-2 gap-3">
            {wallets.map(w => (
              <WalletCard key={w.currency_code} w={w} usdcBalance={usdcBalance} walletAddress={walletAddress} liveRate={liveRate} />
            ))}
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowFundWallet(true)}
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all bg-primary text-white"
        >
          <ArrowDownToLine className="w-4 h-4" />
          Add money
        </button>
        <button
          onClick={() => navigate("/dashboard/pay")}
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all bg-[#0D1F3C] text-white"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>

      {/* Zero balance nudge */}
      {!loading && totalUSD === 0 && (
        <ZeroBalanceBanner darkMode={darkMode} onFund={() => setShowFundWallet(true)} />
      )}

      {/* Card + Save quick stats — matches design spec */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/dashboard/cards")}
            className="kf-glass rounded-2xl p-4 text-left hover:shadow-md transition-shadow active:scale-[0.98]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0D1F3C]/40 uppercase tracking-wider">CARD</span>
              <span className="text-primary">💳</span>
            </div>
            <p className="text-xl font-black text-[#0D1F3C]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$0.00</p>
            <p className="text-[10px] text-[#0D1F3C]/35 mt-0.5">Spent this month</p>
          </button>
          <button onClick={() => navigate("/dashboard/insights")}
            className="kf-glass rounded-2xl p-4 text-left hover:shadow-md transition-shadow active:scale-[0.98]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0D1F3C]/40 uppercase tracking-wider">SAVE · 5%</span>
              <span className="text-emerald-500">⚡</span>
            </div>
            <p className="text-xl font-black text-[#0D1F3C]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ${totalUSD > 0 ? (totalUSD * 0.05 / 12).toFixed(2) : "0.00"}
            </p>
            <p className="text-[10px] text-[#0D1F3C]/35 mt-0.5">Tap Save tab to earn</p>
          </button>
        </div>
      )}

      {/* Quick Send */}
      <div>
        <p className="kf-label mb-3">People you send to</p>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-2 pr-8" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {QUICK_SEND.map((p, i) => (
              <button key={i} onClick={() => navigate("/dashboard/pay")}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform">
                <div
                  className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-base font-bold"
                  style={p.isAdd
                    ? { background: "rgba(13,31,60,0.06)", border: "1px dashed rgba(13,31,60,0.2)" }
                    : { background: "#E8512A20", border: "1px solid #E8512A30", color: "#E8512A" }}
                >
                  {p.isAdd ? <Plus className="w-4 h-4 text-[#0D1F3C]/30" /> : <span className="text-sm">{(p.label || "?").slice(0,2).toUpperCase()}</span>}
                </div>
                <span className="text-[#0D1F3C]/40 text-[10px] max-w-[52px] truncate text-center">{p.label}</span>
              </button>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none bg-gradient-to-l from-[#FAF8F5]" />
        </div>
      </div>

      {/* Offline banner */}
      {offline && (
        <div className="kf-glass flex items-center gap-2 px-4 py-2.5 rounded-xl" role="alert" aria-live="polite">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <p className="text-[#0D1F3C]/50 text-xs">Showing cached data — offline</p>
        </div>
      )}

      {/* Activity Feed */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="kf-label">Recent activity</p>
          <button onClick={() => navigate("/dashboard/transactions")} className="text-primary text-[11px] font-semibold hover:opacity-70">View all</button>
        </div>

        {/* Recent Transfers */}
        {loading && (
          <div className="mb-4">
            <TransactionSkeleton darkMode={darkMode} count={3} />
          </div>
        )}
        {!loading && transfers.length === 0 && (
          <div className="kf-glass rounded-2xl mb-4 px-5 py-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
              <Send className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#0D1F3C]/80 text-sm font-medium mb-0.5">No transfers yet — when you send your first one, it'll show up here.</p>
            </div>
          </div>
        )}
        {/* Monthly Yield Credit Entry */}
        {!loading && totalUSD > 0 && yieldEarned > 0 && (() => {
          const now = new Date();
          const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          const daysPassed = now.getDate();
          const dailyYieldAmt = dailyYield;
          const monthYield = dailyYieldAmt * daysPassed;
          return (
          <div className="kf-glass rounded-2xl overflow-hidden mb-3">
            <button
              onClick={() => setYieldExpanded(e => !e)}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-[#0D1F3C]/3"
              style={{ borderBottom: yieldExpanded ? "1px solid rgba(13,31,60,0.06)" : "none" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-500/10">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#0D1F3C]/80 text-sm font-medium">Save · {apyPct}%</p>
                <p className="text-[#0D1F3C]/35 text-[10px]">{monthLabel}</p>
              </div>
              <div className="text-right flex-shrink-0 flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium text-emerald-600">+${monthYield.toFixed(4)}</p>
                  <p className="text-[#0D1F3C]/25 text-[10px]">+${dailyYieldAmt.toFixed(4)}/day</p>
                </div>
                <span className={`text-[#0D1F3C]/20 text-[10px] transition-transform inline-block ${yieldExpanded ? "rotate-180" : ""}`}>▼</span>
              </div>
            </button>
          </div>
          );
        })()}

        {!loading && transfers.length > 0 && (
          <div className="kf-glass rounded-2xl overflow-hidden mb-4">
            {transfers.map((t, i) => {
              const initials = (t.recipient_name || "?").slice(0, 2).toUpperCase();
              return (
                <button key={i} onClick={() => setSelectedTx(t)}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors border-b last:border-0 hover:bg-[#0D1F3C]/3"
                  style={{ borderColor: "rgba(13,31,60,0.06)" }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0"
                    style={{ background: "#E8512A15", border: "1px solid #E8512A20" }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0D1F3C]/85 text-sm font-medium">{t.recipient_name}</p>
                    <p className="text-[#0D1F3C]/35 text-[10px]">
                      {new Date(t.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {t.recipient_bank || "Transfer"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-primary">−${t.amount_usd}</p>
                    {t.amount_php && <p className="text-[#0D1F3C]/30 text-[10px]">₱{Number(t.amount_php).toLocaleString("en-PH", { maximumFractionDigits: 0 })}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}


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