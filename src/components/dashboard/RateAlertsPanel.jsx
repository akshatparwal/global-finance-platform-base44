import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RateAlertsPanel({ darkMode, currentRate }) {
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [targetRate, setTargetRate] = useState("");
  const [direction, setDirection] = useState("above");
  const [saving, setSaving] = useState(false);

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const inputBg = darkMode ? "bg-[#0d1526] border-white/10 text-white" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";

  useEffect(() => {
    base44.entities.RateAlert.filter({ is_active: true }).then(setAlerts).catch(() => {});
  }, []);

  // Check alerts against current rate
  useEffect(() => {
    if (!currentRate || alerts.length === 0) return;
    alerts.forEach(async (alert) => {
      if (alert.triggered) return;
      const hit = alert.direction === "above"
        ? currentRate >= alert.target_rate
        : currentRate <= alert.target_rate;
      if (hit) {
        // Mark as triggered
        await base44.entities.RateAlert.update(alert.id, { triggered: true, triggered_at: new Date().toISOString() }).catch(() => {});
        setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, triggered: true } : a));
        // Send email notification
        try {
          const user = await base44.auth.me();
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: `🔔 KinnectFi Rate Alert: USD/PHP hit ₱${currentRate.toFixed(2)}`,
            body: `Your rate alert was triggered!\n\nYour target: ${alert.direction === "above" ? "above" : "below"} ₱${alert.target_rate}\nCurrent rate: ₱${currentRate.toFixed(2)}\n\nThis is a great time to send your padala home!\n\nLog in to KinnectFi to send money now.`
          });
        } catch {}
      }
    });
  }, [currentRate, alerts]);

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
    } catch { alert("Could not save alert. Please try again."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await base44.entities.RateAlert.update(id, { is_active: false }).catch(() => {});
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className={`border rounded-2xl p-5 ${card}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-bold">Rate Alerts</h3>
          <span className={`text-xs ${muted}`}>USD/PHP</span>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-primary text-xs font-bold hover:opacity-70">
          <Plus className="w-3 h-3" /> Add Alert
        </button>
      </div>

      {currentRate && (
        <div className="flex items-center gap-2 mb-4 bg-primary/10 rounded-xl p-3">
          <span className="text-primary font-black text-lg">₱{currentRate.toFixed(2)}</span>
          <span className={`text-xs ${muted}`}>current rate · USD/PHP</span>
        </div>
      )}

      {showForm && (
        <div className="mb-4 space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">New Alert</p>
          <div className="flex gap-2">
            <select value={direction} onChange={e => setDirection(e.target.value)}
              className={`border rounded-lg px-3 py-2 text-sm flex-shrink-0 outline-none ${inputBg}`}>
              <option value="above">Rate goes above ▲</option>
              <option value="below">Rate goes below ▼</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${muted}`}>₱</span>
            <input
              type="number"
              inputMode="decimal"
              value={targetRate}
              onChange={e => setTargetRate(e.target.value)}
              placeholder="56.50"
              className={`flex-1 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-primary ${inputBg}`}
            />
          </div>
          <button onClick={handleCreate} disabled={saving || !targetRate}
            className="w-full bg-primary text-secondary font-bold py-2.5 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? "Saving..." : "Set Alert → Get Email When Hit"}
          </button>
        </div>
      )}

      {alerts.length === 0 ? (
        <p className={`text-sm ${muted} text-center py-4`}>No active alerts. Set one to get notified by email when the rate hits your target.</p>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className={`flex items-center justify-between py-3 px-4 rounded-xl border ${alert.triggered ? "border-emerald-500/30 bg-emerald-500/5" : darkMode ? "border-white/5 bg-white/3" : "border-black/5 bg-black/2"}`}>
              <div className="flex items-center gap-3">
                {alert.triggered
                  ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  : <Bell className="w-4 h-4 text-primary flex-shrink-0" />
                }
                <div>
                  <p className="text-sm font-semibold">
                    {alert.direction === "above" ? "▲" : "▼"} ₱{alert.target_rate}
                  </p>
                  <p className={`text-xs ${muted}`}>
                    {alert.triggered ? `✓ Triggered ${alert.triggered_at ? new Date(alert.triggered_at).toLocaleDateString() : ""}` : "Watching · email alert active"}
                  </p>
                </div>
              </div>
              <button onClick={() => handleDelete(alert.id)} className="text-red-400 hover:opacity-70">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}