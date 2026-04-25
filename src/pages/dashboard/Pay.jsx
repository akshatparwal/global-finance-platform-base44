import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Search, RefreshCw, Shield, Plus, Bell, Trash2, CheckCircle, TrendingUp, TrendingDown, Zap, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLiveRates } from "@/hooks/useLiveRates";
import TransferEstimator from "@/components/dashboard/TransferEstimator";
import { useToast } from "@/components/ui/use-toast";
import { haptic } from "@/utils/haptic";
import { sfx } from "@/utils/sounds";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { AnimatePresence } from "framer-motion";
import TransferConfirmModal from "@/components/transfer/TransferConfirmModal";
import TransactionReceipt from "@/components/transfer/TransactionReceipt";
import CurrencyConverter from "@/components/pay/CurrencyConverter";
import SendAnimation from "@/components/transfer/SendAnimation";
import TransferTracker from "@/components/transfer/TransferTracker";
import NoRecipientsEmptyState from "@/components/pay/NoRecipientsEmptyState";

const RATE_HISTORY = [
  { date: "Apr 1",  rate: 55.80 }, { date: "Apr 5",  rate: 55.95 }, { date: "Apr 8",  rate: 56.10 },
  { date: "Apr 11", rate: 55.90 }, { date: "Apr 14", rate: 56.20 }, { date: "Apr 17", rate: 56.35 },
  { date: "Apr 21", rate: 56.42 },
];
const PRESETS = [
  { label: "₱56.50 ▲", rate: 56.50, direction: "above" },
  { label: "₱57.00 ▲", rate: 57.00, direction: "above" },
  { label: "₱56.00 ▼", rate: 56.00, direction: "below" },
];

const AVATAR_COLORS = ["bg-purple-500","bg-blue-500","bg-red-500","bg-yellow-500","bg-teal-500","bg-emerald-500","bg-pink-500","bg-indigo-500"];

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 10000;

const PAY_TABS = ["Transfer History", "Rate Alerts", "Tools", "Protection", "Shipments"];

import CreateScheduledForm from "@/components/pay/CreateScheduledForm";

