import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useOutletContext, useNavigate } from "react-router-dom";
import AddFundsModal from "@/components/savings/AddFundsModal";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLiveRates } from "@/hooks/useLiveRates";
import RateAlertsPanel from "@/components/dashboard/RateAlertsPanel";
import AIInsights from "@/components/dashboard/AIInsights";
import SpendAnalytics from "@/components/dashboard/SpendAnalytics";
import { GoalSkeleton } from "@/components/ui/SkeletonLoader";
import EmptyState from "@/components/ui/EmptyState";
import LiveMarkets from "@/components/insights/LiveMarkets";

const padalaData = [
  { date: "Feb 21", rate: 55.2 }, { date: "Feb 28", rate: 55.6 }, { date: "Mar 7", rate: 55.9 },
  { date: "Mar 14", rate: 56.0 }, { date: "Mar 21", rate: 56.24 },
];

const spendingData = [
  { month: "Oct", spending: 1480, budget: 1600 }, { month: "Nov", spending: 1620, budget: 1600 },
  { month: "Dec", spending: 1890, budget: 1600 }, { month: "Jan", spending: 1320, budget: 1600 },
  { month: "Feb", spending: 1510, budget: 1600 }, { month: "Mar", spending: 1210, budget: 1600 },
];

const BUDGETS = [
  { icon: "❤️", label: "Remittances", spent: 850, total: 1000, color: "bg-primary" },
  { icon: "👨‍👩‍👧", label: "Family Support", spent: 150, total: 300, color: "bg-emerald-500" },
  { icon: "📦", label: "Shipping & Boxes", spent: 45, total: 200, color: "bg-emerald-500" },
  { icon: "📈", label: "Savings & Investments", spent: 420, total: 500, color: "bg-primary" },
];

const GOALS = [
  { emoji: "🏠", label: "Dream Home", sub: "Save for your dream home back home", amount: "$12,500" },
  { emoji: "🎓", label: "Children's Education", sub: "Invest in the next generation", amount: "$8,000" },
  { emoji: "🛡️", label: "Emergency Fund", sub: "6 months of expenses, ready", amount: "$6,500" },
];

const STOCKS = [
  { code: "SM", name: "SM Investments", type: "Retail, Banking & Property", price: "₱920.00", change: "+1.2%", up: true },
  { code: "BDO", name: "BDO Unibank", type: "Banking", price: "₱142.50", change: "+0.8%", up: true },
  { code: "PLDT", name: "PLDT Inc.", type: "Telecommunications", price: "₱1,450.00", change: "-0.3%", up: false },
];

const TABS = ["Activity", "Goals", "Analytics", "Markets"];

