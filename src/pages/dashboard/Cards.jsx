import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Snowflake, Eye, EyeOff, CreditCard as CardIcon, Wifi, Key, DollarSign, Zap, AlertTriangle, Plus } from "lucide-react";
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

const CARD_TABS = ["My Card","Loyalty","Card Controls","Subscriptions"];

export default function Cards() {
  const { darkMode, taglish } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState("My Card");
  const [issued, setIssued] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [contactless, setContactless] = useState(true);
  const [instantSettlement, setInstantSettlement] = useState(false);
  const [user, setUser] = useState(null);
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const cardholderName = user?.full_name?.toUpperCase() || "KINNECTFI USER";

  const handleOrderPhysical = () => {
    alert("Physical card request submitted!\n\nDelivery in 5–10 business days to your registered address.\nYou will receive a tracking number via email.");
  };

  const handleChangePin = () => {
    const pin = prompt("Enter your new 4-digit PIN:");
    if (pin && /^\d{4}$/.test(pin)) {
      alert("PIN changed successfully! Your new PIN is active immediately.");
    } else if (pin) {
      alert("Invalid PIN. Please enter exactly 4 digits.");
    }
  };

  const handleSpendingLimit = () => {
    const limit = prompt("Enter your new monthly spending limit in USD (current: $5,000):");
    if (limit && !isNaN(limit)) {
      alert(`Spending limit updated to $${parseInt(limit).toLocaleString()}/month.`);
    }
  };

  const handleReportStolen = () => {
    if (confirm("Are you sure you want to report your card as stolen? This will immediately freeze your card and begin the replacement process.")) {
      setFrozen(true);
      setIssued(false);
      alert("Card reported as stolen and frozen.\nA replacement card will be issued within 3–5 business days.");
    }
  };

  const handleAddFamilyCard = () => {
    const name = prompt("Enter the family member's full name:");
    if (name) alert(`Family card request for ${name} submitted! They will receive an invitation to activate their card.`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{taglish ? "Mga Kard" : "Cards"}</h1>
        <p className={`text-sm ${muted}`}>{taglish ? "Pamahalaan ang iyong mga panandaliang susi" : "Manage your financial keys"}</p>
      </div>

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
                {issued && showDetails ? (
                  <span>EXP<br />12/28</span>
                ) : (
                  <span>EXP<br />—/—</span>
                )}
                {issued && showDetails ? (
                  <span>CVV<br />493</span>
                ) : (
                  <span>CVV<br />—</span>
                )}
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
        className="w-full flex items-center justify-center gap-2 bg-[#0d1526] text-white font-bold py-3.5 rounded-xl mb-3 hover:bg-[#1a2a4a] transition-colors">
        <Plus className="w-4 h-4" /> {issued ? "✓ Card Issued" : "+ Issue Virtual Card"}
      </button>

      <div className="flex gap-2 justify-center mb-4">
        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">✦ CURRENT TIER: BAYANI</span>
        <span className={`${darkMode ? "bg-white/5 text-white/50" : "bg-black/5 text-black/50"} text-xs font-bold px-3 py-1 rounded-full`}>🛡 ZERO LIABILITY</span>
      </div>

      <button onClick={handleOrderPhysical}
        className={`w-full flex items-center justify-center gap-2 border rounded-xl py-3 font-bold text-sm mb-6 ${darkMode ? "border-white/10 text-white/70 hover:bg-white/5" : "border-black/10 text-[#1a2a4a]/70 hover:bg-black/5"} transition-colors`}>
        <CardIcon className="w-4 h-4 text-primary" /> {taglish ? "Mag-order ng Pisikal na Kard" : "Order Physical Card"}
      </button>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {CARD_TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${activeTab === t ? "border-primary text-primary" : `border-transparent ${muted}`}`}>
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
              action: () => { setFrozen(!frozen); alert(frozen ? "Card unfrozen! Transactions re-enabled." : "Card frozen! All transactions temporarily disabled."); }
            },
            {
              icon: showDetails ? EyeOff : Eye,
              label: showDetails ? "Hide Details" : "Show Card Details",
              color: "text-purple-400",
              action: () => {
                if (!issued) { alert("Please issue your virtual card first."); return; }
                setShowDetails(!showDetails);
              }
            },
            {
              icon: CardIcon,
              label: taglish ? "Mag-order ng Pisikal na Kard" : "Order Physical Card",
              color: "text-primary",
              action: handleOrderPhysical
            }
          ].map((a,i) => (
            <button key={i} onClick={a.action}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border font-semibold text-sm transition-colors ${darkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-black/5 text-[#1a2a4a]"}`}>
              <a.icon className={`w-4 h-4 ${a.color}`} />{a.label}
            </button>
          ))}
          <div className={`border rounded-2xl p-5 mt-4 ${card}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-primary text-lg">👨‍👩‍👧</span>
              <h3 className="font-bold">{taglish ? "Mga Kard ng Pamilya" : "Family Cards"}</h3>
              <button onClick={handleAddFamilyCard} className="ml-auto text-primary text-xs font-bold hover:underline">+ ADD NEW</button>
            </div>
            <p className={`text-xs ${muted}`}>{taglish ? "Magdagdag ng miyembro ng pamilya para sa shared na kard." : "Add family members to share a spending card."}</p>
          </div>
        </div>
      )}

      {activeTab === "Loyalty" && (
        <div className={`border rounded-2xl p-6 bg-[#0d1526] border-white/10`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-white font-extrabold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>KinnectFi Tiers</h3>
              <p className="text-white/50 text-sm">Elevate your status as a global provider.</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs mb-0.5">Lifetime Padala</p>
              <p className="text-white font-black text-lg">$12,450</p>
              <p className="text-white/40 text-xs">Current Tier: BAYANI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-6">
            {TIERS.map((t,i) => (
              <div key={i} className="flex-1 text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center font-bold text-sm ${t.reached ? "bg-primary text-secondary" : "bg-white/10 text-white/40"}`}>
                  {t.reached ? "✓" : i+1}
                </div>
                <p className={`text-[10px] font-bold ${t.reached ? "text-primary" : "text-white/30"}`}>{t.name}</p>
                <p className="text-white/20 text-[9px]">{t.threshold}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "BAYANI PERKS", perks: ["0.5% Cash rebate on all Padala","Priority PH support line"] },
              { name: "DATU PERKS", perks: ["1.0% Cash rebate on all Padala","Free lounge access at NAIA"] },
              { name: "LAKAN EXCELLENCE", perks: ["1.5% Cash rebate on all Padala","Personal Kinnect concierge"] }
            ].map((t,i) => (
              <div key={i} className={`rounded-xl p-3 ${i===0 ? "border border-primary/40 bg-primary/10" : "bg-white/5"}`}>
                <p className={`text-[10px] font-black uppercase mb-2 ${i===0 ? "text-primary" : "text-white/50"}`}>{t.name}</p>
                {t.perks.map((p,j) => <p key={j} className="text-white/60 text-[10px] flex gap-1"><span className="text-primary">✓</span>{p}</p>)}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Card Controls" && (
        <div className={`border rounded-2xl p-5 ${card}`}>
          <h3 className="font-bold mb-4">{taglish ? "Kontrol ng Kard" : "Card Controls"}</h3>
          <div className="space-y-4">
            {/* Freeze toggle */}
            {[
              { icon: Snowflake, label: "Freeze Card", sub: "Temporarily disable all transactions", type: "toggle", color: "text-blue-400", value: frozen, set: () => { setFrozen(!frozen); } },
              { icon: Wifi, label: "Contactless Pay", sub: "Tap-to-pay functionality", type: "toggle", color: "text-blue-500", value: contactless, set: () => setContactless(!contactless) },
              { icon: Zap, label: "Instant Settlement", sub: "Settle transfers in seconds, not days", type: "toggle", color: "text-yellow-500", value: instantSettlement, set: () => setInstantSettlement(!instantSettlement), badge: "BETA" },
            ].map((c,i) => (
              <div key={i} className={`flex items-center justify-between py-3 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <div className="flex items-start gap-3">
                  <c.icon className={`w-4 h-4 mt-0.5 ${c.color}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{c.label}</p>
                      {c.badge && <span className="bg-orange-500/20 text-orange-500 text-[9px] font-bold px-1.5 py-0.5 rounded">{c.badge}</span>}
                    </div>
                    <p className={`text-xs ${muted}`}>{c.sub}</p>
                  </div>
                </div>
                <button onClick={c.set}
                  className={`w-10 h-5 rounded-full transition-all ${c.value ? "bg-primary" : darkMode ? "bg-white/20" : "bg-black/20"} relative flex-shrink-0`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${c.value ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            ))}

            {/* Buttons */}
            {[
              { icon: Key, label: "Card PIN", sub: "Change 4-digit security PIN", btnLabel: "Change", action: handleChangePin },
              { icon: DollarSign, label: "Spending Limit", sub: "$5,000/month", btnLabel: "Edit", action: handleSpendingLimit },
            ].map((c,i) => (
              <div key={i} className={`flex items-center justify-between py-3 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <div className="flex items-start gap-3">
                  <c.icon className={`w-4 h-4 mt-0.5 ${muted}`} />
                  <div><p className="font-semibold text-sm">{c.label}</p><p className={`text-xs ${muted}`}>{c.sub}</p></div>
                </div>
                <button onClick={c.action}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${darkMode ? "border-white/20 hover:bg-white/5" : "border-black/20 hover:bg-black/5"} transition-colors`}>
                  {c.btnLabel}
                </button>
              </div>
            ))}

            {/* Danger */}
            <div className={`flex items-center justify-between py-3 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500" />
                <div><p className="font-semibold text-sm text-red-500">Report Stolen</p><p className={`text-xs ${muted}`}>Freeze and replace card</p></div>
              </div>
              <button onClick={handleReportStolen} className="text-red-500 text-sm font-bold hover:underline">Report</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Subscriptions" && (
        <div className={`border rounded-2xl p-5 ${card}`}>
          <h3 className="font-bold mb-1">Subscriptions · <span className={muted}>Mga Serbisyo</span></h3>
          <div className="space-y-4 mt-4">
            {SUBSCRIPTIONS.map((s,i) => (
              <div key={i} className={`flex items-center gap-3 py-3 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1"><p className="font-semibold text-sm">{s.label}</p><p className={`text-xs ${muted}`}>{s.sub}</p></div>
                <div className="text-right">
                  <p className="font-bold">{s.amount}</p>
                  <button onClick={() => alert(`Cancel ${s.label}? Contact support to manage your subscription.`)}
                    className="text-red-400 text-[10px] hover:underline">Cancel</button>
                </div>
              </div>
            ))}
          </div>
          <div className={`flex justify-between items-center pt-4 mt-2 border-t ${darkMode ? "border-white/10" : "border-black/10"}`}>
            <span className="font-bold text-sm">MONTHLY TOTAL</span>
            <span className="text-primary font-black text-lg">$23.96</span>
          </div>
        </div>
      )}
    </div>
  );
}