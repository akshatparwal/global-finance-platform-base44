import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, ChevronDown, ChevronUp, Info } from "lucide-react";

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
  { icon: "❤️", label: "Padala (Remittance)", spent: 850, total: 1000, color: "bg-primary" },
  { icon: "👨‍👩‍👧", label: "Family Support", spent: 150, total: 300, color: "bg-emerald-500" },
  { icon: "📦", label: "Balikbayan Box", spent: 45, total: 200, color: "bg-emerald-500" },
  { icon: "📈", label: "Savings & Investments", spent: 420, total: 500, color: "bg-primary" },
];

const GOALS = [
  { emoji: "🏠", label: "Bahay sa Pilipinas", sub: "Save for your dream home back home", amount: "$12,500" },
  { emoji: "🎓", label: "Edukasyon ng mga Anak", sub: "Invest in the next generation", amount: "$8,000" },
  { emoji: "🛡️", label: "Pondo sa Emergency", sub: "6 months of expenses, ready", amount: "$6,500" },
];

const STOCKS = [
  { code: "SM", name: "SM Investments", type: "Retail, Banking & Property", price: "₱920.00", change: "+1.2%", up: true },
  { code: "BDO", name: "BDO Unibank", type: "Banking", price: "₱142.50", change: "+0.8%", up: true },
  { code: "PLDT", name: "PLDT Inc.", type: "Telecommunications", price: "₱1,450.00", change: "-0.3%", up: false },
];

const TABS = ["Activity", "Goals", "Analytics", "Markets"];