export default function Insights() {
  const { darkMode, taglish, bahay } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState("Activity");
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [addFundsGoal, setAddFundsGoal] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const { rates, loading: ratesLoading } = useLiveRates();
  const liveRate = rates?.USDPHP || 56.24;
  const rateChange = rates?.USDPHP_change_pct || 0;
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";

  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.SavingsGoal.list()
      .then(g => { setGoals(g); setGoalsLoading(false); })
      .catch(() => setGoalsLoading(false));
    base44.entities.WalletBalance.list().then(setWallets).catch(() => {});
    base44.entities.Transfer.list("-created_date", 10).then(setTransfers).catch(() => {});
  }, []);

  const handleGoalUpdated = (updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleCreateGoal = async () => {
    const label = prompt("Goal name (e.g. New Laptop, Vacation Fund):");
    if (!label) return;
    const target = prompt("Target amount in USD:");
    if (!target || isNaN(target)) return;
    const emoji = prompt("Choose an emoji for your goal (e.g. 🏠 ✈️ 💻):", "🎯");
    try {
      const newGoal = await base44.entities.SavingsGoal.create({
        emoji: emoji || "🎯", label, description: "Personal savings goal",
        target_amount: parseFloat(target), current_amount: 0
      });
      setGoals(prev => [...prev, newGoal]);
    } catch { alert("Could not create goal. Please try again."); }
  };

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
            className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${activeTab === t ? "bg-primary text-secondary" : `${muted} hover:text-current`}`}>
            {t === "Activity" && "⚡"}{t === "Goals" && "◎"}{t === "Analytics" && "↗"}{t === "Markets" && "📊"}{" "}{t}
          </button>
        ))}
      </div>

      {activeTab === "Activity" && (() => {
        const now = new Date();
        const thisMonth = transfers.filter(t => {
          const d = new Date(t.created_date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const monthTotal = thisMonth.reduce((s, t) => s + (t.amount_usd || 0), 0);
        const MONTHLY_BUDGET = 2000;
        const pctUsed = Math.min(Math.round((monthTotal / MONTHLY_BUDGET) * 100), 100);
        const remaining = Math.max(MONTHLY_BUDGET - monthTotal, 0);
        const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
        const remittanceTotal = thisMonth.filter(t => !t.category || t.category === "remittance").reduce((s,t) => s+(t.amount_usd||0),0);
        const billsTotal = thisMonth.filter(t => t.category === "bills").reduce((s,t) => s+(t.amount_usd||0),0);
        const savingsTotal = thisMonth.filter(t => t.category === "savings").reduce((s,t) => s+(t.amount_usd||0),0);
        const otherTotal = thisMonth.filter(t => t.category === "other" || t.category === "subscriptions").reduce((s,t) => s+(t.amount_usd||0),0);

        const BUDGETS_REAL = [
          { icon: "❤️", label: "Remittances",    spent: remittanceTotal, total: 1000, color: "bg-primary" },
          { icon: "⚡", label: "Bills & Utilities", spent: billsTotal, total: 300, color: "bg-emerald-500" },
          { icon: "📦", label: "Savings",         spent: savingsTotal, total: 500, color: "bg-emerald-500" },
          { icon: "📈", label: "Other",            spent: otherTotal, total: 200, color: "bg-primary" },
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

          <div className={`border rounded-2xl p-6 ${card}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-bold">Transfer Trends</h3>
                <span className={`text-xs ${muted}`}>Historical performance of the PHP/USD exchange rate.</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary border border-primary/30 px-2 py-1 rounded-lg">
                <Calendar className="w-3 h-3" /> LAST 30 DAYS
              </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={padalaData}>
                <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: darkMode ? "rgba(255,255,255,0.4)" : "rgba(26,42,74,0.5)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a2332", border: "none", borderRadius: 8, color: "white" }} />
                <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fill="url(#rg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-2 bg-primary/10 rounded-lg p-2">
              <Info className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary">OPTIMAL SENDING WINDOW — Rates often peak around the 15th and 30th. Convert USD slightly before these dates for maximum value.</span>
            </div>
          </div>

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

          <AIInsights darkMode={darkMode} wallets={wallets} transfers={transfers} goals={goals} />
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

      {activeTab === "Goals" && (
        <div className="space-y-6">
          <div className={`border rounded-2xl p-6 ${card}`}>
            <div className="flex items-center gap-2 mb-4"><span>👨‍👩‍👧</span><h3 className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Family Financial Health</h3></div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
              {[{ label: "Total Family Support", val: "₱82,400" },{ label: "Health Coverage", val: "95%" },{ label: "Shared Progress", val: "₱142,000" }].map((s,i) => (
                <div key={i}><p className={`text-[10px] sm:text-xs ${muted} mb-1`}>{s.label}</p><p className={`font-black text-base sm:text-lg ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</p></div>
              ))}
            </div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm">PH Family Connectivity</h4>
              <span className="text-primary text-xs font-bold">REAL-TIME SYNC</span>
            </div>
            {[{ emoji: "👩", name: "Maria (Mother)", sub: "Insured · Active", amount: "₱12,400", ago: "2h ago" },{ emoji: "👴", name: "Jose (Father)", sub: "Active Card", amount: "₱5,200", ago: "1d ago" }].map((m,i) => (
              <div key={i} className={`flex items-center gap-3 py-3 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1"><p className={`font-semibold text-sm ${text}`}>{m.name}</p><p className={`text-xs ${muted}`}>{m.sub}</p></div>
                <div className="text-right"><p className={`font-bold text-sm ${text}`}>{m.amount}</p><p className={`text-xs ${muted}`}>{m.ago}</p></div>
              </div>
            ))}
            <button onClick={() => alert("Full Family Audit — detailed breakdown of all family transactions and health metrics coming soon!")}
              className={`w-full mt-4 py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 ${darkMode ? "border-white/20 text-white hover:bg-white/5" : "border-black/20 text-[#1a2a4a] hover:bg-black/5"} transition-colors`}>
              FULL FAMILY AUDIT ↗
            </button>
          </div>

          <div className={`border rounded-2xl p-6 ${darkMode ? "bg-[#0d1526] border-white/10" : "bg-[#0d1526] border-white/10"}`}>
            <p className="text-primary/60 text-xs uppercase tracking-wider mb-1">Dream Goal</p>
            <h3 className="text-white font-extrabold text-lg mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Home Construction</h3>
            <p className="text-white/50 text-sm mb-4">Your dream home in Antipolo is becoming a reality.</p>
            <div className="flex gap-2 mb-4 text-[10px] uppercase tracking-wider">
              {["Land","Foundation","Walls","Roofing","Finished"].map((s,i) => (
                <span key={s} className={`flex-1 text-center py-1 rounded ${i <= 2 ? "text-primary border-b-2 border-primary" : "text-white/30"}`}>{s}</span>
              ))}
            </div>
            <p className={`text-xs text-white/40 uppercase tracking-wider mb-1`}>Construction Progress</p>
            <div className="w-full h-2 bg-white/10 rounded-full mb-3"><div className="h-full bg-primary rounded-full" style={{ width: "65%" }} /></div>
            <div className="flex justify-between text-white/50 text-xs mb-4"><span>$32,500 / $50,000</span></div>
            <div className="grid grid-cols-2 gap-3">
              <div className={`bg-white/5 rounded-xl p-3`}><p className="text-white/40 text-xs mb-1">Est. Completion</p><p className="text-white font-bold">Dec 2026</p></div>
              <div className={`bg-white/5 rounded-xl p-3`}><p className="text-white/40 text-xs mb-1">Smart Yield Contribution</p><p className="text-primary font-bold">+$1,240 earned</p></div>
            </div>
          </div>

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
              const pct = g.target_amount > 0 ? Math.round(((g.current_amount || 0) / g.target_amount) * 100) : 0;
              return (
              <div key={g.id || i} className={`border rounded-xl p-4 flex items-center gap-4 ${card}`}>
                <span className="text-3xl flex-shrink-0">{g.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="font-bold text-sm">{g.label}</h4>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {g.auto_save_enabled && <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">⚡ AUTO</span>}
                      {g.round_up_enabled && <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">↑ ROUND-UP</span>}
                    </div>
                  </div>
                  <div className={`w-full h-1.5 rounded-full mb-1 ${darkMode ? "bg-white/10" : "bg-black/10"}`}><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>
                  <p className={`text-xs ${muted}`}>{pct}% · ${(g.current_amount || 0).toLocaleString()} of ${g.target_amount.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setAddFundsGoal(g)}
                  className="flex-shrink-0 bg-primary text-secondary text-xs font-black px-3 py-2 rounded-xl active:scale-95 transition-transform hover:opacity-90"
                >
                  + Add
                </button>
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

      {activeTab === "Markets" && (
        <LiveMarkets
          darkMode={darkMode}
          liveRate={liveRate}
          rateChange={rateChange}
          ratesLoading={ratesLoading}
        />
      )}
    </div>
  );
}