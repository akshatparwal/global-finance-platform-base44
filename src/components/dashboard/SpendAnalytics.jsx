/**
 * SpendAnalytics — derives real charts from Transfer entity data.
 * Shows: monthly spend bar chart, category breakdown, top recipients.
 */
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

const CATEGORY_COLORS = {
  remittance: "hsl(var(--primary))",
  bills: "#3b82f6",
  subscriptions: "#8b5cf6",
  savings: "#10b981",
  other: "#6b7280",
};
const CATEGORY_ICONS = { remittance: "❤️", bills: "⚡", subscriptions: "📺", savings: "💰", other: "📦" };

export default function SpendAnalytics({ transfers, darkMode }) {
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";

  // Build last 6 months bar chart from real transfer data
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return { month: format(d, "MMM"), start: startOfMonth(d), end: endOfMonth(d), spending: 0 };
    });
    transfers.forEach(t => {
      const date = parseISO(t.created_date);
      const bucket = months.find(m => isWithinInterval(date, { start: m.start, end: m.end }));
      if (bucket) bucket.spending += (t.amount_usd || 0);
    });
    return months.map(m => ({ month: m.month, spending: parseFloat(m.spending.toFixed(2)) }));
  }, [transfers]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const cats = {};
    transfers.forEach(t => {
      const cat = t.category || "remittance";
      cats[cat] = (cats[cat] || 0) + (t.amount_usd || 0);
    });
    return Object.entries(cats).map(([cat, total]) => ({
      cat, total: parseFloat(total.toFixed(2)),
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      icon: CATEGORY_ICONS[cat] || "📦",
      color: CATEGORY_COLORS[cat] || "#6b7280",
    })).sort((a, b) => b.total - a.total);
  }, [transfers]);

  // Top recipients
  const topRecipients = useMemo(() => {
    const rec = {};
    transfers.forEach(t => {
      if (!t.recipient_name) return;
      if (!rec[t.recipient_name]) rec[t.recipient_name] = { name: t.recipient_name, total: 0, count: 0 };
      rec[t.recipient_name].total += (t.amount_usd || 0);
      rec[t.recipient_name].count += 1;
    });
    return Object.values(rec).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [transfers]);

  const totalSpent = transfers.reduce((s, t) => s + (t.amount_usd || 0), 0);
  const thisMonth = monthlyData[monthlyData.length - 1]?.spending || 0;
  const lastMonth = monthlyData[monthlyData.length - 2]?.spending || 0;
  const changeVsLast = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : null;

  if (transfers.length === 0) {
    return (
      <div className={`border rounded-2xl p-8 text-center ${card}`}>
        <p className="text-3xl mb-2">📊</p>
        <p className={`font-bold ${text}`}>No transfer data yet</p>
        <p className={`text-sm ${muted} mt-1`}>Send your first padala to see real spend analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Sent", val: `$${totalSpent.toFixed(0)}` },
          { label: "This Month", val: `$${thisMonth.toFixed(0)}` },
          { label: "vs Last Month", val: changeVsLast !== null ? `${changeVsLast > 0 ? "+" : ""}${changeVsLast}%` : "—", color: changeVsLast > 0 ? "text-red-400" : "text-emerald-500" },
        ].map((s, i) => (
          <div key={i} className={`border rounded-xl p-3 ${card}`}>
            <p className={`text-[10px] ${muted} mb-1`}>{s.label}</p>
            <p className={`font-black text-base ${s.color || text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className={`border rounded-2xl p-5 ${card}`}>
        <p className={`text-xs font-bold uppercase tracking-wider ${muted} mb-4`}>Monthly Spend — Last 6 Months</p>
        <div className="overflow-hidden">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={monthlyData} barGap={2}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: darkMode ? "rgba(255,255,255,0.4)" : "rgba(26,42,74,0.5)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: darkMode ? "rgba(255,255,255,0.3)" : "rgba(26,42,74,0.4)" }} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={{ background: "#1a2332", border: "none", borderRadius: 8, color: "white" }} formatter={v => [`$${v}`, "Sent"]} />
            <Bar dataKey="spending" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <div className={`border rounded-2xl p-5 ${card}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${muted} mb-4`}>By Category</p>
          <div className="space-y-3">
            {categoryData.map((c) => {
              const pct = totalSpent > 0 ? Math.round((c.total / totalSpent) * 100) : 0;
              return (
                <div key={c.cat}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{c.icon}</span>
                      <span className={`text-sm font-semibold ${text}`}>{c.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${text}`}>${c.total} <span className={`text-xs font-normal ${muted}`}>({pct}%)</span></span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? "bg-white/10" : "bg-black/10"}`}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top recipients */}
      {topRecipients.length > 0 && (
        <div className={`border rounded-2xl p-5 ${card}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${muted} mb-4`}>Top Recipients</p>
          <div className="space-y-1">
            {topRecipients.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 py-2.5 ${i > 0 ? `border-t ${darkMode ? "border-white/5" : "border-black/5"}` : ""}`}>
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                  {r.name[0]}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${text}`}>{r.name}</p>
                  <p className={`text-xs ${muted}`}>{r.count} transfer{r.count !== 1 ? "s" : ""}</p>
                </div>
                <p className={`font-bold text-sm ${text}`}>${r.total.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}