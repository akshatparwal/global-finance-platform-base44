import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";

import { useOutletContext, useNavigate } from "react-router-dom";
import AddFundsModal from "@/components/savings/AddFundsModal";
import CreateGoalModal from "@/components/savings/CreateGoalModal";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLiveRates } from "@/hooks/useLiveRates";
import RateAlertsPanel from "@/components/dashboard/RateAlertsPanel";
import SpendAnalytics from "@/components/dashboard/SpendAnalytics";
import { GoalSkeleton } from "@/components/ui/SkeletonLoader";
import KatuwangWallet from "@/components/dashboard/KatuwangWallet";
import EmptyState from "@/components/ui/EmptyState";
import YieldCard from "@/components/dashboard/YieldCard";
import { usePrivyWallet } from "@/hooks/usePrivyWallet";

const OUTBOUND_CATEGORIES = ["remittance", "bills", "subscriptions", "savings", "other"];

// Build last-6-months spending chart from real transfers
function buildMonthlySpendData(transfers) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.toLocaleDateString("en-US", { month: "short" }),
      year: d.getFullYear(),
      monthIdx: d.getMonth(),
      spending: 0,
    });
  }
  transfers
    .filter(t => OUTBOUND_CATEGORIES.includes(t.category))
    .forEach(t => {
      const d = new Date(t.created_date);
      const entry = months.find(m => m.monthIdx === d.getMonth() && m.year === d.getFullYear());
      if (entry) entry.spending += t.amount_usd || 0;
    });
  return months.map(({ month, spending }) => ({ month, spending: parseFloat(spending.toFixed(2)) }));
}

const TABS = ["Activity", "Goals", "Analytics"];

