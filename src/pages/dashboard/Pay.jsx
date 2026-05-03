import { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Search, RefreshCw, Shield, Plus, Bell, Trash2, CheckCircle, TrendingUp, TrendingDown, Zap, AlertCircle } from "lucide-react";
import BestTimeToSend from "@/components/dashboard/BestTimeToSend";
import { base44 } from "@/api/base44Client";
import { useLiveRates } from "@/hooks/useLiveRates";
import TransferEstimator from "@/components/dashboard/TransferEstimator";
import { useToast } from "@/components/ui/use-toast";
import { processTransfer } from "@/functions/processTransfer";
import { haptic } from "@/utils/haptic";
import { sfx } from "@/utils/sounds";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { AnimatePresence } from "framer-motion";
import TransferConfirmModal from "@/components/transfer/TransferConfirmModal";
import SendAuthGate from "@/components/transfer/SendAuthGate";
import TransactionReceipt from "@/components/transfer/TransactionReceipt";
import CurrencyConverter from "@/components/pay/CurrencyConverter";
import SendAnimation from "@/components/transfer/SendAnimation";
import TransferTracker from "@/components/transfer/TransferTracker";
import NoRecipientsEmptyState from "@/components/pay/NoRecipientsEmptyState";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import CreateScheduledForm from "@/components/pay/CreateScheduledForm";

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

const PAY_TABS = ["Transfer History", "Rate Alerts"];