export default function Pay() {
  const { darkMode, taglish } = useOutletContext() || {};
  const navigate = useNavigate();
  const [showScheduledForm, setShowScheduledForm] = useState(false);
  // Pre-fill from "Send Again" navigation
  const prefill = (() => {
    try { return new URLSearchParams(window.location.search); } catch { return new URLSearchParams(); }
  })();
  const [sendAmount, setSendAmount] = useState(prefill.get("amount") || "");
  const [amountError, setAmountError] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const prefillName = prefill.get("recipient") || "";
  const prefillBank = prefill.get("bank") || "";
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [sending, setSending] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [completedTransfer, setCompletedTransfer] = useState(null);
  const [showSendAnim, setShowSendAnim] = useState(false);
  const [sendAnimData, setSendAnimData] = useState({ amount: "", recipient: "" });
  const [trackedTransfer, setTrackedTransfer] = useState(null);
  const [activeTab, setActiveTab] = useState("Transfer History");
  const { rates, loading: ratesLoading, refetch } = useLiveRates();
  const { toast } = useToast();
  // Rate alerts state
  const [rateAlerts, setRateAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertTargetRate, setAlertTargetRate] = useState("");
  const [alertDirection, setAlertDirection] = useState("above");
  const [alertSaving, setAlertSaving] = useState(false);
  const [alertUser, setAlertUser] = useState(null);
  const triggeredRef = useRef(new Set());
  const rate = rates?.USDPHP || 56.24;
  const receive = sendAmount ? (parseFloat(sendAmount) * rate).toFixed(2) : "0.00";
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const inputBg = darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";

  useEffect(() => {
    base44.entities.Transfer.list("-created_date", 10).then(setTransfers).catch(() => {});
    base44.entities.Recipient.list("-transfer_count", 6).then(r => {
      setRecipients(r);
      setRecipientsLoading(false);
      // Auto-select recipient if pre-filled from Send Again
      if (prefillName) {
        const match = r.find(rec =>
          (rec.full_name || "").toLowerCase() === prefillName.toLowerCase() ||
          (rec.nickname || "").toLowerCase() === prefillName.toLowerCase()
        );
        if (match) setSelectedRecipient(match);
      }
    }).catch(() => setRecipientsLoading(false));
    base44.entities.ScheduledTransfer.filter({ is_active: true }).then(setScheduled).catch(() => {});
    setAlertsLoading(true);
    Promise.all([
      base44.entities.RateAlert.filter({ is_active: true }),
      base44.auth.me().catch(() => null),
    ]).then(([a, u]) => {
      setRateAlerts(a);
      setAlertUser(u);
      a.filter(al => al.triggered).forEach(al => triggeredRef.current.add(al.id));
      setAlertsLoading(false);
    }).catch(() => setAlertsLoading(false));
  }, []);

  // Rate watcher
  useEffect(() => {
    if (!rate || rateAlerts.length === 0 || ratesLoading) return;
    rateAlerts.forEach(async (alert) => {
      if (alert.triggered || triggeredRef.current.has(alert.id)) return;
      const hit = alert.direction === "above" ? rate >= alert.target_rate : rate <= alert.target_rate;
      if (!hit) return;
      triggeredRef.current.add(alert.id);
      setRateAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, triggered: true, triggered_at: new Date().toISOString() } : a));
      base44.entities.RateAlert.update(alert.id, { triggered: true, triggered_at: new Date().toISOString() }).catch(() => {});
      toast({ title: `🔔 Rate Alert Triggered!`, description: `USD/PHP hit ₱${rate.toFixed(2)} — ${alert.direction === "above" ? "above" : "below"} ₱${alert.target_rate}. Send your padala now!`, duration: 8000 });
      if (alertUser?.email) {
        base44.integrations.Core.SendEmail({ to: alertUser.email, from_name: "KinnectFi Rate Alerts", subject: `🔔 Rate Alert: USD/PHP hit ₱${rate.toFixed(2)}`, body: `Your rate alert was triggered!\n\nCurrent Rate: ₱${rate.toFixed(2)}\nYour Target: ${alert.direction} ₱${alert.target_rate}\n\nLog in to send money now: https://kinnect.fi/dashboard/pay` }).catch(() => {});
      }
    });
  }, [rate, rateAlerts, ratesLoading, alertUser, toast]);

  const handleCreateAlert = async () => {
    const r = parseFloat(alertTargetRate);
    if (!r || r <= 0) return;
    setAlertSaving(true);
    try {
      const newAlert = await base44.entities.RateAlert.create({ currency_pair: "USD/PHP", target_rate: r, direction: alertDirection, is_active: true, triggered: false });
      setRateAlerts(prev => [...prev, newAlert]);
      setAlertTargetRate("");
      setShowAlertForm(false);
      toast({ title: "Alert set!", description: `We'll notify you when USD/PHP goes ${alertDirection} ₱${r.toFixed(2)}.` });
    } catch {} finally { setAlertSaving(false); }
  };

  const handleDeleteAlert = async (id) => {
    await base44.entities.RateAlert.update(id, { is_active: false }).catch(() => {});
    setRateAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Amount validation
  const validateAmount = (val) => {
    const amt = parseFloat(val);
    if (!val || isNaN(amt)) return "Please enter an amount.";
    if (amt < MIN_AMOUNT) return `Minimum transfer is $${MIN_AMOUNT}.`;
    if (amt > MAX_AMOUNT) return `Maximum transfer is $${MAX_AMOUNT.toLocaleString()}.`;
    return "";
  };

  const handleAmountChange = (val) => {
    const cleaned = val.replace(/[^0-9.]/g, "");
    setSendAmount(cleaned);
    if (amountError) setAmountError(validateAmount(cleaned));
  };

  // Step 1: validate then open confirm modal
  const handleSend = () => {
    const error = validateAmount(sendAmount);
    if (error) { setAmountError(error); return; }
    haptic.medium();
    setShowConfirm(true);
  };

  // Step 2: called after PIN confirmed
  const handleConfirmedSend = async () => {
    const amt = parseFloat(sendAmount);
    setSending(true);
    setShowConfirm(false);

    const recipientName = selectedRecipient?.nickname || selectedRecipient?.full_name || "Family";
    const recipientBank = selectedRecipient?.bank || "GCash";

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticTransfer = {
      id: optimisticId,
      amount_usd: amt,
      amount_php: parseFloat(receive),
      recipient_name: recipientName,
      recipient_bank: recipientBank,
      status: "pending",
      created_date: new Date().toISOString(),
    };
    setTransfers(prev => [optimisticTransfer, ...prev]);
    setSendAmount("");
    setSelectedRecipient(null);

    try {
      const saved = await base44.entities.Transfer.create({
        amount_usd: amt,
        amount_php: parseFloat(receive),
        recipient_name: recipientName,
        recipient_bank: recipientBank,
        status: "completed",
        rate,
        fee: 0,
        note: transferNote || undefined,
      });
      setTransferNote("");
      const finalTransfer = { ...saved, status: "completed" };
      setTransfers(prev => prev.map(t => t.id === optimisticId ? finalTransfer : t));
      haptic.success();
      sfx.success();
      // Show send animation then receipt
      setSendAnimData({ amount: amt.toFixed(2), recipient: recipientName });
      setShowSendAnim(true);
      // Store for after animation
      setCompletedTransfer(finalTransfer);
    } catch {
      setTransfers(prev => prev.filter(t => t.id !== optimisticId));
      setSendAmount(String(amt));
      haptic.error();
      sfx.error();
      toast({ title: "Transfer failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-extrabold sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {taglish ? "Magpadala" : "Send Money"}
          </h1>
          <p className={`text-xs ${muted}`}>{taglish ? "Mabilis at ligtas na padala" : "Fast, secure cross-border transfers"}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1">
        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-primary text-[10px] font-bold">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}</span>
        </div>
      </div>

      {/* Best time banner — compact single line */}
      <div className={`border rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-2 ${card}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-primary text-base flex-shrink-0">🕐</span>
          <div className="min-w-0">
            <span className={`text-xs font-bold ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>{taglish ? "Pinakamabuting Oras" : "Best Time to Send"} </span>
            <span className="text-primary text-xs font-bold">↑ +₱0.42</span>
            <span className={`text-xs ${muted}`}> vs. last week</span>
          </div>
        </div>
        <span className="bg-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase px-2 py-1 rounded-full flex-shrink-0">OPTIMAL</span>
      </div>

      {/* Send form */}
      <div className={`border rounded-2xl p-4 mb-4 ${card}`}>
        <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 mb-5 ${inputBg}`}>
          <Search className="w-4 h-4 opacity-40" />
          <input
            placeholder={taglish ? "Hanapin ang tatanggap..." : "Search by name or bank..."}
            className="flex-1 bg-transparent outline-none text-sm"
            value={recipientSearch}
            onChange={e => setRecipientSearch(e.target.value)}
          />
          {recipientSearch && (
            <button onClick={() => setRecipientSearch("")} className="opacity-40 hover:opacity-70 text-xs font-bold">✕</button>
          )}
        </div>

        {!recipientsLoading && recipients.length === 0 && <NoRecipientsEmptyState darkMode={darkMode} />}

        {/* Send Again suggestion — last transfer */}
        {!recipientsLoading && transfers.length > 0 && recipients.length > 0 && (() => {
          const last = transfers[0];
          const daysSince = Math.floor((Date.now() - new Date(last.created_date)) / 86400000);
          return (
            <button
              onClick={() => { setSendAmount(String(last.amount_usd)); setSelectedRecipient(recipients.find(r => r.full_name === last.recipient_name || r.nickname === last.recipient_name) || null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border mb-4 text-left hover:border-primary/40 transition-colors ${darkMode ? "border-white/8 bg-white/3" : "border-black/8 bg-black/2"}`}
            >
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                {last.recipient_name?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>Send again to {last.recipient_name}</p>
                <p className={`text-xs ${muted}`}>${last.amount_usd} · {daysSince === 0 ? "today" : daysSince === 1 ? "yesterday" : `${daysSince}d ago`}</p>
              </div>
              <span className="text-primary text-xs font-bold flex-shrink-0">Repeat →</span>
            </button>
          );
        })()}

        <div className="flex items-center gap-3 mb-6 overflow-x-auto">
          <span className={`text-xs font-bold uppercase tracking-wider ${muted} flex-shrink-0`}>{taglish ? "Kamakailan:" : "Recent:"}</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recipientsLoading && [1,2,3].map(i => (
              <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-10 h-10 rounded-full animate-pulse ${darkMode ? "bg-white/10" : "bg-black/10"}`} />
                <div className={`w-8 h-2 rounded animate-pulse ${darkMode ? "bg-white/8" : "bg-black/8"}`} />
              </div>
            ))}
            {!recipientsLoading && recipients.length === 0 && (
              <span className={`text-xs ${muted} italic py-3`}>No recipients yet</span>
            )}
            {recipients
              .filter(r => !recipientSearch || (r.nickname + " " + r.full_name + " " + r.bank).toLowerCase().includes(recipientSearch.toLowerCase()))
              .map((r, i) => {
              const initials = (r.nickname || r.full_name || "?").slice(0, 2).toUpperCase();
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const isSelected = selectedRecipient?.id === r.id;
              return (
                <button key={r.id} onClick={() => setSelectedRecipient(isSelected ? null : r)}
                  className="flex flex-col items-center gap-1 group flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-xs font-black group-hover:scale-110 transition-transform ring-2 ${isSelected ? "ring-primary" : "ring-transparent"}`}>{initials}</div>
                  <span className={`text-[9px] ${muted} max-w-[44px] truncate`}>{r.nickname || r.full_name}</span>
                </button>
              );
            })}
            <button onClick={() => navigate("/dashboard/recipients")} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-current opacity-30 flex items-center justify-center"><Plus className="w-3 h-3" /></div>
              <span className={`text-[9px] ${muted}`}>{taglish ? "Dagdag" : "Add"}</span>
            </button>
          </div>
        </div>

        {selectedRecipient && (
          <div className="mb-4 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-primary text-sm">✓</span>
            <span className="text-primary text-sm font-bold">Sending to: {selectedRecipient.nickname || selectedRecipient.full_name} via {selectedRecipient.bank}</span>
          </div>
        )}

        <div className="space-y-3 mb-4">
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1.5 block`}>{taglish ? "Ipadala" : "You Send"}</label>
            <div className={`flex items-center border rounded-xl overflow-hidden transition-colors ${amountError ? "border-red-500" : inputBg}`}>
              <div className="bg-[#0d1526] text-white px-3 h-12 flex items-center gap-1 flex-shrink-0 border-r border-white/10">
                <span>🇺🇸</span><span className="text-xs font-bold">USD</span>
              </div>
              <input value={sendAmount} onChange={e => handleAmountChange(e.target.value)}
                placeholder="0.00" inputMode="decimal" className="flex-1 bg-transparent px-4 h-12 text-xl font-black outline-none" />
            </div>
            {amountError && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs font-semibold">{amountError}</p>
              </div>
            )}
            <p className={`text-[10px] ${muted} mt-1`}>Min $${MIN_AMOUNT} · Max $${MAX_AMOUNT.toLocaleString()} per transfer</p>
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1.5 block`}>{taglish ? "Matatanggap" : "They Receive"}</label>
            <div className={`flex items-center border rounded-xl overflow-hidden ${inputBg}`}>
              <div className="bg-primary text-secondary px-3 h-12 flex items-center gap-1 flex-shrink-0 border-r border-primary/30">
                <span>🇵🇭</span><span className="text-xs font-bold">PHP</span>
              </div>
              <div className="flex-1 px-4 h-12 flex items-center text-xl font-black">₱{receive}</div>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between py-3 border-t border-b ${darkMode ? "border-white/5" : "border-black/5"} mb-4`}>
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-3 h-3 text-primary ${ratesLoading ? "animate-spin" : ""}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${muted}`}>{taglish ? "Live na Palitan" : "Live Exchange Rate"}</span>
          </div>
          <span className={`font-bold text-sm ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>1 USD = {ratesLoading ? "..." : `${rate.toFixed(2)}`} PHP</span>
        </div>

        <div className="mb-4">
          <TransferEstimator sendAmount={sendAmount} rate={rate} darkMode={darkMode} taglish={taglish} />
        </div>

        {/* Quick amount presets */}
        <div className="flex gap-2 mb-4">
          {[50, 100, 200, 500].map(amt => (
            <button key={amt} onClick={() => { setSendAmount(String(amt)); setAmountError(""); }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 ${parseFloat(sendAmount) === amt ? "bg-primary text-secondary border-primary" : darkMode ? "border-white/10 text-white/60 hover:border-white/30" : "border-black/10 text-[#1a2a4a]/60 hover:border-black/30"}`}>
              ${amt}
            </button>
          ))}
        </div>

        {/* Note/memo field */}
        <div className="mb-4">
          <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1.5 block`}>{taglish ? "Mensahe (opsyonal)" : "Note (optional)"}</label>
          <input
            value={transferNote}
            onChange={e => setTransferNote(e.target.value)}
            placeholder={taglish ? "para sa pagkain, bayad ng kuryente..." : "for groceries, school fees..."}
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors ${inputBg}`}
          />
        </div>

        <button onClick={handleSend} disabled={!sendAmount || parseFloat(sendAmount) <= 0 || sending}
          aria-label={`Send ${sendAmount || 0} USD to ${selectedRecipient?.label || "recipient"}`}
          className={`w-full py-4 rounded-xl font-bold text-lg text-secondary transition-all hover:opacity-90 active:scale-[0.98] ${sendAmount && parseFloat(sendAmount) > 0 ? "bg-primary" : "bg-primary/40 cursor-not-allowed"}`}>
          {sending ? "SENDING..." : taglish ? "SURIIN AT MAGPADALA →" : "REVIEW & SEND →"}
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl mb-4 overflow-x-auto ${darkMode ? "bg-white/5" : "bg-black/5"}`} style={{ WebkitOverflowScrolling: "touch" }}>
        {[
          { key: "Transfer History", short: "History" },
          { key: "Rate Alerts", short: "Alerts" },
          { key: "Tools", short: "Tools" },
          { key: "Protection", short: "Protect" },
          { key: "Shipments", short: "Shipments" },
        ].map(({ key, short }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-shrink-0 flex-1 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap px-2 ${activeTab === key ? "bg-primary text-secondary" : muted}`}>
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{key}</span>
          </button>
        ))}
      </div>

      {activeTab === "Transfer History" && (
        <div>
          <h3 className="font-bold mb-3">{taglish ? "Mga Nakaraang Padala" : "Recent Transfers"}</h3>
          {transfers.length === 0 ? (
            <div className={`border rounded-xl p-6 text-center mb-6 ${card}`}>
              <p className={`text-sm ${muted}`}>{taglish ? "Wala pang padala. Magpadala na!" : "No transfers yet. Send your first padala!"}</p>
            </div>
          ) : (
            <div className="space-y-2 mb-6">
              {transfers.map((t, i) => (
                <button key={i} onClick={() => setTrackedTransfer(t)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left hover:border-primary/30 transition-colors ${card}`}>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black flex-shrink-0">
                    {t.recipient_name?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{t.recipient_name}</p>
                    <p className={`text-xs ${muted} truncate`}>{t.recipient_bank} · {new Date(t.created_date).toLocaleDateString()}</p>
                    {t.note && <p className={`text-xs ${muted} truncate italic`}>"{t.note}"</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm">${t.amount_usd}</p>
                    <span className={`text-[10px] font-bold uppercase ${t.status === "completed" ? "text-emerald-500" : "text-primary"}`}>{t.status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <h3 className="font-bold mb-3">{taglish ? "Naka-iskedyul na Bayad" : "Scheduled & Bills"}</h3>
          {scheduled.length === 0 ? (
            <div className={`border rounded-xl p-6 text-center ${card}`}>
              <p className="text-2xl mb-2">🔄</p>
              <p className={`text-sm font-semibold mb-3 ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>No auto-padala yet</p>
              <p className={`text-xs ${muted} mb-4`}>Set up a recurring transfer so your family never misses an allowance.</p>
              <button onClick={() => setShowScheduledForm(true)}
                className="bg-primary text-secondary font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
                + Set Up Auto-Padala
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {scheduled.map((s) => {
                const nextDay = s.day_of_month;
                const now = new Date();
                const nextDate = new Date(now.getFullYear(), nextDay <= now.getDate() ? now.getMonth() + 1 : now.getMonth(), nextDay);
                const nextLabel = nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <div key={s.id} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border ${card}`}>
                    <span className="text-2xl flex-shrink-0">{s.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{s.label}</p>
                      <p className={`text-xs ${muted}`}>Monthly · {s.day_of_month ? `${s.day_of_month}th · Next: ${nextLabel}` : "Active"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{s.currency === "PHP" ? "₱" : "$"}{s.amount?.toLocaleString()}</p>
                      <span className="text-primary text-[10px] font-bold uppercase">ACTIVE</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "Rate Alerts" && (
        <div className="space-y-4">
          {/* Live rate + sparkline */}
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2e00 60%, #8a6a00 100%)" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Live Rate · USD/PHP</p>
                <p className="text-white font-black text-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{ratesLoading ? "₱—.——" : `₱${rate.toFixed(2)}`}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={refetch} className="flex items-center gap-1 text-white/40 hover:text-white/70 text-xs transition-colors">
                  <RefreshCw className={`w-3 h-3 ${ratesLoading ? "animate-spin" : ""}`} /> Refresh
                </button>
                <button onClick={() => setShowAlertForm(!showAlertForm)} className="flex items-center gap-1.5 bg-primary text-secondary font-bold px-3 py-1.5 rounded-lg text-xs hover:opacity-90 transition-opacity">
                  <Bell className="w-3 h-3" /> New Alert
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={RATE_HISTORY} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs><linearGradient id="rg3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="date" hide />
                <Tooltip contentStyle={{ background: "#0d1526", border: "none", borderRadius: 8, color: "white", fontSize: 11 }} formatter={v => [`₱${v.toFixed(2)}`, "Rate"]} />
                {rateAlerts.filter(a => !a.triggered).map(a => <ReferenceLine key={a.id} y={a.target_rate} stroke="hsl(var(--primary))" strokeDasharray="4 3" strokeWidth={1.5} />)}
                <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fill="url(#rg3)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* New alert form */}
          {showAlertForm && (
            <div className="border rounded-2xl p-5 border-primary/30 bg-primary/5">
              <p className="text-primary text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><Bell className="w-3.5 h-3.5" /> New Rate Alert</p>
              <div className="flex gap-2 mb-3 flex-wrap">
                {PRESETS.map((p, i) => (
                  <button key={i} onClick={() => { setAlertTargetRate(String(p.rate)); setAlertDirection(p.direction); }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-primary/20 text-primary hover:bg-primary/10 transition-colors">{p.label}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {["above", "below"].map(d => (
                  <button key={d} onClick={() => setAlertDirection(d)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-bold text-sm transition-all ${alertDirection === d ? "border-primary bg-primary/10 text-primary" : `border-transparent ${darkMode ? "bg-white/5 text-white/50" : "bg-black/5 text-black/50"}`}`}>
                    {d === "above" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {d === "above" ? "Above ▲" : "Below ▼"}
                  </button>
                ))}
              </div>
              <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 mb-3 ${inputBg}`}>
                <span className="text-lg font-bold opacity-50">₱</span>
                <input type="number" inputMode="decimal" value={alertTargetRate} onChange={e => setAlertTargetRate(e.target.value)} placeholder={`e.g. ${(rate + (alertDirection === "above" ? 0.5 : -0.5)).toFixed(2)}`} className="flex-1 bg-transparent outline-none text-lg font-bold" step="0.01" />
                <span className="text-xs font-bold opacity-50">/ USD</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAlertForm(false)} className={`flex-1 py-2.5 rounded-xl border font-bold text-sm ${darkMode ? "border-white/10 text-white/50" : "border-black/10 text-black/50"} transition-colors`}>Cancel</button>
                <button onClick={handleCreateAlert} disabled={alertSaving || !alertTargetRate} className="flex-1 bg-primary text-secondary font-bold py-2.5 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {alertSaving ? "Saving..." : "Set Alert →"}
                </button>
              </div>
            </div>
          )}

          {/* Active alerts */}
          {rateAlerts.filter(a => !a.triggered).length > 0 && (
            <div className={`border rounded-2xl p-5 ${card}`}>
              <div className="flex items-center gap-2 mb-3"><Bell className="w-4 h-4 text-primary" /><h3 className="font-bold">Active Alerts</h3></div>
              <div className="space-y-2">
                {rateAlerts.filter(a => !a.triggered).map(alert => (
                  <div key={alert.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${darkMode ? "border-white/5" : "border-black/5"}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.direction === "above" ? "bg-emerald-500/10" : "bg-orange-500/10"}`}>
                      {alert.direction === "above" ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{alert.direction === "above" ? "Above" : "Below"} ₱{alert.target_rate}</p>
                      <p className={`text-xs ${muted}`}>{Math.abs(alert.target_rate - rate).toFixed(2)} away · email + in-app</p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mr-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE</span>
                    <button onClick={() => handleDeleteAlert(alert.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Triggered alerts */}
          {rateAlerts.filter(a => a.triggered).length > 0 && (
            <div className={`border rounded-2xl p-5 ${card}`}>
              <div className="flex items-center gap-2 mb-3"><CheckCircle className="w-4 h-4 text-emerald-500" /><h3 className="font-bold">Triggered</h3></div>
              <div className="space-y-2">
                {rateAlerts.filter(a => a.triggered).map(alert => (
                  <div key={alert.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{alert.direction === "above" ? "Above" : "Below"} ₱{alert.target_rate} — Hit!</p>
                      <p className={`text-xs ${muted}`}>Triggered {alert.triggered_at ? new Date(alert.triggered_at).toLocaleDateString() : ""}</p>
                    </div>
                    <button onClick={() => handleDeleteAlert(alert.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {rateAlerts.length === 0 && !showAlertForm && !alertsLoading && (
            <div className={`border rounded-2xl p-8 text-center ${card}`}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><Bell className="w-6 h-6 text-primary" /></div>
              <h3 className="font-extrabold text-lg mb-2">No alerts yet</h3>
              <p className={`text-sm ${muted} mb-4 max-w-xs mx-auto`}>Set a target rate and we'll notify you by email + in-app the moment USD/PHP hits it.</p>
              <button onClick={() => setShowAlertForm(true)} className="bg-primary text-secondary font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto">
                <Zap className="w-4 h-4" /> Set My First Alert
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "Tools" && (
        <div className="space-y-4">
          <CurrencyConverter darkMode={darkMode} />
          <div className={`border rounded-2xl p-5 ${card}`}>
            <h3 className="font-bold mb-3">More Tools</h3>
            <div className="space-y-2">
              {[
                { icon: "📊", label: "Rate Alerts", sub: "Set a target rate and get notified", action: () => setActiveTab("Rate Alerts") },
                { icon: "🔄", label: "Auto-Padala", sub: "Schedule recurring transfers automatically", action: () => setActiveTab("Transfer History") },
              ].map((tool, i) => (
                <button key={i} onClick={tool.action}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left hover:border-primary/30 transition-colors ${card}`}>
                  <span className="text-2xl">{tool.icon}</span>
                  <div><p className="font-semibold text-sm">{tool.label}</p><p className={`text-xs ${muted}`}>{tool.sub}</p></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Protection" && (
        <div className={`border rounded-2xl p-6 ${card}`}>
          <h3 className="font-bold mb-4">Transfer Protection</h3>
          <div className="space-y-3">
            {[
              { icon: "🔒", label: "Zero Liability Guarantee", sub: "100% protected against unauthorized transfers", active: true },
              { icon: "🛡️", label: "Fraud Monitoring", sub: "24/7 AI-powered transaction monitoring", active: true },
              { icon: "📋", label: "Transfer Insurance", sub: "Up to $10,000 insured per transfer", active: false },
            ].map((p, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${card}`}>
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1"><p className="font-semibold text-sm">{p.label}</p><p className={`text-xs ${muted}`}>{p.sub}</p></div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.active ? "bg-emerald-500/20 text-emerald-500" : "bg-orange-500/20 text-orange-500"}`}>
                  {p.active ? "ACTIVE" : "UPGRADE"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Shipments" && (
        <div className={`border rounded-2xl p-6 ${card}`}>
          <h3 className="font-bold mb-2">Balikbayan Box Tracker</h3>
          <p className={`text-sm ${muted} mb-4`}>Track your Balikbayan box shipments alongside your money transfers.</p>
          <div className={`text-center py-8 border border-dashed rounded-xl ${darkMode ? "border-white/10" : "border-black/10"}`}>
            <p className="text-3xl mb-2">📦</p>
            <p className={`text-sm ${muted} mb-3`}>No active shipments</p>
            <button onClick={() => alert("Balikbayan box tracking integration coming soon!")}
              className="bg-primary text-secondary font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors">
              + Add Shipment
            </button>
          </div>
        </div>
      )}
      {/* Auto-Padala form */}
      <AnimatePresence>
        {showScheduledForm && (
          <CreateScheduledForm
            darkMode={darkMode}
            onClose={() => setShowScheduledForm(false)}
            onCreated={() => base44.entities.ScheduledTransfer.filter({ is_active: true }).then(setScheduled).catch(() => {})}
          />
        )}
      </AnimatePresence>

      {/* Send animation */}
      <SendAnimation
        show={showSendAnim}
        amount={sendAnimData.amount}
        recipientName={sendAnimData.recipient}
        onDone={() => setShowSendAnim(false)}
      />

      {/* Transfer tracker */}
      <AnimatePresence>
        {trackedTransfer && (
          <TransferTracker transfer={trackedTransfer} onClose={() => setTrackedTransfer(null)} darkMode={darkMode} />
        )}
      </AnimatePresence>

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <TransferConfirmModal
            transfer={{
              amount: sendAmount,
              receive,
              rate,
              recipient: selectedRecipient?.nickname || selectedRecipient?.full_name || "Family",
              bank: selectedRecipient?.bank || "GCash",
            }}
            onConfirm={handleConfirmedSend}
            onClose={() => setShowConfirm(false)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>

      {/* Receipt modal */}
      <AnimatePresence>
        {completedTransfer && (
          <TransactionReceipt
            transfer={completedTransfer}
            onClose={() => setCompletedTransfer(null)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}