export default function Insights() {
  const { darkMode } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState("Activity");
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [addFundsGoal, setAddFundsGoal] = useState(null);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const { rates, loading: ratesLoading } = useLiveRates();
  const liveRate = rates?.USDPHP || 56.24;
  const { usdcBalance } = usePrivyWallet();
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";

  const navigate = useNavigate();
  const lastFetchedAt = useRef(0);
  const STALE_MS = 60_000; // re-fetch if data is older than 60 seconds

  const fetchAll = useCallback(async () => {
    setActivityLoading(true);
    setGoalsLoading(true);
    await Promise.all([
      base44.entities.SavingsGoal.list()
        .then(g => { setGoals(g); setGoalsLoading(false); })
        .catch(() => setGoalsLoading(false)),
      base44.entities.WalletBalance.list().then(setWallets).catch(() => {}),
      base44.entities.Transfer.list("-created_date", 100)
        .then(t => { setTransfers(t); setActivityLoading(false); })
        .catch(() => setActivityLoading(false)),
    ]);
    lastFetchedAt.current = Date.now();
  }, []);

  useEffect(() => {
    // Re-fetch if stale (>60s) — catches transfers made in other tabs/windows
    if (Date.now() - lastFetchedAt.current > STALE_MS) {
      fetchAll();
    }
  });

  const handleGoalUpdated = (updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleCreateGoal = () => setShowCreateGoal(true);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-lg font-extrabold sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Insights & Wealth</h1>
        <p className={`text-xs ${muted}`}>Budgets, spending intelligence & wealth building</p>
      </div>

      {/* Tab bar */}
      <div className={`flex gap-1 p-1 rounded-xl mb-4 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${activeTab === t ? "bg-primary text-secondary" : `${darkMode ? "text-white/50 hover:text-white" : "text-[#1a2a4a]/60 hover:text-[#1a2a4a]"}`}`}>
            {t === "Activity" && "⚡"}{t === "Goals" && "◎"}{t === "Analytics" && "↗"}{t === "Markets" && "📊"}{" "}{t}
          </button>
        ))}
      </div>

      {activeTab === "Activity" && activityLoading && (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className={`border rounded-2xl p-6 animate-pulse ${card}`}>
              <div className={`h-4 w-32 rounded-lg mb-3 ${darkMode ? "bg-white/10" : "bg-black/10"}`} />
              <div className={`h-10 w-48 rounded-lg mb-4 ${darkMode ? "bg-white/8" : "bg-black/8"}`} />
              <div className={`h-2 w-full rounded-full ${darkMode ? "bg-white/5" : "bg-black/5"}`} />
            </div>
          ))}
        </div>
      )}
      {activeTab === "Activity" && !activityLoading && (() => {
        const now = new Date();
        const thisMonth = transfers.filter(t => {
          const d = new Date(t.created_date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            && OUTBOUND_CATEGORIES.includes(t.category);
        });
        const monthTotal = thisMonth.reduce((s, t) => s + (t.amount_usd || 0), 0);
        const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
        const remittanceTotal = thisMonth.filter(t => !t.category || t.category === "remittance").reduce((s,t) => s+(t.amount_usd||0),0);
        const billsTotal = thisMonth.filter(t => t.category === "bills").reduce((s,t) => s+(t.amount_usd||0),0);
        const savingsTotal = thisMonth.filter(t => t.category === "savings").reduce((s,t) => s+(t.amount_usd||0),0);
        const otherTotal = thisMonth.filter(t => t.category === "other" || t.category === "subscriptions").reduce((s,t) => s+(t.amount_usd||0),0);

        // Budget caps derived from all-time averages (or sensible defaults relative to actuals)
        const allTimeMonths = Math.max(1, (() => {
          const months = new Set(transfers.map(t => { const d = new Date(t.created_date); return `${d.getFullYear()}-${d.getMonth()}`; }));
          return months.size;
        })());
        const allRemittance = transfers.filter(t => t.category === "remittance").reduce((s,t) => s+(t.amount_usd||0),0);
        const dynamicBudget = Math.max(Math.round((allRemittance / allTimeMonths) * 1.25 / 50) * 50, 200);
        const MONTHLY_BUDGET = dynamicBudget + 300 + 500 + 200;
        const pctUsed = Math.min(Math.round((monthTotal / MONTHLY_BUDGET) * 100), 100);
        const remaining = Math.max(MONTHLY_BUDGET - monthTotal, 0);

        const BUDGETS_REAL = [
          { icon: "❤️", label: "Remittances",      spent: remittanceTotal, total: dynamicBudget, color: "bg-primary" },
          { icon: "⚡", label: "Bills & Utilities", spent: billsTotal,      total: 300,           color: "bg-emerald-500" },
          { icon: "📦", label: "Savings Goals",     spent: savingsTotal,    total: 500,           color: "bg-blue-500" },
          { icon: "📈", label: "Other",              spent: otherTotal,      total: 200,           color: "bg-purple-500" },
        ];

        return (
        <div className="space-y-6">
          <div className={`border rounded-2xl p-6 ${card}`}>
            <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Monthly Spending</p>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-4xl font-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>${monthTotal.toFixed(2)}</p>
                <p className={`text-sm ${muted}`}>of ${MONTHLY_BUDGET.toLocaleString()} monthly budget</p>
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-primary flex items-center justify-center font-black text-primary">{pctUsed}%</div>
            </div>
            <div className={`w-full h-2 rounded-full ${darkMode ? "bg-white/10" : "bg-black/10"} mb-2`}>
              <div className="h-full bg-primary rounded-full" style={{ width: `${pctUsed}%` }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className={muted}>${remaining.toFixed(2)} remaining this period</span>
              <span className={muted}>{monthLabel}</span>
            </div>
          </div>

          {(() => {
            const monthlyData = buildMonthlySpendData(transfers);
            const hasData = monthlyData.some(m => m.spending > 0);
            return (
              <div className={`border rounded-2xl p-6 ${card}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="font-bold">Monthly Spending Trend</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary border border-primary/30 px-2 py-1 rounded-lg">
                    <Calendar className="w-3 h-3" /> LAST 6 MONTHS
                  </div>
                </div>
                {hasData ? (
                  <div className="overflow-hidden">
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={monthlyData}>
                        <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: darkMode ? "rgba(255,255,255,0.4)" : "rgba(26,42,74,0.5)" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#1a2332", border: "none", borderRadius: 8, color: "white" }} formatter={v => [`$${v.toFixed(2)}`, "Spent"]} />
                        <Area type="monotone" dataKey="spending" stroke="hsl(var(--primary))" fill="url(#rg)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[120px]">
                    <p className={`text-sm ${muted}`}>No spending data yet — send your first transfer to see trends.</p>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="space-y-3">
            {BUDGETS_REAL.map((b, i) => {
              const pct = b.total > 0 ? Math.min(Math.round((b.spent / b.total) * 100), 100) : 0;
              return (
                <div key={i} className={`border rounded-xl p-4 ${card}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2"><span>{b.icon}</span><span className="font-semibold text-sm">{b.label}</span></div>
                    <span className="font-bold text-sm">${b.spent.toFixed(2)} <span className={`${muted} font-normal`}>/ ${b.total}</span></span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? "bg-white/10" : "bg-black/10"} mb-1`}>
                    <div className={`h-full ${b.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={muted}>${Math.max(b.total - b.spent, 0).toFixed(2)} left to spend</span>
                    <span className="text-primary font-bold">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Smart observation — replaces placeholder AI section */}
          {(() => {
            const now = new Date();
            const thisMonthTransfers = transfers.filter(t => {
              const d = new Date(t.created_date);
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && OUTBOUND_CATEGORIES.includes(t.category);
            });
            const lastMonthTransfers = transfers.filter(t => {
              const d = new Date(t.created_date);
              const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
              const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
              return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear && OUTBOUND_CATEGORIES.includes(t.category);
            });
            const thisTotal = thisMonthTransfers.reduce((s, t) => s + (t.amount_usd || 0), 0);
            const lastTotal = lastMonthTransfers.reduce((s, t) => s + (t.amount_usd || 0), 0);
            if (thisTotal === 0 && lastTotal === 0) return null;
            const diff = lastTotal > 0 ? Math.round(((thisTotal - lastTotal) / lastTotal) * 100) : null;
            const monthName = now.toLocaleDateString("en-US", { month: "long" });
            const lastMonthName = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString("en-US", { month: "long" });
            return (
              <div className={`border rounded-xl p-4 flex items-start gap-3 ${card}`}>
                <span className="text-lg flex-shrink-0 mt-0.5">{diff === null ? "📊" : diff <= -10 ? "📉" : diff >= 10 ? "📈" : "✦"}</span>
                <div>
                  <p className="font-bold text-sm mb-0.5">Spending Snapshot</p>
                  <p className={`text-xs ${muted} leading-relaxed`}>
                    {diff === null
                      ? `You've sent $${thisTotal.toFixed(2)} in ${monthName} so far.`
                      : diff < 0
                        ? `You sent ${Math.abs(diff)}% less this month vs ${lastMonthName} ($${thisTotal.toFixed(2)} vs $${lastTotal.toFixed(2)}).`
                        : diff > 0
                          ? `You sent ${diff}% more this month vs ${lastMonthName} ($${thisTotal.toFixed(2)} vs $${lastTotal.toFixed(2)}).`
                          : `Spending is consistent with ${lastMonthName} at $${thisTotal.toFixed(2)}.`
                    }
                  </p>
                </div>
              </div>
            );
          })()}
          <RateAlertsPanel darkMode={darkMode} currentRate={liveRate} />
        </div>
        );
      })()}

      <AnimatePresence>
        {addFundsGoal && (
          <AddFundsModal
            goal={addFundsGoal}
            onClose={() => setAddFundsGoal(null)}
            onUpdated={handleGoalUpdated}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCreateGoal && (
          <CreateGoalModal
            darkMode={darkMode}
            onClose={() => setShowCreateGoal(false)}
            onCreated={(newGoal) => setGoals(prev => [...prev, newGoal])}
          />
        )}
      </AnimatePresence>

      {activeTab === "Goals" && (
        <div className="space-y-6">
          {(() => {
            const remittanceTransfers = transfers.filter(t => t.category === "remittance");
            const totalPhpSent = remittanceTransfers.reduce((s, t) => s + (t.amount_php || (t.amount_usd || 0) * liveRate), 0);
            const uniqueRecipients = [...new Set(remittanceTransfers.map(t => t.recipient_name).filter(Boolean))];
            const transferCount = remittanceTransfers.length;
            return (
              <div className={`border rounded-2xl p-6 ${card}`}>
                <div className="flex items-center gap-2 mb-4"><span>👨‍👩‍👧</span><h3 className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Family Financial Health</h3></div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                  {[
                    { label: "Total PH Support", val: totalPhpSent > 0 ? `₱${Math.round(totalPhpSent).toLocaleString("en-PH")}` : "₱0" },
                    { label: "Recipients", val: `${uniqueRecipients.length}` },
                    { label: "Total Transfers", val: `${transferCount}` },
                  ].map((s, i) => (
                    <div key={i}><p className={`text-[10px] sm:text-xs ${muted} mb-1`}>{s.label}</p><p className={`font-black text-base sm:text-lg ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</p></div>
                  ))}
                </div>
                {uniqueRecipients.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-sm">Recipients</h4>
                      <span className="text-primary text-xs font-bold">{uniqueRecipients.length} CONNECTED</span>
                    </div>
                    {uniqueRecipients.slice(0, 3).map((name, i) => {
                      const recTx = remittanceTransfers.filter(t => t.recipient_name === name);
                      const recTotal = recTx.reduce((s, t) => s + (t.amount_php || (t.amount_usd || 0) * 56.24), 0);
                      const last = recTx[0];
                      return (
                        <div key={i} className={`flex items-center gap-3 py-3 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">{name[0]}</div>
                          <div className="flex-1"><p className={`font-semibold text-sm ${text}`}>{name}</p><p className={`text-xs ${muted}`}>{recTx.length} transfer{recTx.length !== 1 ? "s" : ""}</p></div>
                          <div className="text-right"><p className={`font-bold text-sm ${text}`}>₱{Math.round(recTotal).toLocaleString("en-PH")}</p><p className={`text-xs ${muted}`}>{last ? new Date(last.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</p></div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className={`text-sm text-center py-4 ${muted}`}>Send your first transfer to see family data here.</p>
                )}
              </div>
            );
          })()}

          {goals.length > 0 && (() => {
            const topGoal = goals.reduce((best, g) => {
              const pct = g.target_amount > 0 ? (g.current_amount || 0) / g.target_amount : 0;
              const bestPct = best.target_amount > 0 ? (best.current_amount || 0) / best.target_amount : 0;
              return pct > bestPct ? g : best;
            }, goals[0]);
            const pct = topGoal.target_amount > 0 ? Math.min(Math.round(((topGoal.current_amount || 0) / topGoal.target_amount) * 100), 100) : 0;
            return (
              <div className={`border rounded-2xl p-6 ${darkMode ? "bg-[#0d1526] border-white/10" : "bg-white border-black/10"}`}>
                <p className="text-primary/80 text-xs uppercase tracking-wider mb-1">🌟 Featured Goal</p>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{topGoal.emoji}</span>
                  <div>
                    <h3 className={`font-extrabold text-lg ${darkMode ? "text-white" : "text-[#1a2a4a]"}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{topGoal.label}</h3>
                    {topGoal.description && <p className={`text-sm ${muted}`}>{topGoal.description}</p>}
                  </div>
                </div>
                <p className={`text-xs uppercase tracking-wider mb-1 ${muted}`}>Progress</p>
                <div className={`w-full h-2 rounded-full mb-3 ${darkMode ? "bg-white/10" : "bg-black/10"}`}><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>
                <div className={`flex justify-between text-xs mb-4 ${muted}`}><span>${(topGoal.current_amount || 0).toLocaleString()} / ${topGoal.target_amount.toLocaleString()}</span><span>{pct}%</span></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-xl p-3 ${darkMode ? "bg-white/5" : "bg-black/5"}`}><p className={`text-xs mb-1 ${muted}`}>Remaining</p><p className={`font-bold ${text}`}>${Math.max(topGoal.target_amount - (topGoal.current_amount || 0), 0).toLocaleString()}</p></div>
                  <div className={`rounded-xl p-3 ${darkMode ? "bg-white/5" : "bg-black/5"}`}><p className={`text-xs mb-1 ${muted}`}>Auto-Save</p><p className="text-primary font-bold">{topGoal.auto_save_enabled ? `$${topGoal.auto_save_amount}/${topGoal.auto_save_frequency}` : "Off"}</p></div>
                </div>
              </div>
            );
          })()}

          {/* Katuwang Wallet — Shared Family Savings Pod */}
          <KatuwangWallet darkMode={darkMode} onContribute={() => setShowCreateGoal(true)} />

          {/* Live yield card — driven by on-chain USDC balance */}
          <YieldCard
            balance={usdcBalance !== null ? usdcBalance : (wallets.find(w => w.currency_code === "USD")?.balance || 0)}
            walletCreatedDate={wallets.find(w => w.currency_code === "USD")?.created_date || null}
            yieldPctStr={wallets.find(w => w.currency_code === "USD")?.yield_pct || "4.5%"}
            darkMode={darkMode}
          />

          <div className="flex justify-between items-center"><h3 className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Savings Goals</h3><button onClick={handleCreateGoal} className="text-primary text-sm font-bold hover:underline">+ Create Goal</button></div>
          {goalsLoading ? (
            <GoalSkeleton darkMode={darkMode} count={3} />
          ) : goals.length === 0 ? (
            <div className={`border rounded-2xl ${card}`}>
              <EmptyState
                darkMode={darkMode}
                illustration="🎯"
                title="No savings goals yet"
                description="Create your first goal — a dream home, tuition fund, or emergency savings."
                ctaLabel="+ Create Goal"
                onCta={handleCreateGoal}
                size="md"
              />
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-3">
            {goals.map((g,i) => {
              const pct = g.target_amount > 0 ? Math.min(Math.round(((g.current_amount || 0) / g.target_amount) * 100), 100) : 0;
              const remaining = Math.max((g.target_amount || 0) - (g.current_amount || 0), 0);
              const isComplete = pct >= 100;
              return (
              <div key={g.id || i} className={`border rounded-xl p-4 ${card}`}>
                {/* Header row */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm truncate">{g.label}</h4>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {g.auto_save_enabled && <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">⚡ AUTO</span>}
                        {g.round_up_enabled && <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">↑ ROUND-UP</span>}
                        {isComplete && <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-full">🎉 DONE</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-0.5">
                      <span className={muted}>${(g.current_amount || 0).toLocaleString()} <span className={muted}>of ${g.target_amount.toLocaleString()}</span></span>
                      <span className={`font-black text-sm ${isComplete ? "text-yellow-500" : "text-primary"}`}>{pct}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className={`w-full h-2.5 rounded-full mb-2 ${darkMode ? "bg-white/10" : "bg-black/10"}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-yellow-500" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${muted}`}>
                    {isComplete ? "Goal reached! 🎉" : `$${remaining.toLocaleString()} to go`}
                  </p>
                  <button
                    onClick={() => setAddFundsGoal(g)}
                    className="bg-primary text-secondary text-xs font-black px-3 py-1.5 rounded-xl active:scale-95 transition-transform hover:opacity-90"
                  >
                    + Add
                  </button>
                </div>
              </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {activeTab === "Analytics" && (
        <SpendAnalytics transfers={transfers} darkMode={darkMode} />
      )}


    </div>
  );
}