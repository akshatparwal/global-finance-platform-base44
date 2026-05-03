import { useState, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Edit2, Trash2, Send, Check, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const BANKS = ["GCash", "Maya", "BDO", "BPI", "Metrobank", "UnionBank", "Security Bank", "Landbank", "PNB", "RCBC", "Chinabank", "EastWest"];
const RELATIONSHIPS = ["mother", "father", "sibling", "spouse", "child", "friend", "other"];
const REL_EMOJI = { mother: "👩", father: "👴", sibling: "👩‍👦", spouse: "💑", child: "👶", friend: "💛", other: "👤" };

function RecipientForm({ initial, onSave, onClose, darkMode }) {
  const [form, setForm] = useState({
    nickname: initial?.nickname || "",
    full_name: initial?.full_name || "",
    emoji: initial?.emoji || "👤",
    bank: initial?.bank || "",
    account_number: initial?.account_number || "",
    relationship: initial?.relationship || "other",
    phone: initial?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  const bg = darkMode ? "bg-[#0d1526]" : "bg-white";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";
  const inputCls = `w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors ${darkMode ? "bg-white/5 border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"}`;
  const labelCls = `text-[10px] font-bold uppercase tracking-wider ${muted} mb-1.5 block`;

  const handleRelChange = (rel) => {
    setForm(f => ({ ...f, relationship: rel, emoji: REL_EMOJI[rel] || "👤" }));
  };

  const handleSave = async () => {
    if (!form.nickname || !form.bank) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`w-full sm:max-w-sm ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className={`font-extrabold text-lg ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {initial ? "Edit Recipient" : "New Recipient"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-8 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Relationship picker */}
          <div>
            <label className={labelCls}>Relationship</label>
            <div className="flex gap-2 flex-wrap">
              {RELATIONSHIPS.map(rel => (
                <button key={rel} onClick={() => handleRelChange(rel)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${form.relationship === rel ? "border-primary bg-primary/10 text-primary" : darkMode ? "border-white/10 text-white/50 hover:border-white/30" : "border-black/10 text-black/50 hover:border-black/30"}`}>
                  {REL_EMOJI[rel]} {rel}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Nickname *</label>
            <input value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
              placeholder="e.g. Nanay, Kuya Jun" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Full Name</label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="e.g. Maria Santos" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Bank / eWallet *</label>
            <div className="grid grid-cols-3 gap-2">
              {BANKS.map(b => (
                <button key={b} onClick={() => setForm(f => ({ ...f, bank: b }))}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${form.bank === b ? "border-primary bg-primary/10 text-primary" : darkMode ? "border-white/10 text-white/50 hover:border-white/30" : "border-black/10 text-black/50 hover:border-black/30"}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Account / Phone Number</label>
            <input value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))}
              placeholder="09XX-XXX-XXXX or account #" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Contact Phone (optional)</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+63 9XX XXX XXXX" className={inputCls} />
          </div>

          <button
            onClick={handleSave}
            disabled={!form.nickname || !form.bank || saving}
            className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 disabled:opacity-40 transition-all mt-2"
          >
            {saving ? "Saving..." : initial ? "Save Changes →" : "Add Recipient →"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Recipients() {
  const { darkMode, taglish } = useOutletContext() || {};
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRec, setEditingRec] = useState(null);
  const [selectedRec, setSelectedRec] = useState(null);

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const divider = darkMode ? "border-white/5" : "border-black/5";

  useEffect(() => {
    Promise.all([
      base44.entities.Recipient.list("-created_date"),
      base44.entities.Transfer.filter({ category: "remittance" }, "-created_date", 200),
    ]).then(([r, t]) => {
      setRecipients(r);
      setTransfers(t);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Pre-build a map of recipient id/name → transfers to avoid O(n²) re-computation
  const transfersByRecipient = useMemo(() => {
    const byId = {};
    const byName = {};
    transfers.forEach(t => {
      if (t.recipient_id) {
        if (!byId[t.recipient_id]) byId[t.recipient_id] = [];
        byId[t.recipient_id].push(t);
      }
      const name = (t.recipient_name || "").trim().toLowerCase();
      if (name) {
        if (!byName[name]) byName[name] = [];
        byName[name].push(t);
      }
    });
    return { byId, byName };
  }, [transfers]);

  const transfersForRecipient = (rec) => {
    const seen = new Set();
    const result = [];
    const addUnique = (txs) => txs?.forEach(t => { if (!seen.has(t.id)) { seen.add(t.id); result.push(t); } });
    if (rec.id) addUnique(transfersByRecipient.byId[rec.id]);
    if (rec.nickname) addUnique(transfersByRecipient.byName[rec.nickname.trim().toLowerCase()]);
    if (rec.full_name) addUnique(transfersByRecipient.byName[rec.full_name.trim().toLowerCase()]);
    return result;
  };

  const handleSave = async (formData) => {
    if (editingRec) {
      const updated = await base44.entities.Recipient.update(editingRec.id, formData);
      setRecipients(prev => prev.map(r => r.id === editingRec.id ? updated : r));
    } else {
      const created = await base44.entities.Recipient.create(formData);
      setRecipients(prev => [created, ...prev]);
    }
    setShowForm(false);
    setEditingRec(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this recipient?")) return;
    await base44.entities.Recipient.delete(id);
    setRecipients(prev => prev.filter(r => r.id !== id));
    setSelectedRec(null);
  };

  // Detail view
  if (selectedRec) {
    const recTransfers = transfersForRecipient(selectedRec);
    const totalSent = recTransfers.reduce((s, t) => s + (t.amount_usd || 0), 0);
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedRec(null)} className={`text-sm font-bold ${muted} hover:opacity-70`}>← Back</button>
        </div>
        <div className={`border rounded-2xl p-5 mb-4 ${card}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-3xl flex-shrink-0">
              {selectedRec.emoji}
            </div>
            <div className="flex-1">
              <h2 className={`font-extrabold text-xl ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{selectedRec.nickname}</h2>
              {selectedRec.full_name && <p className={`text-sm ${muted}`}>{selectedRec.full_name}</p>}
              <p className={`text-xs font-bold text-primary`}>{selectedRec.bank} {selectedRec.account_number && `· ${selectedRec.account_number}`}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingRec(selectedRec); setShowForm(true); }}
                className={`p-2 rounded-xl border ${darkMode ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"}`}>
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(selectedRec.id)} className="p-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl p-3 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
              <p className={`text-xs ${muted} mb-0.5`}>Total Sent</p>
              <p className={`font-black text-lg ${text}`}>${totalSent.toFixed(0)}</p>
            </div>
            <div className={`rounded-xl p-3 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
              <p className={`text-xs ${muted} mb-0.5`}>Transfers</p>
              <p className={`font-black text-lg ${text}`}>{recTransfers.length}</p>
            </div>
          </div>
          <button
            onClick={() => {
              const params = new URLSearchParams({
                recipient: selectedRec.full_name || selectedRec.nickname,
                bank: selectedRec.bank,
              });
              navigate(`/dashboard/pay?${params.toString()}`);
            }}
            className="w-full mt-4 bg-primary text-secondary font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" /> Send to {selectedRec.nickname}
          </button>
        </div>

        <h3 className={`font-bold mb-3 ${text}`}>Transfer History</h3>
        {recTransfers.length === 0 ? (
          <div className={`border rounded-2xl p-8 text-center ${card}`}>
            <p className="text-3xl mb-2">📬</p>
            <p className={`text-sm ${muted}`}>No transfers to {selectedRec.nickname} yet.</p>
          </div>
        ) : (
          <div className={`border rounded-2xl overflow-hidden ${card}`}>
            {recTransfers.map((t, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? `border-t ${divider}` : ""}`}>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  $
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${text}`}>${t.amount_usd} via {t.recipient_bank || selectedRec.bank}</p>
                  <p className={`text-xs ${muted}`}>{new Date(t.created_date).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${t.status === "completed" ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/10 text-primary"}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showForm && (
            <RecipientForm initial={editingRec} onSave={handleSave} onClose={() => { setShowForm(false); setEditingRec(null); }} darkMode={darkMode} />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-extrabold sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {taglish ? "Mga Tatanggap" : "Recipients"}
          </h1>
          <p className={`text-xs ${muted}`}>{taglish ? "Address book ng iyong pamilya" : "Your padala address book"}</p>
        </div>
        <button onClick={() => { setEditingRec(null); setShowForm(true); }}
          className="bg-primary text-secondary font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className={`h-20 rounded-2xl animate-pulse ${darkMode ? "bg-white/5" : "bg-black/5"}`} />)}
        </div>
      ) : recipients.length === 0 ? (
        <div className={`border rounded-2xl p-10 text-center ${card}`}>
          <div className="text-4xl mb-3">👨‍👩‍👧</div>
          <p className={`font-bold text-lg mb-1 ${text}`}>No recipients yet</p>
          <p className={`text-sm ${muted} mb-5`}>Add your family members' bank details to send padala in seconds.</p>
          <button onClick={() => setShowForm(true)} className="bg-primary text-secondary font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90">
            + Add First Recipient
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {recipients.map((rec) => {
            const recTransfers = transfersForRecipient(rec);
            const totalSent = recTransfers.reduce((s, t) => s + (t.amount_usd || 0), 0);
            return (
              <button key={rec.id} onClick={() => setSelectedRec(rec)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left hover:border-primary/30 transition-colors ${card}`}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {rec.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${text}`}>{rec.nickname}</p>
                  <p className={`text-xs ${muted}`}>{rec.bank}{rec.account_number ? ` · ${rec.account_number}` : ""}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {recTransfers.length > 0 ? (
                      <p className="text-xs text-primary font-bold">{recTransfers.length} transfer{recTransfers.length !== 1 ? "s" : ""} · ${totalSent.toFixed(0)}</p>
                    ) : (
                      <p className={`text-xs ${muted}`}>No transfers yet</p>
                    )}
                    {recTransfers.length > 0 && (
                      <p className={`text-xs ${muted}`}>· Last: {new Date(recTransfers[0].created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${muted} flex-shrink-0`} />
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <RecipientForm initial={editingRec} onSave={handleSave} onClose={() => { setShowForm(false); setEditingRec(null); }} darkMode={darkMode} />
        )}
      </AnimatePresence>
    </div>
  );
}