export default function Insights() {
  const { darkMode } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState("Activity");
  const [insightsOpen, setInsightsOpen] = useState(true);
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Insights & Wealth</h1>
        <p className={`text-sm ${muted}`}>Budgets, spending intelligence & wealth building</p>
      </div>

      {/* Tab bar */}
      <div className={`flex gap-1 p-1 rounded-xl mb-6 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === t ? "bg-primary text-secondary" : `${muted} hover:text-current`}`}>
            {t === "Activity" && "⚡ "}{t === "Goals" && "◎ "}{t === "Analytics" && "↗ "}{t === "Markets" && "📊 "}{t}
          </button>
        ))}
      </div>

      {activeTab === "Activity" && (
        <div className="space-y-6">
          <div className={`border rounded-2xl p-6 ${card}`}>
            <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Monthly Spending</p>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-4xl font-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$1,465</p>
                <p className={`text-sm ${muted}`}>of $2,000 monthly budget</p>
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-primary flex items-center justify-center font-black text-primary">73%</div>
            </div>
            <div className={`w-full h-2 rounded-full ${darkMode ? "bg-white/10" : "bg-black/10"} mb-2`}>
              <div className="h-full bg-primary rounded-full" style={{ width: "73%" }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className={muted}>$535 remaining this period</span>
              <span className={muted}>APRIL 2026</span>
            </div>
          </div>

          <div className={`border rounded-2xl p-6 ${card}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-bold">Padala Trends</h3>
                <span className={`text-xs ${muted}`}>Historical performance of the PHP/USD exchange rate.</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary border border-primary/30 px-2 py-1 rounded-lg">
                <Calendar className="w-3 h-3" /> LAST 30 DAYS
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={padalaData}>
                <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
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
            {BUDGETS.map((b, i) => {
              const pct = Math.round((b.spent / b.total) * 100);
              return (
                <div key={i} className={`border rounded-xl p-4 ${card}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2"><span>{b.icon}</span><span className="font-semibold text-sm">{b.label}</span></div>
                    <span className="font-bold text-sm">${b.spent} <span className={`${muted} font-normal`}>/ ${b.total}</span></span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? "bg-white/10" : "bg-black/10"} mb-1`}>
                    <div className={`h-full ${b.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={muted}>${b.total - b.spent} left to spend</span>
                    <span className="text-primary font-bold">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={() => setInsightsOpen(!insightsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2">
              <span className="text-primary">✦</span>
              <span className="text-primary font-bold text-sm uppercase tracking-wider">Intelligent Insights</span>
              <span className="bg-primary text-secondary text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">4</span>
            </div>
            {insightsOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
          </button>
          {insightsOpen && (
            <div className="space-y-2">
              {[
                { icon: "✦", title: "Your Money, Working Hard", sub: "Smart Yield is actively growing your idle balance at 5.1% APY — beating most US savings accounts." },
                { icon: "⚡", title: "Budget Status: Healthy", sub: "Keep up the momentum. You're tracking well against your monthly targets." },
              ].map((ins, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${card}`}>
                  <span className="text-primary mt-0.5">{ins.icon}</span>
                  <div><p className="font-bold text-sm">{ins.title}</p><p className={`text-xs ${muted} mt-0.5`}>{ins.sub}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "Goals" && (
        <div className="space-y-6">
          <div className={`border rounded-2xl p-6 ${card}`}>
            <div className="flex items-center gap-2 mb-4"><span>👨‍👩‍👧</span><h3 className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Family Financial Health</h3></div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[{ label: "Total Family Support", val: "₱82,400" },{ label: "Health Coverage", val: "95%" },{ label: "Shared Progress", val: "₱142,000" }].map((s,i) => (
                <div key={i}><p className={`text-xs ${muted} mb-1`}>{s.label}</p><p className="font-black text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</p></div>
              ))}
            </div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm">PH Family Connectivity</h4>
              <span className="text-primary text-xs font-bold">REAL-TIME SYNC</span>
            </div>
            {[{ emoji: "👩", name: "Maria (Nanay)", sub: "Insured · Active", amount: "₱12,400", ago: "2h ago" },{ emoji: "👴", name: "Jose (Tatay)", sub: "Active Card", amount: "₱5,200", ago: "1d ago" }].map((m,i) => (
              <div key={i} className={`flex items-center gap-3 py-3 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1"><p className="font-semibold text-sm">{m.name}</p><p className={`text-xs ${muted}`}>{m.sub}</p></div>
                <div className="text-right"><p className="font-bold text-sm">{m.amount}</p><p className={`text-xs ${muted}`}>{m.ago}</p></div>
              </div>
            ))}
            <button className={`w-full mt-4 py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 ${darkMode ? "border-white/20 text-white hover:bg-white/5" : "border-black/20 text-[#1a2a4a] hover:bg-black/5"} transition-colors`}>
              FULL FAMILY AUDIT ↗
            </button>
          </div>

          <div className={`border rounded-2xl p-6 ${darkMode ? "bg-[#0d1526] border-white/10" : "bg-[#0d1526] border-white/10"}`}>
            <p className="text-primary/60 text-xs uppercase tracking-wider mb-1">Dream Goal</p>
            <h3 className="text-white font-extrabold text-lg mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Bahay Tracking</h3>
            <p className="text-white/50 text-sm mb-4">Your dream home in Antipolo is becoming a reality.</p>
            <div className="flex gap-2 mb-4 text-[10px] uppercase tracking-wider">
              {["Lupa","Foundation","Walls","Roofing","Finished"].map((s,i) => (
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

          <div className="flex justify-between items-center"><h3 className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Savings Goals</h3><button className="text-primary text-sm font-bold">+ Create Goal</button></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GOALS.map((g,i) => (
              <div key={i} className={`border rounded-2xl p-5 ${card}`}>
                <span className="text-3xl mb-3 block">{g.emoji}</span>
                <h4 className="font-bold mb-1">{g.label}</h4>
                <p className={`text-xs ${muted} mb-3`}>{g.sub}</p>
                <p className="font-black text-xl text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{g.amount}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Analytics" && (
        <div className="space-y-6">
          <div className={`border rounded-2xl p-6 ${card}`}>
            <h3 className="font-extrabold text-lg mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Spending Trends</h3>
            <p className={`text-sm ${muted} mb-4`}>Your monthly spending compared to your established budget</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={spendingData} barGap={2}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(100,100,100,0.8)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(100,100,100,0.6)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a2332", border: "none", borderRadius: 8, color: "white" }} />
                <Bar dataKey="spending" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                <Bar dataKey="budget" fill="rgba(150,150,150,0.3)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary" /><span className={muted}>Spending</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-gray-400/40" /><span className={muted}>Budget</span></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={`border rounded-2xl p-5 ${card}`}>
              <h4 className="font-bold mb-1">Spending Prediction</h4>
              <p className="text-2xl font-black mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$1,580 <span className="text-emerald-500 text-sm">ON TRACK</span></p>
              <p className={`text-xs ${muted}`}>Based on your current habits, you are projected to finish the month $20 under budget.</p>
            </div>
            <div className={`border rounded-2xl p-5 ${card}`}>
              <h4 className="font-bold mb-1">Savings Potential</h4>
              <p className="text-2xl font-black mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$450 <span className={`text-sm font-normal ${muted}`}>per month</span></p>
              <p className={`text-xs ${muted}`}>If you maintain your transport savings, you could reach your House Deposit goal 2 months early.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Markets" && (
        <div className="space-y-4">
          <div className={`border rounded-2xl p-6 ${card}`}>
            <h3 className="font-extrabold text-lg mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Stay Connected to the Homeland</h3>
            <p className={`text-sm ${muted} mb-4`}>Monitoring the Philippine economy helps you time your transfers and investments perfectly.</p>
            <div className="grid grid-cols-2 gap-4">
              {[{ label: "🇵🇭 PSEI INDEX", val: "6,847.30", change: "+0.38% · Today" },{ label: "🇺🇸 USD / PHP", val: "₱56.24", change: "+0.12% · Midmarket" }].map((m,i) => (
                <div key={i} className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
                  <p className={`text-xs ${muted} mb-1`}>{m.label}</p>
                  <p className="font-black text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{m.val}</p>
                  <p className="text-emerald-500 text-xs mt-1">{m.change}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={`border rounded-2xl p-5 ${card}`}>
              <div className="flex justify-between mb-2"><p className={`text-xs ${muted} uppercase tracking-wider`}>PHP Exchange Rate</p><span className="text-emerald-500 text-xs font-bold">LIVE</span></div>
              <p className={`text-xs ${muted}`}>USD to PHP · Interbank Rate</p>
              <p className="text-3xl font-black my-2 text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>₱56.24</p>
              <p className="text-emerald-500 text-xs mb-3">↑ +0.12%</p>
              <div className="bg-primary/10 rounded-lg p-2"><p className="text-primary text-xs">✦ Best time to send: Now. Rates are 1.2% higher than the 30-day average.</p></div>
            </div>
            <div className={`border rounded-2xl p-5 ${card}`}>
              <p className={`text-xs ${muted} uppercase tracking-wider mb-1`}>PSEI (Manila)</p>
              <p className={`text-xs ${muted} mb-2`}>Philippine Stock Exchange Index</p>
              <p className="text-3xl font-black my-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>6,850.40</p>
              <p className="text-red-400 text-xs mb-3">▲ -0.45%</p>
              <p className={`text-xs ${muted}`}>The Manila market is seeing slight consolidation. Financials and Real Estate sectors are leading the volume today.</p>
            </div>
          </div>
          <div className={`border rounded-2xl p-6 ${darkMode ? "bg-[#0d1526] border-white/10" : "bg-[#0d1526] border-white/10"}`}>
            <div className="mb-3"><p className="text-primary text-xs uppercase tracking-wider font-bold">↗ Filipino Blue Chips</p><p className="text-white/40 text-xs">Top Performers · PSE:PM</p></div>
            {STOCKS.map((s,i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-t border-white/5">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white font-black text-xs">{s.code}</div>
                <div className="flex-1"><p className="text-white font-semibold text-sm">{s.name}</p><p className="text-white/40 text-xs">{s.type}</p></div>
                <div className="text-right"><p className="text-white font-bold text-sm">{s.price}</p><p className={`text-xs font-bold ${s.up ? "text-emerald-500" : "text-red-400"}`}>{s.change}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}