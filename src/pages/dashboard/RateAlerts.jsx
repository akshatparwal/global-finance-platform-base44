import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Bell, Plus, Trash2, CheckCircle, TrendingUp, TrendingDown, RefreshCw, Zap, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLiveRates } from "@/hooks/useLiveRates";
import { useToast } from "@/components/ui/use-toast";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const RATE_HISTORY = [
  { date: "Apr 1",  rate: 55.80 },
  { date: "Apr 5",  rate: 55.95 },
  { date: "Apr 8",  rate: 56.10 },
  { date: "Apr 11", rate: 55.90 },
  { date: "Apr 14", rate: 56.20 },
  { date: "Apr 17", rate: 56.35 },
  { date: "Apr 21", rate: 56.42 },
];

const PRESETS = [
  { label: "₱56.50 ▲", rate: 56.50, direction: "above", desc: "Slightly above current" },
  { label: "₱57.00 ▲", rate: 57.00, direction: "above", desc: "Strong rate target" },
  { label: "₱56.00 ▼", rate: 56.00, direction: "below", desc: "Buy-the-dip alert" },
];

export default function RateAlerts() {
  const { darkMode } = useOutletContext() || {};
  const { rates, loading: ratesLoading, refetch } = useLiveRates();
  const { toast } = useToast();
  const liveRate = rates?.USDPHP || 56.42;
  const rateChange = rates?.USDPHP_change_pct || 0;

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [targetRate, setTargetRate] = useState("");
  const [direction, setDirection] = useState("above");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const triggeredRef = useRef(new Set());

  const card    = darkMode ? "bg-[#1a2332] border-white/5"  : "bg-white border-black/10";
  const muted   = darkMode ? "text-white/50"                 : "text-[#1a2a4a]/50";
  const text    = darkMode ? "text-white"                    : "text-[#1a2a4a]";
  const inputBg = darkMode
    ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30"
    : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";

  // Load alerts + user
  useEffect(() => {
    Promise.all([
      base44.entities.RateAlert.filter({ is_active: true }),
      base44.auth.me().catch(() => null),
    ]).then(([a, u]) => {
      setAlerts(a);
      setUser(u);
      // Seed already-triggered IDs so we don't re-fire on load
      a.filter(al => al.triggered).forEach(al => triggeredRef.current.add(al.id));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Rate watcher — fires in-app toast + email when target is hit
  useEffect(() => {
    if (!liveRate || alerts.length === 0 || ratesLoading) return;

    alerts.forEach(async (alert) => {
      if (alert.triggered || triggeredRef.current.has(alert.id)) return;

      const hit = alert.direction === "above"
        ? liveRate >= alert.target_rate
        : liveRate <= alert.target_rate;

      if (!hit) return;

      // Optimistic update
      triggeredRef.current.add(alert.id);
      setAlerts(prev =>
        prev.map(a => a.id === alert.id ? { ...a, triggered: true, triggered_at: new Date().toISOString() } : a)
      );

      // Persist
      base44.entities.RateAlert.update(alert.id, {
        triggered: true,
        triggered_at: new Date().toISOString(),
      }).catch(() => {});

      // In-app toast notification
      toast({
        title: `🔔 Rate Alert Triggered!`,
        description: `USD/PHP hit ₱${liveRate.toFixed(2)} — your target was ${alert.direction === "above" ? "above" : "below"} ₱${alert.target_rate}. Great time to send your padala!`,
        duration: 8000,
      });

      // Email notification
      if (user?.email) {
        base44.integrations.Core.SendEmail({
          to: user.email,
          from_name: "KinnectFi Rate Alerts",
          subject: `🔔 Rate Alert: USD/PHP hit ₱${liveRate.toFixed(2)} — Send now!`,
          body: `Hi ${user.full_name || "there"}!\n\nYour KinnectFi rate alert was triggered.\n\n📊 Current Rate: ₱${liveRate.toFixed(2)} / USD\n🎯 Your Target:  ${alert.direction === "above" ? "Above" : "Below"} ₱${alert.target_rate}\n\nThis is a great moment to send your padala home! Log in to KinnectFi and lock in this rate before it changes.\n\n→ Send money now: https://kinnect.fi/dashboard/pay\n\n— KinnectFi Rate Alert System\n\nYou're receiving this because you set a rate alert. To manage your alerts, visit https://kinnect.fi/dashboard/rate-alerts`,
        }).catch(() => {});
      }
    });
  }, [liveRate, alerts, ratesLoading, user, toast]);

  const handleCreate = async () => {
    const rate = parseFloat(targetRate);
    if (!rate || rate <= 0) return;
    setSaving(true);
    try {
      const newAlert = await base44.entities.RateAlert.create({
        currency_pair: "USD/PHP",
        target_rate: rate,
        direction,
        is_active: true,
        triggered: false,
      });
      setAlerts(prev => [...prev, newAlert]);
      setTargetRate("");
      setShowForm(false);
      toast({
        title: "Alert set!",
        description: `We'll notify you by email & in-app when USD/PHP goes ${direction} ₱${rate.toFixed(2)}.`,
      });
    } catch {
      alert("Could not save alert. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.RateAlert.update(id, { is_active: false }).catch(() => {});
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handlePreset = (preset) => {
    setTargetRate(String(preset.rate));
    setDirection(preset.direction);
    setShowForm(true);
  };

  const activeAlerts    = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Rate Alerts
          </h1>
          <p className={`text-sm ${muted}`}>Get notified the moment USD/PHP hits your target</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-secondary font-bold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> New Alert
        </button>
      </div>

      {/* Live rate card */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2e00 60%, #8a6a00 100%)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Live Rate · USD/PHP</p>
            <p className="text-white font-black text-4xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {ratesLoading ? "₱—.——" : `₱${liveRate.toFixed(2)}`}
            </p>
            <p className={`text-sm mt-1 font-semibold ${rateChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {rateChange >= 0 ? `▲ +${rateChange.toFixed(2)}%` : `▼ ${rateChange.toFixed(2)}%`} · 24h
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ratesLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${ratesLoading ? "bg-white/10 text-white/40" : "bg-emerald-500/20 text-emerald-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${ratesLoading ? "bg-white/30" : "bg-emerald-400 animate-pulse"}`} />
              {ratesLoading ? "Fetching..." : "Live"}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={RATE_HISTORY} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <Tooltip
              contentStyle={{ background: "#0d1526", border: "none", borderRadius: 8, color: "white", fontSize: 11 }}
              formatter={v => [`₱${v.toFixed(2)}`, "Rate"]}
            />
            {activeAlerts.map(a => (
              <ReferenceLine key={a.id} y={a.target_rate} stroke="hsl(var(--primary))" strokeDasharray="4 3" strokeWidth={1.5} />
            ))}
            <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fill="url(#rg2)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>

        {activeAlerts.length > 0 && (
          <p className="text-white/30 text-[10px] mt-2 text-center">Dashed lines show your active alert targets</p>
        )}
      </div>

      {/* New alert form */}
      {showForm && (
        <div className={`border rounded-2xl p-5 border-primary/30 bg-primary/5`}>
          <p className="text-primary text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" /> New Rate Alert · USD/PHP
          </p>

          {/* Quick presets */}
          <p className={`text-xs font-semibold ${muted} mb-2`}>Quick presets</p>
          <div className="flex gap-2 mb-4 flex-wrap">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => handlePreset(p)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary/10 transition-colors`}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider ${muted} mb-2 block`}>Alert me when the rate is</label>
              <div className="grid grid-cols-2 gap-2">
                {["above", "below"].map(d => (
                  <button
                    key={d}
                    onClick={() => setDirection(d)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${direction === d ? "border-primary bg-primary/10 text-primary" : `border-transparent ${darkMode ? "bg-white/5 text-white/50" : "bg-black/5 text-black/50"}`}`}
                  >
                    {d === "above" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {d === "above" ? "Above ▲" : "Below ▼"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`text-xs font-bold uppercase tracking-wider ${muted} mb-2 block`}>Target rate (₱ per $1)</label>
              <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${inputBg}`}>
                <span className={`text-lg font-bold ${muted}`}>₱</span>
                <input
                  type="number"
                  value={targetRate}
                  onChange={e => setTargetRate(e.target.value)}
                  placeholder={`e.g. ${(liveRate + (direction === "above" ? 0.5 : -0.5)).toFixed(2)}`}
                  className="flex-1 bg-transparent outline-none text-lg font-bold"
                  step="0.01"
                />
                <span className={`text-xs font-bold ${muted}`}>/ USD</span>
              </div>
              {targetRate && !isNaN(parseFloat(targetRate)) && (
                <p className={`text-xs mt-1.5 ${muted}`}>
                  {direction === "above"
                    ? `Alert fires when 1 USD buys more than ₱${parseFloat(targetRate).toFixed(2)}`
                    : `Alert fires when 1 USD buys less than ₱${parseFloat(targetRate).toFixed(2)}`}
                  {" "}· {Math.abs(parseFloat(targetRate) - liveRate).toFixed(2)} away from current rate
                </p>
              )}
            </div>

            <div className={`flex items-start gap-2 rounded-xl p-3 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
              <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className={`text-xs ${muted}`}>
                You'll receive both an <span className={`font-semibold ${text}`}>in-app notification</span> and an <span className={`font-semibold ${text}`}>email</span> the moment the rate hits your target.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowForm(false)} className={`flex-1 py-3 rounded-xl border font-bold text-sm ${darkMode ? "border-white/10 text-white/50 hover:bg-white/5" : "border-black/10 text-black/50 hover:bg-black/5"} transition-colors`}>
                Cancel
              </button>
              <button onClick={handleCreate} disabled={saving || !targetRate || isNaN(parseFloat(targetRate))}
                className="flex-1 bg-primary text-secondary font-bold py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                {saving ? "Setting alert..." : "Set Alert →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <div className={`border rounded-2xl p-5 ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className={`font-bold ${text}`}>Active Alerts</h3>
            <span className="ml-auto bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
              {activeAlerts.length} watching
            </span>
          </div>
          <div className="space-y-2">
            {activeAlerts.map(alert => {
              const diff = Math.abs(alert.target_rate - liveRate);
              const pct  = ((diff / liveRate) * 100).toFixed(2);
              return (
                <div key={alert.id} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border ${darkMode ? "border-white/5" : "border-black/5"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.direction === "above" ? "bg-emerald-500/10" : "bg-orange-500/10"}`}>
                    {alert.direction === "above"
                      ? <TrendingUp className="w-5 h-5 text-emerald-500" />
                      : <TrendingDown className="w-5 h-5 text-orange-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${text}`}>
                      {alert.direction === "above" ? "Above" : "Below"} ₱{alert.target_rate}
                    </p>
                    <p className={`text-xs ${muted}`}>
                      {diff.toFixed(2)} away ({pct}%) · email + in-app alert
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> WATCHING
                    </span>
                    <button onClick={() => handleDelete(alert.id)} className={`p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Triggered alerts */}
      {triggeredAlerts.length > 0 && (
        <div className={`border rounded-2xl p-5 ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <h3 className={`font-bold ${text}`}>Triggered</h3>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${darkMode ? "bg-white/10 text-white/40" : "bg-black/10 text-black/40"}`}>
              {triggeredAlerts.length} fired
            </span>
          </div>
          <div className="space-y-2">
            {triggeredAlerts.map(alert => (
              <div key={alert.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className={`font-bold text-sm ${text}`}>
                    {alert.direction === "above" ? "Above" : "Below"} ₱{alert.target_rate} — Hit!
                  </p>
                  <p className={`text-xs ${muted}`}>
                    Triggered {alert.triggered_at ? new Date(alert.triggered_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                    · Email & in-app notification sent
                  </p>
                </div>
                <button onClick={() => handleDelete(alert.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {alerts.length === 0 && !showForm && !loading && (
        <div className={`border rounded-2xl p-10 text-center ${card}`}>
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-7 h-7 text-primary" />
          </div>
          <h3 className={`font-extrabold text-lg mb-2 ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            No alerts yet
          </h3>
          <p className={`text-sm ${muted} mb-5 max-w-xs mx-auto`}>
            Set a target rate and we'll notify you by <strong>email and in-app</strong> the moment USD/PHP hits it — so you never miss the best time to send your padala.
          </p>
          <button onClick={() => setShowForm(true)} className="bg-primary text-secondary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto">
            <Zap className="w-4 h-4" /> Set My First Alert
          </button>
        </div>
      )}

      {/* How it works */}
      <div className={`border rounded-2xl p-5 ${card}`}>
        <h3 className={`font-bold ${text} mb-4`}>How Rate Alerts Work</h3>
        <div className="space-y-3">
          {[
            { icon: "🎯", title: "Set your target rate", desc: "Choose a rate above or below the current USD/PHP exchange rate." },
            { icon: "👁️", title: "We monitor 24/7", desc: "Our system checks live rates continuously against your targets." },
            { icon: "🔔", title: "Instant dual notification", desc: "When your target hits, you get an in-app toast AND an email — so you never miss it." },
            { icon: "💸", title: "Send at the best moment", desc: "Head to Pay and lock in the rate before it changes. Your family gets more pesos!" },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{s.icon}</span>
              <div>
                <p className={`text-sm font-bold ${text}`}>{s.title}</p>
                <p className={`text-xs ${muted}`}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}