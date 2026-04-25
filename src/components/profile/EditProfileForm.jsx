/**
 * EditProfileForm — editable display name + notification prefs.
 */
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function EditProfileForm({ user, darkMode, onUpdated }) {
  const [displayName, setDisplayName] = useState(user?.display_name || user?.full_name || "");
  const [notifTransfers, setNotifTransfers] = useState(user?.notif_transfers ?? true);
  const [notifRates, setNotifRates] = useState(user?.notif_rates ?? true);
  const [notifMarketing, setNotifMarketing] = useState(user?.notif_marketing ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const inputBg = darkMode
    ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30"
    : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      display_name: displayName,
      notif_transfers: notifTransfers,
      notif_rates: notifRates,
      notif_marketing: notifMarketing,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onUpdated?.({ ...user, display_name: displayName, notif_transfers: notifTransfers, notif_rates: notifRates, notif_marketing: notifMarketing });
  };

  const Toggle = ({ value, onChange, label, sub }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className={`text-sm font-semibold ${text}`}>{label}</p>
        {sub && <p className={`text-xs ${muted}`}>{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${value ? "bg-primary" : darkMode ? "bg-white/20" : "bg-black/20"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );

  return (
    <div className={`border rounded-2xl p-5 ${card} space-y-4`}>
      <h3 className={`font-bold ${text}`}>Edit Profile</h3>

      {/* Display name */}
      <div>
        <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1.5 block`}>Display Name</label>
        <input
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder={user?.full_name || "Your display name"}
          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors ${inputBg}`}
        />
        <p className={`text-[10px] ${muted} mt-1`}>This is shown across your dashboard. Your legal name cannot be changed here.</p>
      </div>

      {/* Notification prefs */}
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1`}>Notification Preferences</p>
        <div className={`border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
          <Toggle
            value={notifTransfers}
            onChange={setNotifTransfers}
            label="Transfer Alerts"
            sub="Get notified when a transfer is sent or received"
          />
          <div className={`border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
            <Toggle
              value={notifRates}
              onChange={setNotifRates}
              label="Rate Alerts"
              sub="Notify me when my target exchange rate is hit"
            />
          </div>
          <div className={`border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
            <Toggle
              value={notifMarketing}
              onChange={setNotifMarketing}
              label="Promotions & Tips"
              sub="Occasional tips, offers and product updates"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary text-secondary font-bold py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}