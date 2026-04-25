/**
 * FamilyNetworkPanel — replaces hardcoded Maria/Jose with real Recipient data.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const REL_EMOJI = {
  mother: "👩", father: "👴", sibling: "👩‍🦱", spouse: "💑",
  child: "👧", friend: "💛", other: "👤",
};

export default function FamilyNetworkPanel({ darkMode }) {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";

  useEffect(() => {
    base44.entities.Recipient.list("-transfer_count", 10)
      .then(setRecipients)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSent = recipients.reduce((s, r) => s + (r.total_sent_usd || 0), 0);

  return (
    <div className={`border rounded-2xl p-5 ${card}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-bold ${text}`}>Family Network</h3>
          <p className="text-primary text-xs font-bold uppercase">BAYANIHAN MAP</p>
        </div>
        <button onClick={() => navigate("/dashboard/recipients")}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-70 transition-opacity">
          <UserPlus className="w-3.5 h-3.5" /> Manage
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1,2].map(i => <div key={i} className={`h-14 rounded-xl animate-pulse ${darkMode ? "bg-white/5" : "bg-black/5"}`} />)}
        </div>
      )}

      {!loading && recipients.length === 0 && (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">👨‍👩‍👧</p>
          <p className={`text-sm ${muted} mb-3`}>No recipients yet. Add your family to start sending padala.</p>
          <button onClick={() => navigate("/dashboard/recipients")}
            className="bg-primary text-secondary font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
            Add Family Member →
          </button>
        </div>
      )}

      {!loading && recipients.length > 0 && (
        <div className="space-y-1">
          {recipients.map((r, i) => (
            <div key={r.id} className={`flex items-center gap-3 py-3 border-b last:border-0 ${darkMode ? "border-white/5" : "border-black/5"}`}>
              <span className="text-2xl">{REL_EMOJI[r.relationship] || "👤"}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${text}`}>{r.nickname || r.full_name}</p>
                <p className={`text-xs ${muted}`}>{r.bank} · {r.relationship || "Family"}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-sm ${text}`}>${(r.total_sent_usd || 0).toFixed(0)} sent</p>
                <p className={`text-xs ${muted}`}>{r.transfer_count || 0} transfers</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && recipients.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { icon: "👥", label: "Members", val: String(recipients.length) },
            { icon: "📈", label: "Total Sent", val: `$${totalSent.toFixed(0)}` },
            { icon: "❤️", label: "Active", val: String(recipients.filter(r => (r.transfer_count || 0) > 0).length) },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className={`text-[10px] sm:text-xs ${muted} mb-1`}><span className="text-primary">{s.icon}</span> {s.label}</p>
              <p className={`font-bold text-xs sm:text-sm ${text}`}>{s.val}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}