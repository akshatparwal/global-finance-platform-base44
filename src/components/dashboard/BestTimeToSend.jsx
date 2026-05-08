import { useState, useEffect, useRef } from "react";
import { Bell, Trash2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function BestTimeToSend({ rate, ratesLoading, darkMode }) {
  const RATE_AVG = 56.05;
  const diff = rate ? rate - RATE_AVG : 0;
  const isOptimal = diff >= 0.3;
  const isGood = diff >= 0;

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const inputBg = darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";

  const [expanded, setExpanded] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [targetRate, setTargetRate] = useState("");
  const [direction, setDirection] = useState("above");
  const [saving, setSaving] = useState(false);
  const triggeredRef = useRef(new Set());
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.RateAlert.filter({ is_active: true }).then(a => {
      setAlerts(a);
      a.filter(al => al.triggered).forEach(al => triggeredRef.current.add(al.id));
    }).catch(() => {});
  }, []);

  // Check if any alert is triggered by the current rate
  useEffect(() => {
    if (!rate || alerts.length === 0) return;
    alerts.forEach(async (alert) => {
      if (alert.triggered || triggeredRef.current.has(alert.id)) return;
      const hit = alert.direction === "above" ? rate >= alert.target_rate : rate <= alert.target_rate;
      if (!hit) return;
      triggeredRef.current.add(alert.id);
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, triggered: true } : a));
      base44.entities.RateAlert.update(alert.id, { triggered: true, triggered_at: new Date().toISOString() }).catch(() => {});
      toast({ title: "🔔 Rate Alert!", description: `USD/PHP hit ₱${rate.toFixed(2)} — ${alert.direction} ₱${alert.target_rate}. Send now!`, duration: 8000 });
    });
  }, [rate, alerts, toast]);

  const handleCreate = async () => {
    const r = parseFloat(targetRate);
    if (!r || r <= 0) return;
    setSaving(true);
    const newAlert = await base44.entities.RateAlert.create({ currency_pair: "USD/PHP", target_rate: r, direction, is_active: true, triggered: false }).catch(() => null);
    if (newAlert) setAlerts(prev => [...prev, newAlert]);
    setTargetRate("");
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.RateAlert.update(id, { is_active: false }).catch(() => {});
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const activeAlerts = alerts.filter(a => !a.triggered);

  if (ratesLoading || !rate) return null;

  return (
    <div className={`border rounded-xl mb-4 overflow-hidden ${card}`}>
      {/* Top row — rate status */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm flex-shrink-0">{isOptimal ? "🔥" : isGood ? "🕐" : "💡"}</span>
          <div className="min-w-0 text-left">
            <p className={`text-xs font-bold ${text}`}>Best Time to Send</p>
            <p className={`text-[10px] ${muted}`}>
              {isOptimal
                ? `₱${diff.toFixed(2)} above avg — Send now for max value!`
                : isGood
                  ? "Good rate right now"
                  : `₱${Math.abs(diff).toFixed(2)} below avg — rate may improve`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeAlerts.length > 0 && (
            <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {activeAlerts.length} alert{activeAlerts.length > 1 ? "s" : ""}
            </span>
          )}
          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
            isOptimal ? "bg-emerald-500/20 text-emerald-500" : isGood ? "bg-primary/20 text-primary" : "bg-orange-500/20 text-orange-400"
          }`}>
            {isOptimal ? "OPTIMAL" : isGood ? "GOOD" : "WAIT"}
          </span>
          <span className={`text-[10px] ${muted}`}>{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded: alerts panel */}
      {expanded && (
        <div className={`border-t px-3 pb-3 pt-2 space-y-2 ${darkMode ? "border-white/5" : "border-black/5"}`}>
          <div className="flex items-center justify-between">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${muted}`}>Rate Alerts · USD/PHP = ₱{rate.toFixed(2)}</p>
            <button
              onClick={() => setShowForm(f => !f)}
              className="flex items-center gap-1 text-[10px] font-bold text-primary hover:opacity-70 transition-opacity"
            >
              <Bell className="w-3 h-3" /> {showForm ? "Cancel" : "+ Alert"}
            </button>
          </div>

          {showForm && (
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {["above", "below"].map(d => (
                  <button key={d} onClick={() => setDirection(d)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${direction === d ? "border-primary bg-primary/10 text-primary" : `border-transparent ${darkMode ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"}`}`}>
                    {d === "above" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {d === "above" ? "Above ▲" : "Below ▼"}
                  </button>
                ))}
              </div>
              <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${inputBg}`}>
                <span className="font-bold opacity-50 text-sm">₱</span>
                <input type="number" inputMode="decimal" value={targetRate}
                  onChange={e => setTargetRate(e.target.value)}
                  placeholder={`e.g. ${(rate + (direction === "above" ? 0.5 : -0.5)).toFixed(2)}`}
                  className="flex-1 bg-transparent outline-none text-sm font-bold" step="0.01" />
              </div>
              <button onClick={handleCreate} disabled={saving || !targetRate}
                className="w-full bg-primary text-secondary font-bold py-2 rounded-lg text-xs hover:opacity-90 disabled:opacity-50 transition-opacity">
                {saving ? "Saving..." : "Set Alert"}
              </button>
            </div>
          )}

          {activeAlerts.length === 0 && !showForm && (
            <p className={`text-xs ${muted} text-center py-1`}>No active alerts — tap + Alert to get notified.</p>
          )}

          {activeAlerts.map(alert => (
            <div key={alert.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${darkMode ? "border-white/5" : "border-black/5"}`}>
              <span className="flex-shrink-0">{alert.direction === "above" ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-orange-400" />}</span>
              <p className={`text-xs font-bold flex-1 ${text}`}>{alert.direction === "above" ? "Above" : "Below"} ₱{alert.target_rate}</p>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 mr-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE</span>
              <button onClick={() => handleDelete(alert.id)} className="p-1 rounded hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}