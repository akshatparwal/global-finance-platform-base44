import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, AlertCircle, ChevronRight, RefreshCw, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedRate from "@/components/ui/AnimatedRate";
import { base44 } from "@/api/base44Client";
import { useLiveRates } from "@/hooks/useLiveRates";
import { useToast } from "@/components/ui/use-toast";
import { processTransfer } from "@/functions/processTransfer";
import { haptic } from "@/utils/haptic";
import { sfx } from "@/utils/sounds";
import TransferConfirmModal from "@/components/transfer/TransferConfirmModal";
import SendAuthGate from "@/components/transfer/SendAuthGate";
import TransactionReceipt from "@/components/transfer/TransactionReceipt";
import SendAnimation from "@/components/transfer/SendAnimation";
import TransferTracker from "@/components/transfer/TransferTracker";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { warmRateCache } from "@/functions/warmRateCache";

// Step IDs
const STEP_RECIPIENT = "recipient";
const STEP_AMOUNT = "amount";
const STEP_REVIEW = "review";

const RELATIONSHIP_LABELS = { mother: "Mother", father: "Father", sibling: "Sibling", spouse: "Spouse", child: "Child", friend: "Friend", other: "" };

export default function Pay() {
  const { darkMode } = useOutletContext() || {};
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(STEP_RECIPIENT);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [phpAmount, setPhpAmount] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [completedTransfer, setCompletedTransfer] = useState(null);
  const [showSendAnim, setShowSendAnim] = useState(false);
  const [sendAnimData, setSendAnimData] = useState({ amount: "", recipient: "" });
  const [trackedTransfer, setTrackedTransfer] = useState(null);
  const [alertUser, setAlertUser] = useState(null);
  const [kycRequired, setKycRequired] = useState(false);

  const { rates, loading: ratesLoading, lastUpdatedLabel } = useLiveRates();
  const rate = rates?.USDPHP || 56.24;

  // Derived amounts
  const phpVal = parseFloat(phpAmount) || 0;
  const usdAmount = phpVal > 0 ? (phpVal / rate).toFixed(2) : "0.00";

  const muted = "text-[#0D1F3C]/40";

  useEffect(() => {
    warmRateCache({}).catch(() => {});
    base44.entities.Transfer.filter({ category: "remittance" }, "-created_date", 10).then(setTransfers).catch(() => {});
    base44.auth.me().catch(() => null).then(u => { if (u) { setAlertUser(u); setKycRequired(!u.onboarding_completed); } });
    base44.entities.Recipient.list("-transfer_count", 20).then(r => {
      setRecipients(r);
      setRecipientsLoading(false);
    }).catch(() => setRecipientsLoading(false));
  }, []);

  const handleSelectRecipient = (r) => {
    setSelectedRecipient(r);
    setStep(STEP_AMOUNT);
    haptic.light();
  };

  const handleContinueToReview = () => {
    if (!phpVal || phpVal <= 0) return;
    setStep(STEP_REVIEW);
  };

  const handleSend = () => {
    haptic.medium();
    setShowAuthGate(true);
  };

  const handleAuthPassed = () => {
    setShowAuthGate(false);
    setShowConfirm(true);
  };

  const handleConfirmedSend = async () => {
    const amt = parseFloat(usdAmount);
    setSending(true);
    setShowConfirm(false);

    const recipientName = selectedRecipient?.nickname || selectedRecipient?.full_name || "Family";
    const recipientBank = selectedRecipient?.bank || "GCash";

    const optimisticId = `optimistic-${Date.now()}`;
    setTransfers(prev => [{
      id: optimisticId, amount_usd: amt, amount_php: phpVal,
      recipient_name: recipientName, recipient_bank: recipientBank,
      status: "pending", created_date: new Date().toISOString(),
    }, ...prev]);

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
      setTransfers(prev => prev.filter(t => t.id !== optimisticId));
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

    const u = alertUser || await base44.auth.me().catch(() => null);
    if (u?.email) {
      base44.integrations.Core.SendEmail({
        to: u.email,
        from_name: "KinnectFi",
        subject: `✅ Transfer Confirmed — ₱${phpVal.toLocaleString()} to ${recipientName}`,
        body: `Hi ${u.full_name || "there"},\n\nYour transfer was sent!\n\n₱${phpVal.toLocaleString()} PHP to ${recipientName} via ${recipientBank}\nYou paid: $${amt}\nRate: ₱${rate.toFixed(2)}/USD · Fee: $0.00\n\n— The KinnectFi Team`,
      }).catch(() => {});
    }

    setSendAnimData({ amount: phpVal.toLocaleString(), recipient: recipientName });
    setShowSendAnim(true);
    setCompletedTransfer(finalTransfer);
    setPhpAmount("");
    setStep(STEP_RECIPIENT);
    setSending(false);
  };

  // ── STEP 1: PICK RECIPIENT ──
  const renderRecipient = () => (
    <div className="max-w-lg mx-auto">
      {/* KYC gate */}
      {kycRequired && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 mb-5">
          <span className="text-orange-500 text-xl flex-shrink-0">🪪</span>
          <div className="flex-1">
            <p className="text-orange-700 text-sm font-bold">Identity Verification Required</p>
            <p className="text-orange-600/70 text-xs mt-0.5">Complete KYC to unlock transfers.</p>
          </div>
          <button onClick={() => navigate("/dashboard/profile")}
            className="text-orange-600 text-xs font-bold border border-orange-300 px-3 py-1.5 rounded-lg flex-shrink-0">
            Verify →
          </button>
        </div>
      )}

      <h1 className="text-2xl font-black text-[#0D1F3C] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Who are you<br />sending to?
      </h1>
      <p className={`text-sm ${muted} mb-6`}>Free transfers, every time. Funds land in their PH bank account in seconds.</p>

      {/* Saved recipients */}
      {(recipientsLoading || recipients.length > 0) && (
        <>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-3`}>Saved recipients</p>
          <div className="space-y-2 mb-6">
            {recipientsLoading && [1,2,3].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-[#0D1F3C]/5 animate-pulse" />
            ))}
            {recipients.map(r => {
              const initials = (r.nickname || r.full_name || "?").slice(0, 2).toUpperCase();
              const rel = RELATIONSHIP_LABELS[r.relationship] || "";
              const lastTx = transfers.find(t => t.recipient_name === r.full_name || t.recipient_name === r.nickname);
              return (
                <button key={r.id} onClick={() => handleSelectRecipient(r)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-[#0D1F3C]/8 rounded-2xl text-left hover:border-primary/40 hover:shadow-sm active:scale-[0.99] transition-all">
                  <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-bold text-[#0D1F3C] text-sm">{r.nickname || r.full_name}</p>
                      {rel && <span className="text-[#0D1F3C]/35 text-xs">· {rel}</span>}
                    </div>
                    <p className={`text-xs ${muted}`}>{r.bank}{r.account_number ? ` ••••${r.account_number.slice(-4)}` : ""}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="text-emerald-600 text-[10px] font-semibold">Verified · name matches</span>
                    </div>
                  </div>
                  {lastTx && (
                    <div className="text-right flex-shrink-0">
                      <p className={`text-[10px] ${muted}`}>Last sent</p>
                      <p className="text-[#0D1F3C] text-sm font-bold">₱{Number(lastTx.amount_php || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Send to someone new */}
      <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-3`}>Send to someone new</p>
      <div className="space-y-2 mb-6">
        <button onClick={() => navigate("/dashboard/recipients")}
          className="w-full flex items-center gap-3 px-4 py-4 bg-white border border-[#0D1F3C]/8 rounded-2xl text-left hover:border-primary/30 active:scale-[0.99] transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#0D1F3C]/5 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🏦</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#0D1F3C] text-sm">Add a PH bank account</p>
            <p className={`text-xs ${muted}`}>BPI, BDO, Metrobank, UnionBank, others</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#0D1F3C]/25 flex-shrink-0" />
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-4 bg-white border border-[#0D1F3C]/8 rounded-2xl text-left opacity-60">
          <div className="w-10 h-10 rounded-xl bg-[#0D1F3C]/5 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-[#0D1F3C]/40" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#0D1F3C] text-sm">Send to a phone number</p>
            <p className={`text-xs ${muted}`}>GCash or Maya — coming soon</p>
          </div>
        </button>
      </div>

      {/* Trust note */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0D1F3C]/4">
        <span className="text-sm flex-shrink-0">🔒</span>
        <p className={`text-xs ${muted}`}>Real-time verification with PH banks. Recipient gets a notification before funds land.</p>
      </div>

      {/* Recent transfers */}
      {transfers.length > 0 && (
        <div className="mt-6">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-3`}>Recent transfers</p>
          <div className="space-y-2">
            {transfers.slice(0, 3).map((t, i) => (
              <button key={i} onClick={() => setTrackedTransfer(t)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[#0D1F3C]/8 rounded-xl text-left hover:border-primary/20 transition-all">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                  {(t.recipient_name || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0D1F3C] text-sm">{t.recipient_name}</p>
                  <p className={`text-xs ${muted}`}>{t.recipient_bank} · {new Date(t.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-[#0D1F3C]">₱{Number(t.amount_php || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}</p>
                  <span className={`text-[10px] font-bold ${t.status === "completed" ? "text-emerald-600" : "text-primary"}`}>{t.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── STEP 2: ENTER AMOUNT (PHP-FIRST) ──
  const renderAmount = () => (
    <div className="max-w-lg mx-auto">
      <button onClick={() => setStep(STEP_RECIPIENT)} className="flex items-center gap-1.5 text-[#0D1F3C]/50 text-sm mb-4 hover:text-[#0D1F3C] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Recipient header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
          {(selectedRecipient?.nickname || selectedRecipient?.full_name || "?").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-black text-[#0D1F3C] text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {selectedRecipient?.full_name || selectedRecipient?.nickname}
          </p>
          <p className={`text-xs ${muted}`}>{selectedRecipient?.bank}{selectedRecipient?.account_number ? ` ••••${selectedRecipient.account_number.slice(-4)}` : ""}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-600 text-[10px] font-semibold">Verified</span>
          </div>
        </div>
      </div>

      {/* PHP amount input — primary */}
      <div className="bg-white border border-[#0D1F3C]/8 rounded-2xl p-6 mb-4 text-center">
        <p className={`text-[11px] font-bold uppercase tracking-wider ${muted} mb-3`}>
          {selectedRecipient?.nickname || (selectedRecipient?.full_name?.split(" ")[0])} receives
        </p>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-4xl font-black text-[#0D1F3C]/25" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>₱</span>
          <input
            value={phpAmount}
            onChange={e => setPhpAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            inputMode="decimal"
            type="number"
            placeholder="0"
            autoFocus
            className="text-4xl font-black text-[#0D1F3C] bg-transparent outline-none border-none w-full text-center"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: 52, WebkitAppearance: "none" }}
          />
        </div>
        <div className="h-px bg-[#0D1F3C]/8 my-3" />
        <p className={`text-xs ${muted} mb-1`}>You pay</p>
        <p className="text-2xl font-black text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ${usdAmount}
        </p>
      </div>

      {/* Rate row */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-[#0D1F3C]/8 rounded-xl mb-3">
        <div className="flex items-center gap-2">
          <RefreshCw className={`w-3 h-3 text-primary ${ratesLoading ? "animate-spin" : ""}`} />
          <span className={`text-xs font-semibold ${muted}`}>Mid-market rate · no fees</span>
        </div>
        <span className="text-[#0D1F3C] text-sm font-bold">
          1 USD = <AnimatedRate value={rate} prefix="₱" decimals={2} />
        </span>
      </div>

      {/* Feature callouts */}
      <div className="space-y-2 mb-5">
        {[
          { icon: "⚡", title: "Delivers in seconds", sub: "Real-time via InstaPay rails" },
          { icon: "🆓", title: "Free, every time", sub: "No remittance fee. Mid-market rate, locked at confirm." },
          { icon: "🔔", title: `${selectedRecipient?.nickname || "Recipient"} gets notified`, sub: `She'll see the transfer before it lands.` },
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-base flex-shrink-0">{f.icon}</span>
            <div>
              <p className="text-[#0D1F3C] text-xs font-semibold">{f.title}</p>
              <p className={`text-xs ${muted}`}>{f.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <input
        value={transferNote}
        onChange={e => setTransferNote(e.target.value)}
        placeholder="Add a note (optional)"
        className="w-full border border-[#0D1F3C]/10 bg-white rounded-xl px-4 py-3 text-sm outline-none focus:border-primary text-[#0D1F3C] placeholder-[#0D1F3C]/30 mb-4"
      />

      <motion.button
        onClick={handleContinueToReview}
        disabled={!phpVal || phpVal <= 0 || !isOnline || kycRequired}
        animate={{ opacity: phpVal > 0 && isOnline && !kycRequired ? 1 : 0.35 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-2xl font-bold text-base text-white bg-primary disabled:cursor-not-allowed"
      >
        {kycRequired ? "🪪 Complete KYC to Send" : !isOnline ? "📶 Offline" : "Continue →"}
      </motion.button>
    </div>
  );

  // ── STEP 3: REVIEW ──
  const renderReview = () => (
    <div className="max-w-lg mx-auto">
      <button onClick={() => setStep(STEP_AMOUNT)} className="flex items-center gap-1.5 text-[#0D1F3C]/50 text-sm mb-4 hover:text-[#0D1F3C] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h2 className="text-xl font-black text-[#0D1F3C] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Review send</h2>
      <p className={`text-sm ${muted} mb-5`}>One last look — tap confirm to lock your rate.</p>

      {/* Big amount */}
      <div className="bg-white border border-[#0D1F3C]/8 rounded-2xl p-6 mb-4 text-center">
        <p className={`text-xs ${muted} mb-1`}>{selectedRecipient?.nickname || selectedRecipient?.full_name?.split(" ")[0]} receives</p>
        <p className="text-4xl font-black text-[#0D1F3C] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          ₱{phpVal.toLocaleString("en-PH")}
        </p>
        <p className={`text-sm ${muted}`}>You pay <strong className="text-[#0D1F3C]">${usdAmount}</strong> · 1 USD = ₱{rate.toFixed(2)}</p>
      </div>

      {/* Details */}
      <div className="bg-white border border-[#0D1F3C]/8 rounded-2xl overflow-hidden mb-5">
        {[
          { label: "Sending to", value: selectedRecipient?.full_name || selectedRecipient?.nickname, badge: true },
          { label: "Relationship", value: RELATIONSHIP_LABELS[selectedRecipient?.relationship] || "—" },
          { label: "Bank", value: selectedRecipient?.bank || "—" },
          { label: "Account", value: selectedRecipient?.account_number ? `••••${selectedRecipient.account_number.slice(-4)}` : "—" },
          { label: "Rails", value: "InstaPay (real-time)" },
          { label: "Exchange rate", value: `1 USD = ₱${rate.toFixed(2)}` },
          { label: "KinnectFi fee", value: "$0.00", green: true },
          { label: "Estimated arrival", value: "In seconds" },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 border-b last:border-0 border-[#0D1F3C]/6">
            <span className={`text-sm ${muted}`}>{row.label}</span>
            <div className="flex items-center gap-2">
              {row.badge && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              <span className={`text-sm font-semibold ${row.green ? "text-emerald-600" : "text-[#0D1F3C]"}`}>{row.value}</span>
            </div>
          </div>
        ))}
      </div>

      {transferNote && (
        <div className="px-4 py-3 bg-[#0D1F3C]/4 rounded-xl mb-4">
          <p className={`text-xs ${muted}`}>Note: <span className="text-[#0D1F3C]">{transferNote}</span></p>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending || !isOnline}
        className="w-full py-4 rounded-2xl font-bold text-base text-white bg-primary disabled:opacity-40 active:scale-[0.98] transition-all"
      >
        {sending ? "Sending..." : "Lock rate & confirm →"}
      </button>
      <p className={`text-center text-xs ${muted} mt-3`}>Rate will lock when you confirm</p>
    </div>
  );

  return (
    <div className="pb-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: step === STEP_RECIPIENT ? -20 : 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {step === STEP_RECIPIENT && renderRecipient()}
          {step === STEP_AMOUNT && renderAmount()}
          {step === STEP_REVIEW && renderReview()}
        </motion.div>
      </AnimatePresence>

      {/* Send animation */}
      <SendAnimation show={showSendAnim} amount={sendAnimData.amount} recipientName={sendAnimData.recipient} onDone={() => setShowSendAnim(false)} />

      <AnimatePresence>
        {trackedTransfer && <TransferTracker transfer={trackedTransfer} onClose={() => setTrackedTransfer(null)} darkMode={darkMode} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAuthGate && <SendAuthGate onAuthorized={handleAuthPassed} onCancel={() => setShowAuthGate(false)} darkMode={darkMode} />}
      </AnimatePresence>
      <AnimatePresence>
        {showConfirm && (
          <TransferConfirmModal
            transfer={{ amount: usdAmount, receive: phpAmount, rate, recipient: selectedRecipient?.nickname || selectedRecipient?.full_name || "Family", bank: selectedRecipient?.bank || "GCash" }}
            onConfirm={handleConfirmedSend}
            onClose={() => setShowConfirm(false)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {completedTransfer && <TransactionReceipt transfer={completedTransfer} onClose={() => setCompletedTransfer(null)} darkMode={darkMode} />}
      </AnimatePresence>
    </div>
  );
}