export default function Pay() {
  const { darkMode, taglish } = useOutletContext() || {};
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const [showScheduledForm, setShowScheduledForm] = useState(false);
  // Pre-fill from "Send Again" navigation
  const prefill = (() => {
    try { return new URLSearchParams(window.location.search); } catch { return new URLSearchParams(); }
  })();
  const [sendAmount, setSendAmount] = useState(prefill.get("amount") || "");
  const [amountError, setAmountError] = useState("");
  const LAST_RECIPIENT_KEY = "kf_last_recipient_id";
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
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [completedTransfer, setCompletedTransfer] = useState(null);
  const [showSendAnim, setShowSendAnim] = useState(false);
  const [sendAnimData, setSendAnimData] = useState({ amount: "", recipient: "" });
  const [trackedTransfer, setTrackedTransfer] = useState(null);
  const [activeTab, setActiveTab] = useState("Transfer History");
  const { rates, loading: ratesLoading, refetch, lastUpdatedLabel } = useLiveRates();
  const { toast } = useToast();
  // Rate alerts state
  const [rateAlerts, setRateAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertTargetRate, setAlertTargetRate] = useState("");
  const [alertDirection, setAlertDirection] = useState("above");
  const [alertSaving, setAlertSaving] = useState(false);
  const [alertUser, setAlertUser] = useState(null);
  const [kycRequired, setKycRequired] = useState(false);
  const triggeredRef = useRef(new Set());
  const rate = rates?.USDPHP || 56.24;
  const receive = sendAmount ? (parseFloat(sendAmount) * rate).toFixed(2) : "0.00";
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const inputBg = darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";

  // Re-check KYC whenever Pay page becomes visible (user may have completed it on Profile)
  useEffect(() => {
    base44.auth.me().catch(() => null).then(u => {
      if (u) setKycRequired(!u.onboarding_completed);
    });
  }, []);

  useEffect(() => {
    base44.entities.Transfer.filter({ category: "remittance" }, "-created_date", 10).then(setTransfers).catch(() => {});
    base44.entities.Recipient.list("-transfer_count", 6).then(r => {
    setRecipients(r);
    setRecipientsLoading(false);
    // Auto-select recipient if pre-filled from Send Again
    if (prefillName) {
      const match = r.find(rec =>
        (rec.full_name || "").toLowerCase() === prefillName.toLowerCase() ||
        (rec.nickname || "").toLowerCase() === prefillName.toLowerCase()
      );
      if (match) { setSelectedRecipient(match); return; }
    }
    // Restore last used recipient
    const lastId = localStorage.getItem(LAST_RECIPIENT_KEY);
    if (lastId) {
      const last = r.find(rec => rec.id === lastId);
      if (last) setSelectedRecipient(last);
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
      setKycRequired(!!(u && !u.onboarding_completed));
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

  // Format the raw amount string for display (Wise/Revolut style)
  const formatAmountDisplay = (raw) => {
    if (!raw) return "";
    const parts = raw.split(".");
    const intPart = parseInt(parts[0] || "0", 10).toLocaleString("en-US");
    if (parts.length === 2) return `${intPart}.${parts[1]}`;
    return intPart;
  };

  // Step 1: validate then show auth gate
  const handleSend = () => {
    const error = validateAmount(sendAmount);
    if (error) { setAmountError(error); return; }
    haptic.medium();
    setShowAuthGate(true);
  };

  // Step 1b: auth passed → show confirm modal
  const handleAuthPassed = () => {
    setShowAuthGate(false);
    setShowConfirm(true);
  };

  // Step 2: called after PIN confirmed
  const handleConfirmedSend = async () => {
    const amt = parseFloat(sendAmount);
    setSending(true);
    setShowConfirm(false);

    const recipientName = selectedRecipient?.nickname || selectedRecipient?.full_name || "Family";
    const recipientBank = selectedRecipient?.bank || "GCash";

    // Optimistic UI
    const optimisticId = `optimistic-${Date.now()}`;
    setTransfers(prev => [{
      id: optimisticId, amount_usd: amt, amount_php: parseFloat(receive),
      recipient_name: recipientName, recipient_bank: recipientBank,
      status: "pending", created_date: new Date().toISOString(),
    }, ...prev]);
    setSendAmount("");
    if (selectedRecipient?.id) localStorage.setItem(LAST_RECIPIENT_KEY, selectedRecipient.id);

    const res = await processTransfer({
      amount_usd: amt,
      recipient_id: selectedRecipient?.id,
      recipient_name: recipientName,
      recipient_bank: recipientBank,
      rate,
      note: transferNote || undefined,
      category: "remittance",
    });

    if (!res?.data?.success) {
      // Rollback optimistic update
      setTransfers(prev => prev.filter(t => t.id !== optimisticId));
      setSendAmount(String(amt));
      setSending(false);
      haptic.error();
      sfx.error();
      toast({
        title: res?.data?.kyc_required ? "KYC Required" : "Transfer failed",
        description: res?.data?.error || "Please try again.",
        variant: "destructive",
      });
      return;
    }

    const finalTransfer = res.data.transfer;
    setTransferNote("");
    setTransfers(prev => prev.map(t => t.id === optimisticId ? finalTransfer : t));
    haptic.success();
    sfx.success();

    // Send confirmation email
    const u = alertUser || await base44.auth.me().catch(() => null);
    if (u?.email) {
      base44.integrations.Core.SendEmail({
        to: u.email,
        from_name: "KinnectFi",
        subject: `✅ Transfer Confirmed — $${amt.toFixed(2)} to ${recipientName}`,
        body: `Hi ${u.full_name || "there"},\n\nYour transfer has been sent successfully!\n\n📤 Amount Sent: $${amt.toFixed(2)} USD\n🇵🇭 Received: ₱${parseFloat(receive).toLocaleString("en-PH", { minimumFractionDigits: 2 })} PHP\n👤 To: ${recipientName}\n🏦 Via: ${recipientBank}\n💱 Rate: ₱${rate.toFixed(2)}/USD\n💸 Fee: $0.00\n📋 Ref: ${finalTransfer.reference_id || "KF-" + finalTransfer.id?.slice(0,8).toUpperCase()}\n\nThank you for using KinnectFi — the neobank built for Filipino families.\n\n— The KinnectFi Team`,
      }).catch(() => {});
    }

    setSendAnimData({ amount: amt.toFixed(2), recipient: recipientName });
    setShowSendAnim(true);
    setCompletedTransfer(finalTransfer);
    setSending(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4" role="alert">
          <span className="text-xl flex-shrink-0">📶</span>
          <div>
            <p className="text-yellow-400 text-sm font-bold">You're offline</p>
            <p className="text-yellow-400/70 text-xs">Transfers are disabled until you reconnect.</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-base font-extrabold sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {taglish ? "Magpadala" : "Send Money"}
          </h1>
          <p className={`text-[11px] sm:text-xs ${muted}`}>{taglish ? "Mabilis at ligtas na padala" : "Fast, secure cross-border transfers"}</p>
        </div>
        <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-primary text-[9px] sm:text-[10px] font-bold">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}</span>
        </div>
      </div>

      {/* KYC gate banner */}
      {kycRequired && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 mb-4">
          <span className="text-orange-400 text-xl flex-shrink-0">🪪</span>
          <div className="flex-1">
            <p className="text-orange-400 text-sm font-bold">Identity Verification Required</p>
            <p className="text-orange-400/70 text-xs mt-0.5">Complete KYC in your profile to unlock transfers. This keeps your money safe.</p>
          </div>
          <button onClick={() => window.location.href = "/dashboard/profile"}
            className="text-orange-400 text-xs font-bold border border-orange-400/40 px-3 py-1.5 rounded-lg hover:bg-orange-400/10 flex-shrink-0">
            Verify →
          </button>
        </div>
      )}

      {/* Best Time to Send — intelligent rate-aware badge */}
      <BestTimeToSend rate={rate} ratesLoading={ratesLoading} darkMode={darkMode} taglish={taglish} />

      {/* Send form */}
      <div className={`border rounded-2xl p-3 sm:p-4 mb-4 ${card}`}>
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
              onClick={() => { setSendAmount(String(last.amount_usd)); setSelectedRecipient(recipients.find(r => r.full_name === last.recipient_name || r.nickname === last.recipient_name) || null); haptic.light(); }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border mb-4 text-left active:scale-[0.98] transition-all ${darkMode ? "border-primary/20 bg-primary/5 hover:border-primary/40" : "border-primary/15 bg-primary/4 hover:border-primary/35"}`}
            >
              <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                {last.recipient_name?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>Send again to {last.recipient_name}</p>
                <p className={`text-xs ${muted}`}>${last.amount_usd} · {daysSince === 0 ? "today" : daysSince === 1 ? "yesterday" : `${daysSince}d ago`}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-primary text-secondary font-bold text-xs px-3 py-2 rounded-xl flex-shrink-0">
                <span>Repeat</span><span>→</span>
              </div>
            </button>
          );
        })()}

        <div className="flex items-center gap-3 mb-4 overflow-x-auto" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
          <span className={`text-xs font-bold uppercase tracking-wider ${muted} flex-shrink-0`}>{taglish ? "Kamakailan:" : "Recent:"}</span>
          <div className="flex gap-2 flex-shrink-0">
            {recipientsLoading && [1,2,3,4].map(i => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`w-11 h-11 rounded-full animate-pulse ${darkMode ? "bg-white/10" : "bg-black/10"}`} />
                <div className={`w-10 h-2 rounded-full animate-pulse ${darkMode ? "bg-white/8" : "bg-black/8"}`} />
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
          <div className="mb-3 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 flex items-center gap-2 min-w-0">
            <span className="text-primary text-sm flex-shrink-0">✓</span>
            <span className="text-primary text-xs sm:text-sm font-bold truncate">
              {selectedRecipient.nickname || selectedRecipient.full_name} · {selectedRecipient.bank}
            </span>
          </div>
        )}

        {/* Revolut-style big amount display */}
        <div className={`rounded-2xl p-3 sm:p-5 mb-4 text-center ${darkMode ? "bg-white/3" : "bg-black/3"}`}>
          <label className={`text-[10px] font-bold uppercase tracking-widest ${muted} mb-1 block`}>{taglish ? "Ipadala (USD)" : "You Send (USD)"}</label>
          <div
            className={`text-4xl sm:text-5xl font-black mb-1 tracking-tight cursor-text ${darkMode ? "text-white" : "text-[#1a2a4a]"} ${amountError ? "text-red-400" : ""}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: 48 }}
          >
            {sendAmount ? `$${formatAmountDisplay(sendAmount)}` : <span className="opacity-20">$0</span>}
          </div>
          {/* Hidden native numeric input */}
          <input
            value={sendAmount}
            onChange={e => handleAmountChange(e.target.value)}
            inputMode="numeric"
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            placeholder="0"
            className="sr-only"
            aria-label="Amount to send in USD"
          />
          <div className={`h-px my-3 ${darkMode ? "bg-white/8" : "bg-black/8"}`} />
          <label className={`text-[10px] font-bold uppercase tracking-widest ${muted} mb-1 block`}>{taglish ? "Matatanggap (PHP)" : "They Receive (PHP)"}</label>
          <div className="text-3xl font-black text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            ₱{sendAmount ? parseFloat(receive).toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "0.00"}
          </div>
          {amountError && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs font-semibold">{amountError}</p>
            </div>
          )}
          <p className={`text-[10px] ${muted} mt-2`}>Min ${MIN_AMOUNT} · Max ${MAX_AMOUNT.toLocaleString()}</p>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[1,2,3,4,5,6,7,8,9,".",0,"⌫"].map((d, i) => (
            <button
              key={i}
              onClick={() => {
                if (d === "⌫") {
                  const next = sendAmount.slice(0, -1);
                  setSendAmount(next);
                  if (amountError) setAmountError(validateAmount(next));
                } else {
                  const next = String(sendAmount) + String(d);
                  if (d === "." && sendAmount.includes(".")) return;
                  if (sendAmount.includes(".") && sendAmount.split(".")[1]?.length >= 2) return;
                  handleAmountChange(next);
                }
              }}
              className={`h-11 sm:h-14 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-bold transition-all active:scale-95 select-none
                ${d === "⌫"
                  ? `${darkMode ? "text-white/50 bg-white/5" : "text-[#1a2a4a]/50 bg-black/5"}`
                  : `${darkMode ? "bg-white/8 text-white hover:bg-white/12" : "bg-black/6 text-[#1a2a4a] hover:bg-black/10"} border ${darkMode ? "border-white/5" : "border-black/5"}`
                }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className={`flex items-center justify-between py-2.5 border-t border-b ${darkMode ? "border-white/5" : "border-black/5"} mb-3`}>
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-3 h-3 text-primary ${ratesLoading ? "animate-spin" : ""}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${muted}`}>{taglish ? "Live na Palitan" : "Live Exchange Rate"}</span>
          </div>
          <div className="text-right">
          <span className={`font-bold text-sm ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>1 USD = {ratesLoading ? "..." : `${rate.toFixed(2)}`} PHP</span>
          {lastUpdatedLabel && <p className={`text-[9px] ${darkMode ? "text-white/30" : "text-black/30"} mt-0.5`}>Updated {lastUpdatedLabel}</p>}
        </div>
        </div>

        <div className="mb-3">
          <TransferEstimator sendAmount={sendAmount} rate={rate} darkMode={darkMode} taglish={taglish} />
        </div>

        {/* Note/memo field */}
        <div className="mb-3">
          <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1 block`}>{taglish ? "Mensahe (opsyonal)" : "Note (optional)"}</label>
          <input
            value={transferNote}
            onChange={e => setTransferNote(e.target.value)}
            placeholder={taglish ? "para sa pagkain, bayad ng kuryente..." : "for groceries, school fees..."}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors ${inputBg}`}
          />
        </div>

        <button onClick={handleSend} disabled={!sendAmount || parseFloat(sendAmount) <= 0 || sending || !isOnline || kycRequired}
          aria-label={`Send ${sendAmount || 0} USD to ${selectedRecipient?.label || "recipient"}`}
          className={`w-full py-3.5 rounded-xl font-bold text-sm sm:text-base text-secondary transition-all hover:opacity-90 active:scale-[0.98] ${sendAmount && parseFloat(sendAmount) > 0 && isOnline ? "bg-primary" : "bg-primary/40 cursor-not-allowed"}`}>
          {kycRequired ? "🪪 Complete KYC to Send" : !isOnline ? "📶 Offline — Reconnect to Send" : sending ? "Sending..." : taglish ? "Suriin at Magpadala →" : "Review & Send →"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4">
        {[
          { key: "Transfer History", icon: "🕐" },
          { key: "Rate Alerts",      icon: "🔔" },
        ].map(({ key, icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${activeTab === key ? "bg-primary text-secondary border-primary" : `${darkMode ? "border-white/10 text-white/50 bg-white/5" : "border-black/10 text-[#1a2a4a]/50 bg-black/5"}`}`}>
            <span>{icon}</span><span>{key}</span>
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
            <div className="overflow-hidden w-full" style={{ height: 60 }}>
            <ResponsiveContainer width="99%" height={60}>
              <AreaChart data={RATE_HISTORY} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs><linearGradient id="rg3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="date" hide />
                <Tooltip contentStyle={{ background: "#0d1526", border: "none", borderRadius: 8, color: "white", fontSize: 11 }} formatter={v => [`₱${v.toFixed(2)}`, "Rate"]} />
                {rateAlerts.filter(a => !a.triggered).map(a => <ReferenceLine key={a.id} y={a.target_rate} stroke="hsl(var(--primary))" strokeDasharray="4 3" strokeWidth={1.5} />)}
                <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fill="url(#rg3)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            </div>
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

      {activeTab === "_Tools_removed" && (
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

      {activeTab === "_Protection_removed" && (
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

      {activeTab === "_Shipments_removed" && (
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

      {/* Auth gate */}
      <AnimatePresence>
        {showAuthGate && (
          <SendAuthGate
            onAuthorized={handleAuthPassed}
            onCancel={() => setShowAuthGate(false)}
            darkMode={darkMode}
          />
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