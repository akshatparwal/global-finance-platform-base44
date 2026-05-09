import { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLiveRates } from "@/hooks/useLiveRates";
import RateAlertsPanel from "@/components/dashboard/RateAlertsPanel";
import SpendAnalytics from "@/components/dashboard/SpendAnalytics";

const OUTBOUND_CATEGORIES = ["remittance", "bills", "subscriptions", "savings", "other"];

function buildMonthlySpendData(transfers) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: d.toLocaleDateString("en-US", { month: "short" }), year: d.getFullYear(), monthIdx: d.getMonth(), spending: 0 });
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

export default function Insights() {
  const { darkMode } = useOutletContext() || {};
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { rates } = useLiveRates();
  const liveRate = rates?.USDPHP || 56.24;
  const lastFetchedAt = useRef(0);
  const STALE_MS = 60_000;

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await base44.entities.Transfer.list("-created_date", 100)
      .then(t => { setTransfers(t); setLoading(false); })
      .catch(() => setLoading(false));
    lastFetchedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (Date.now() - lastFetchedAt.current > STALE_MS) fetchAll();
  });

  const now = new Date();
  const thisMonth = transfers.filter(t => {
    const d = new Date(t.created_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && OUTBOUND_CATEGORIES.includes(t.category);
  });
  const monthTotal = thisMonth.reduce((s, t) => s + (t.amount_usd || 0), 0);
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
  const remittanceTotal = thisMonth.filter(t => !t.category || t.category === "remittance").reduce((s, t) => s + (t.amount_usd || 0), 0);
  const billsTotal = thisMonth.filter(t => t.category === "bills").reduce((s, t) => s + (t.amount_usd || 0), 0);
  const savingsTotal = thisMonth.filter(t => t.category === "savings").reduce((s, t) => s + (t.amount_usd || 0), 0);
  const otherTotal = thisMonth.filter(t => t.category === "other" || t.category === "subscriptions").reduce((s, t) => s + (t.amount_usd || 0), 0);

  const allTimeMonths = Math.max(1, (() => {
    const months = new Set(transfers.map(t => { const d = new Date(t.created_date); return `${d.getFullYear()}-${d.getMonth()}`; }));
    return months.size;
  })());
  const allRemittance = transfers.filter(t => t.category === "remittance").reduce((s, t) => s + (t.amount_usd || 0), 0);
  const dynamicBudget = Math.max(Math.round((allRemittance / allTimeMonths) * 1.25 / 50) * 50, 200);
  const MONTHLY_BUDGET = dynamicBudget + 300 + 500 + 200;
  const pctUsed = Math.min(Math.round((monthTotal / MONTHLY_BUDGET) * 100), 100);
  const remaining = Math.max(MONTHLY_BUDGET - monthTotal, 0);

  const BUDGETS_REAL = [
    { icon: "❤️", label: "Remittances",       spent: remittanceTotal, total: dynamicBudget, color: "bg-primary" },
    { icon: "⚡", label: "Bills & Utilities",  spent: billsTotal,      total: 300,           color: "bg-emerald-500" },
    { icon: "📦", label: "Savings Goals",      spent: savingsTotal,    total: 500,           color: "bg-blue-500" },
    { icon: "📈", label: "Other",               spent: otherTotal,      total: 200,           color: "bg-purple-500" },
  ];

  const monthlyData = buildMonthlySpendData(transfers);
  const hasChartData = monthlyData.some(m => m.spending > 0);

  // Spending snapshot comparison
  const lastMonthTransfers = transfers.filter(t => {
    const d = new Date(t.created_date);
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear && OUTBOUND_CATEGORIES.includes(t.category);
  });
  const lastTotal = lastMonthTransfers.reduce((s, t) => s + (t.amount_usd || 0), 0);
  const diff = lastTotal > 0 ? Math.round(((monthTotal - lastTotal) / lastTotal) * 100) : null;
  const lastMonthName = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString("en-US", { month: "long" });
  const monthName = now.toLocaleDateString("en-US", { month: "long" });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="mb-4">
          <h1 className="text-lg font-extrabold sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Save & Insights</h1>
          <p className={`text-xs ${muted}`}>Earn 5% APY · spending intelligence & rate alerts</p>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className={`border rounded-2xl p-6 animate-pulse ${card}`}>
            <div className={`h-4 w-32 rounded-lg mb-3 ${darkMode ? "bg-white/10" : "bg-black/10"}`} />
            <div className={`h-10 w-48 rounded-lg mb-4 ${darkMode ? "bg-white/8" : "bg-black/8"}`} />
            <div className={`h-2 w-full rounded-full ${darkMode ? "bg-white/5" : "bg-black/5"}`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-lg font-extrabold sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Save & Insights</h1>
        <p className={`text-xs ${muted}`}>Earn 5% APY · spending intelligence & rate alerts</p>
      </div>

      {/* Monthly Budget Overview */}
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

      {/* Spending Trend Chart */}
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
        {hasChartData ? (
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={monthlyData}>
              <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: darkMode ? "rgba(255,255,255,0.4)" : "rgba(26,42,74,0.5)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a2332", border: "none", borderRadius: 8, color: "white" }} formatter={v => [`$${v.toFixed(2)}`, "Spent"]} />
              <Area type="monotone" dataKey="spending" stroke="hsl(var(--primary))" fill="url(#rg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[120px]">
            <p className={`text-sm ${muted}`}>No spending data yet — send your first transfer to see trends.</p>
          </div>
        )}
      </div>

      {/* Budget Breakdown */}
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
                <span className={muted}>${Math.max(b.total - b.spent, 0).toFixed(2)} left</span>
                <span className="text-primary font-bold">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spending Snapshot */}
      {(monthTotal > 0 || lastTotal > 0) && (
        <div className={`border rounded-xl p-4 flex items-start gap-3 ${card}`}>
          <span className="text-lg flex-shrink-0 mt-0.5">{diff === null ? "📊" : diff <= -10 ? "📉" : diff >= 10 ? "📈" : "✦"}</span>
          <div>
            <p className="font-bold text-sm mb-0.5">Spending Snapshot</p>
            <p className={`text-xs ${muted} leading-relaxed`}>
              {diff === null
                ? `You've sent $${monthTotal.toFixed(2)} in ${monthName} so far.`
                : diff < 0
                  ? `You sent ${Math.abs(diff)}% less this month vs ${lastMonthName} ($${monthTotal.toFixed(2)} vs $${lastTotal.toFixed(2)}).`
                  : diff > 0
                    ? `You sent ${diff}% more this month vs ${lastMonthName} ($${monthTotal.toFixed(2)} vs $${lastTotal.toFixed(2)}).`
                    : `Spending is consistent with ${lastMonthName} at $${monthTotal.toFixed(2)}.`
              }
            </p>
          </div>
        </div>
      )}

      {/* Spend Analytics (category breakdown, top recipients, etc.) */}
      <SpendAnalytics transfers={transfers} darkMode={darkMode} />

      {/* Rate Alerts */}
      <RateAlertsPanel darkMode={darkMode} currentRate={liveRate} />
    </div>
  );
}