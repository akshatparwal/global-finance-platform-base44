import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Snowflake, Eye, EyeOff, CreditCard as CardIcon, Wifi, Key, DollarSign, Zap, AlertTriangle, Plus, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TIERS = [
  { name: "SUGO", threshold: "$0", reached: true },
  { name: "BAYANI", threshold: "$10k", reached: true },
  { name: "DATU", threshold: "$50k", reached: false },
  { name: "LAKAN", threshold: "$100k", reached: false },
];

const SUBSCRIPTIONS = [
  { emoji: "📺", label: "iWantTFC", sub: "ABS-CBN Streaming · Renews May 1", amount: "$5.99" },
  { emoji: "🎬", label: "Viu Premium", sub: "K-Drama & Filipino Shows · Renews Apr 28", amount: "$4.99" },
  { emoji: "🛍️", label: "Lazada+", sub: "Free Shipping & Vouchers · Renews Apr 25", amount: "$2.99" },
  { emoji: "🎵", label: "Spotify", sub: "Music & Podcasts · Renews Apr 20", amount: "$9.99" },
];

const CARD_TABS = ["My Card", "Loyalty", "Controls", "Subscriptions"];

// Simple bottom sheet modal
function BottomSheet({ open, onClose, title, children, darkMode }) {
  if (!open) return null;
  const bg = darkMode ? "bg-[#1a2332]" : "bg-white";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative ${bg} rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`font-extrabold text-lg ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Cards() {
  const { darkMode, taglish } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState("My Card");
  const [issued, setIssued] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [contactless, setContactless] = useState(true);
  const [instantSettlement, setInstantSettlement] = useState(false);
  const [user, setUser] = useState(null);

  // Modal states
  const [sheet, setSheet] = useState(null); // { type, ... }
  const [pinInput, setPinInput] = useState("");
  const [limitInput, setLimitInput] = useState("");
  const [familyNameInput, setFamilyNameInput] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const textMain = darkMode ? "text-white" : "text-[#1a2a4a]";
  const inputBg = darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const cardholderName = user?.full_name?.toUpperCase() || "KINNECTFI USER";

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleOrderPhysical = () => setSheet({ type: "orderPhysical" });
  const handleChangePin = () => { setPinInput(""); setSheet({ type: "changePin" }); };
  const handleSpendingLimit = () => { setLimitInput(""); setSheet({ type: "spendingLimit" }); };
  const handleReportStolen = () => setSheet({ type: "reportStolen" });
  const handleAddFamilyCard = () => { setFamilyNameInput(""); setSheet({ type: "addFamily" }); };

  const closeSheet = () => setSheet(null);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-lg font-extrabold sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{taglish ? "Mga Kard" : "Cards"}</h1>
        <p className={`text-xs ${muted}`}>{taglish ? "Pamahalaan ang iyong mga panandaliang susi" : "Manage your financial keys"}</p>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-xl text-sm font-bold animate-bounce">
          <Check className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Card visual */}
      <div className="flex justify-center mb-6">
        <div className={`w-72 h-44 rounded-2xl relative overflow-hidden shadow-2xl transition-all duration-300 ${frozen ? "grayscale opacity-60" : ""}`}
          style={{ background: "linear-gradient(135deg, #0d1a3a 0%, #1a2a4a 40%, #2a1a00 100%)" }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 70% 60%, rgba(201,160,80,0.4) 0%, transparent 60%)" }} />
          <div className="p-5 h-full flex flex-col justify-between relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-primary/30 rounded-sm" />
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{frozen ? "🔒 FROZEN" : "VIRTUAL"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Wifi className={`w-3 h-3 ${contactless ? "text-white/60" : "text-white/20"}`} />
                <span className="text-white/40 text-[9px] font-bold tracking-widest">KINNECTFI</span>
              </div>
            </div>
            <div className="text-center">
              {issued && showDetails ? (
                <p className="font-mono text-white text-sm tracking-widest">4582 8821 9341 7291</p>
              ) : (
                <p className={`font-bold text-lg ${issued ? "text-white" : "text-white/40 italic"}`}>
                  {issued ? "$150.00" : "Not yet issued"}
                </p>
              )}
              {!issued && <p className="text-white/20 text-xs">Issue card to reveal</p>}
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/30 text-[8px] uppercase tracking-widest mb-0.5">Cardholder</p>
                <p className="text-white/70 text-xs font-bold uppercase">{cardholderName}</p>
              </div>
              <div className="flex gap-2 text-white/30 text-[8px]">
                {issued && showDetails ? <span>EXP<br />12/28</span> : <span>EXP<br />—/—</span>}
                {issued && showDetails ? <span>CVV<br />493</span> : <span>CVV<br />—</span>}
              </div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-red-500/80" />
                <div className="w-6 h-6 rounded-full bg-yellow-500/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issue button */}
      <button onClick={() => { setIssued(!issued); if (issued) setShowDetails(false); }}
        className="w-full flex items-center justify-center gap-2 bg-[#0d1526] text-white font-bold py-4 rounded-xl mb-3 hover:bg-[#1a2a4a] transition-colors active:scale-[0.98]">
        <Plus className="w-4 h-4" /> {issued ? "✓ Card Issued" : "+ Issue Virtual Card"}
      </button>

      <div className="flex gap-2 justify-center mb-4 flex-wrap">
        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">✦ CURRENT TIER: BAYANI</span>
        <span className={`${darkMode ? "bg-white/5 text-white/50" : "bg-black/5 text-black/50"} text-xs font-bold px-3 py-1 rounded-full`}>🛡 ZERO LIABILITY</span>
      </div>

      <button onClick={handleOrderPhysical}
        className={`w-full flex items-center justify-center gap-2 border rounded-xl py-4 font-bold text-sm mb-6 active:scale-[0.98] transition-all ${darkMode ? "border-white/10 text-white/70 hover:bg-white/5" : "border-black/10 text-[#1a2a4a]/70 hover:bg-black/5"}`}>
        <CardIcon className="w-4 h-4 text-primary" /> {taglish ? "Mag-order ng Pisikal na Kard" : "Order Physical Card"}
      </button>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
        {CARD_TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-shrink-0 flex-1 min-w-[72px] py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === t ? "border-primary text-primary" : `border-transparent ${muted}`}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "My Card" && (
        <div className="space-y-3">
          {[
            {
              icon: frozen ? Snowflake : Snowflake,
              label: frozen ? "Unfreeze Card" : "Freeze Card",
              color: "text-blue-400",
              action: () => { setFrozen(!frozen); showSuccess(frozen ? "Card unfrozen! Transactions re-enabled." : "Card frozen! All transactions disabled."); }
            },
            {
              icon: showDetails ? EyeOff : Eye,
              label: showDetails ? "Hide Details" : "Show Card Details",
              color: "text-purple-400",
              action: () => {
                if (!issued) { setSheet({ type: "notIssued" }); return; }
                setShowDetails(!showDetails);
              }
            },
            {
              icon: CardIcon,
              label: taglish ? "Mag-order ng Pisikal na Kard" : "Order Physical Card",
              color: "text-primary",
              action: handleOrderPhysical
            }
          ].map((a, i) => (
            <button key={i} onClick={a.action}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl border font-semibold text-sm transition-all active:scale-[0.98] ${darkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-black/5 text-[#1a2a4a]"}`}>
              <a.icon className={`w-4 h-4 ${a.color}`} />{a.label}
            </button>
          ))}
          <div className={`border rounded-2xl p-5 mt-4 ${card}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-primary text-lg">👨‍👩‍👧</span>
              <h3 className="font-bold">{taglish ? "Mga Kard ng Pamilya" : "Family Cards"}</h3>
              <button onClick={handleAddFamilyCard} className="ml-auto text-primary text-xs font-bold hover:underline py-1 px-2">+ ADD NEW</button>
            </div>
            <p className={`text-xs ${muted}`}>{taglish ? "Magdagdag ng miyembro ng pamilya para sa shared na kard." : "Add family members to share a spending card."}</p>
          </div>
        </div>
      )}

      {activeTab === "Loyalty" && (
        <div className="rounded-2xl p-6 bg-[#0d1526] border border-white/10">
          <div className="flex justify-between items-start mb-4 gap-3">
            <div>
              <h3 className="text-white font-extrabold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>KinnectFi Tiers</h3>
              <p className="text-white/50 text-sm">Elevate your status as a global provider.</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white/40 text-xs mb-0.5">Lifetime Padala</p>
              <p className="text-white font-black text-lg">$12,450</p>
              <p className="text-white/40 text-xs">Tier: BAYANI</p>
            </div>
          </div>
          {/* Tier progress — horizontal scroll on very small screens */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
            {TIERS.map((t, i) => (
              <div key={i} className="flex-shrink-0 text-center min-w-[60px]">
                <div className={`w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center font-bold text-sm ${t.reached ? "bg-primary text-secondary" : "bg-white/10 text-white/40"}`}>
                  {t.reached ? "✓" : i + 1}
                </div>
                <p className={`text-[10px] font-bold ${t.reached ? "text-primary" : "text-white/30"}`}>{t.name}</p>
                <p className="text-white/20 text-[9px]">{t.threshold}</p>
              </div>
            ))}
          </div>
          {/* Perks — stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { name: "BAYANI PERKS", perks: ["0.5% Cash rebate on all Padala", "Priority PH support line"] },
              { name: "DATU PERKS", perks: ["1.0% Cash rebate on all Padala", "Free lounge access at NAIA"] },
              { name: "LAKAN EXCELLENCE", perks: ["1.5% Cash rebate on all Padala", "Personal Kinnect concierge"] }
            ].map((t, i) => (
              <div key={i} className={`rounded-xl p-3 ${i === 0 ? "border border-primary/40 bg-primary/10" : "bg-white/5"}`}>
                <p className={`text-[10px] font-black uppercase mb-2 ${i === 0 ? "text-primary" : "text-white/50"}`}>{t.name}</p>
                {t.perks.map((p, j) => <p key={j} className="text-white/60 text-xs flex gap-1 mb-1"><span className="text-primary flex-shrink-0">✓</span>{p}</p>)}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Controls" && (
        <div className={`border rounded-2xl p-5 ${card}`}>
          <h3 className={`font-bold mb-4 ${textMain}`}>{taglish ? "Kontrol ng Kard" : "Card Controls"}</h3>
          <div className="space-y-1">
            {[
              { icon: Snowflake, label: "Freeze Card", sub: "Temporarily disable all transactions", type: "toggle", color: "text-blue-400", value: frozen, set: () => { setFrozen(!frozen); showSuccess(frozen ? "Card unfrozen!" : "Card frozen!"); } },
              { icon: Wifi, label: "Contactless Pay", sub: "Tap-to-pay functionality", type: "toggle", color: "text-blue-500", value: contactless, set: () => setContactless(!contactless) },
              { icon: Zap, label: "Instant Settlement", sub: "Settle transfers in seconds, not days", type: "toggle", color: "text-yellow-500", value: instantSettlement, set: () => setInstantSettlement(!instantSettlement), badge: "BETA" },
            ].map((c, i) => (
              <div key={i} className={`flex items-center justify-between py-4 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <c.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.color}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold text-sm ${textMain}`}>{c.label}</p>
                      {c.badge && <span className="bg-orange-500/20 text-orange-500 text-[9px] font-bold px-1.5 py-0.5 rounded">{c.badge}</span>}
                    </div>
                    <p className={`text-xs ${muted}`}>{c.sub}</p>
                  </div>
                </div>
                <button onClick={c.set}
                  className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ml-3 ${c.value ? "bg-primary" : darkMode ? "bg-white/20" : "bg-black/20"} relative`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${c.value ? "left-7" : "left-1"}`} />
                </button>
              </div>
            ))}

            {[
              { icon: Key, label: "Card PIN", sub: "Change 4-digit security PIN", btnLabel: "Change", action: handleChangePin },
              { icon: DollarSign, label: "Spending Limit", sub: "$5,000/month", btnLabel: "Edit", action: handleSpendingLimit },
            ].map((c, i) => (
              <div key={i} className={`flex items-center justify-between py-4 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <div className="flex items-start gap-3">
                  <c.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${muted}`} />
                  <div><p className={`font-semibold text-sm ${textMain}`}>{c.label}</p><p className={`text-xs ${muted}`}>{c.sub}</p></div>
                </div>
                <button onClick={c.action}
                  className={`text-sm font-bold px-4 py-2 rounded-xl border flex-shrink-0 ml-3 active:scale-95 transition-all ${darkMode ? "border-white/20 hover:bg-white/5 text-white" : "border-black/20 hover:bg-black/5 text-[#1a2a4a]"}`}>
                  {c.btnLabel}
                </button>
              </div>
            ))}

            <div className={`flex items-center justify-between py-4 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                <div><p className="font-semibold text-sm text-red-500">Report Stolen</p><p className={`text-xs ${muted}`}>Freeze and replace card</p></div>
              </div>
              <button onClick={handleReportStolen} className="text-red-500 text-sm font-bold px-4 py-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 active:scale-95 transition-all flex-shrink-0 ml-3">Report</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Subscriptions" && (
        <div className={`border rounded-2xl p-5 ${card}`}>
          <h3 className={`font-bold mb-1 ${textMain}`}>Subscriptions · <span className={muted}>Mga Serbisyo</span></h3>
          <div className="space-y-1 mt-4">
            {SUBSCRIPTIONS.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 py-4 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <span className="text-2xl flex-shrink-0">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${textMain}`}>{s.label}</p>
                  <p className={`text-xs ${muted} truncate`}>{s.sub}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-sm ${textMain}`}>{s.amount}</p>
                  <button onClick={() => setSheet({ type: "cancelSub", label: s.label })}
                    className="text-red-400 text-xs font-bold hover:underline py-1">Cancel</button>
                </div>
              </div>
            ))}
          </div>
          <div className={`flex justify-between items-center pt-4 mt-2 border-t ${darkMode ? "border-white/10" : "border-black/10"}`}>
            <span className={`font-bold text-sm ${textMain}`}>MONTHLY TOTAL</span>
            <span className="text-primary font-black text-lg">$23.96</span>
          </div>
        </div>
      )}

      {/* ── Bottom Sheets ── */}
      <BottomSheet open={sheet?.type === "orderPhysical"} onClose={closeSheet} title="Order Physical Card" darkMode={darkMode}>
        <p className={`text-sm mb-6 ${darkMode ? "text-white/60" : "text-black/60"}`}>Your card will be delivered in 5–10 business days to your registered address. You will receive a tracking number via email.</p>
        <button onClick={() => { closeSheet(); showSuccess("Physical card requested! Check your email for tracking."); }}
          className="w-full bg-primary text-secondary font-bold py-4 rounded-xl">Confirm Order →</button>
      </BottomSheet>

      <BottomSheet open={sheet?.type === "notIssued"} onClose={closeSheet} title="Card Not Issued" darkMode={darkMode}>
        <p className={`text-sm mb-6 ${darkMode ? "text-white/60" : "text-black/60"}`}>Please issue your virtual card first before viewing card details.</p>
        <button onClick={closeSheet} className="w-full bg-primary text-secondary font-bold py-4 rounded-xl">Got it</button>
      </BottomSheet>

      <BottomSheet open={sheet?.type === "changePin"} onClose={closeSheet} title="Change PIN" darkMode={darkMode}>
        <p className={`text-sm mb-4 ${darkMode ? "text-white/60" : "text-black/60"}`}>Enter your new 4-digit PIN.</p>
        <input
          type="password" inputMode="numeric" maxLength={4} value={pinInput}
          onChange={e => setPinInput(e.target.value.replace(/\D/g, ""))}
          placeholder="••••"
          className={`w-full border rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-widest outline-none focus:border-primary mb-4 ${darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/20" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"}`}
        />
        <button
          disabled={pinInput.length !== 4}
          onClick={() => { closeSheet(); showSuccess("PIN changed successfully!"); }}
          className="w-full bg-primary text-secondary font-bold py-4 rounded-xl disabled:opacity-40">
          Save New PIN
        </button>
      </BottomSheet>

      <BottomSheet open={sheet?.type === "spendingLimit"} onClose={closeSheet} title="Monthly Spending Limit" darkMode={darkMode}>
        <p className={`text-sm mb-4 ${darkMode ? "text-white/60" : "text-black/60"}`}>Current limit: $5,000/month. Enter your new limit:</p>
        <div className={`flex items-center border rounded-xl px-4 py-3 mb-4 ${darkMode ? "bg-[#0d1526] border-white/10 text-white" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"}`}>
          <span className="text-lg font-bold mr-2 opacity-50">$</span>
          <input type="number" inputMode="decimal" value={limitInput} onChange={e => setLimitInput(e.target.value)}
            placeholder="5000" className="flex-1 bg-transparent outline-none text-lg font-bold" />
        </div>
        <button
          disabled={!limitInput || isNaN(limitInput)}
          onClick={() => { closeSheet(); showSuccess(`Spending limit set to $${parseInt(limitInput).toLocaleString()}/month.`); }}
          className="w-full bg-primary text-secondary font-bold py-4 rounded-xl disabled:opacity-40">
          Update Limit
        </button>
      </BottomSheet>

      <BottomSheet open={sheet?.type === "reportStolen"} onClose={closeSheet} title="Report Card Stolen" darkMode={darkMode}>
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-500 text-sm font-semibold">This will immediately freeze your card and begin the replacement process. This cannot be undone.</p>
        </div>
        <button onClick={() => { setFrozen(true); setIssued(false); closeSheet(); showSuccess("Card frozen & replacement requested. Check your email."); }}
          className="w-full bg-red-500 text-white font-bold py-4 rounded-xl mb-3">Yes, Report as Stolen</button>
        <button onClick={closeSheet} className={`w-full font-bold py-4 rounded-xl border ${darkMode ? "border-white/10 text-white/60" : "border-black/10 text-black/60"}`}>Cancel</button>
      </BottomSheet>

      <BottomSheet open={sheet?.type === "addFamily"} onClose={closeSheet} title="Add Family Card" darkMode={darkMode}>
        <p className={`text-sm mb-4 ${darkMode ? "text-white/60" : "text-black/60"}`}>Enter the family member's full name:</p>
        <input
          type="text" value={familyNameInput} onChange={e => setFamilyNameInput(e.target.value)}
          placeholder="e.g. Maria Santos"
          className={`w-full border rounded-xl px-4 py-4 text-base font-semibold outline-none focus:border-primary mb-4 ${darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/20" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"}`}
        />
        <button
          disabled={!familyNameInput.trim()}
          onClick={() => { closeSheet(); showSuccess(`Family card invited for ${familyNameInput.trim()}!`); }}
          className="w-full bg-primary text-secondary font-bold py-4 rounded-xl disabled:opacity-40">
          Send Invitation →
        </button>
      </BottomSheet>

      <BottomSheet open={sheet?.type === "cancelSub"} onClose={closeSheet} title={`Cancel ${sheet?.label}`} darkMode={darkMode}>
        <p className={`text-sm mb-6 ${darkMode ? "text-white/60" : "text-black/60"}`}>To cancel {sheet?.label}, please contact our support team. We'll process your cancellation within 24 hours.</p>
        <button onClick={closeSheet} className="w-full bg-primary text-secondary font-bold py-4 rounded-xl mb-3">Contact Support</button>
        <button onClick={closeSheet} className={`w-full font-bold py-4 rounded-xl border ${darkMode ? "border-white/10 text-white/60" : "border-black/10 text-black/60"}`}>Keep Subscription</button>
      </BottomSheet>
    </div>
  );
}