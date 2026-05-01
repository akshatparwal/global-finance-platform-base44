import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Snowflake, Eye, EyeOff, CreditCard as CardIcon, Wifi, Key,
  DollarSign, Zap, AlertTriangle, Plus, X, Check, Copy, Loader2, MapPin, Package
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import CardTransactionFeed from "@/components/cards/CardTransactionFeed";

const TIER_DEFS = [
  { name: "SUGO",   threshold: "$0",    min: 0 },
  { name: "BAYANI", threshold: "$10k",  min: 10000 },
  { name: "DATU",   threshold: "$50k",  min: 50000 },
  { name: "LAKAN",  threshold: "$100k", min: 100000 },
];

const SUBSCRIPTIONS = [
  { emoji: "📺", label: "iWantTFC", sub: "ABS-CBN Streaming · Renews May 1", amount: "$5.99" },
  { emoji: "🎬", label: "Viu Premium", sub: "K-Drama & Filipino Shows · Renews Apr 28", amount: "$4.99" },
  { emoji: "🛍️", label: "Lazada+", sub: "Free Shipping & Vouchers · Renews Apr 25", amount: "$2.99" },
  { emoji: "🎵", label: "Spotify", sub: "Music & Podcasts · Renews Apr 20", amount: "$9.99" },
];

const CARD_TABS = ["My Card", "Transactions", "Controls"];

// Generate realistic card data
function generateCardData() {
  const rand4 = () => Math.floor(1000 + Math.random() * 9000).toString();
  const groups = ["4582", rand4(), rand4(), rand4()];
  const card_number = groups.join(" ");
  const last4 = groups[3];
  const expMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, "0");
  const expYear = (new Date().getFullYear() + 3).toString().slice(-2);
  const expiry = `${expMonth}/${expYear}`;
  const cvv = String(Math.floor(100 + Math.random() * 900));
  return { card_number, last4, expiry, cvv };
}

function BottomSheet({ open, onClose, title, children, darkMode }) {
  if (!open) return null;
  const bg = darkMode ? "bg-[#1a2332]" : "bg-white";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`relative ${bg} rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className={`font-extrabold text-lg ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export default function Cards() {
  const { darkMode, taglish } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState("My Card");
  const [cardData, setCardData] = useState(null);      // persisted VirtualCard entity
  const [issuing, setIssuing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(null);
  const [user, setUser] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [limitInput, setLimitInput] = useState("");
  const [familyNameInput, setFamilyNameInput] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Physical card form
  const [physAddr, setPhysAddr] = useState({ address: "", city: "", state: "", zip: "", country: "United States" });

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const textMain = darkMode ? "text-white" : "text-[#1a2a4a]";
  const inputCls = `w-full border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm ${
    darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"
  }`;

  const [transfers, setTransfers] = useState([]);

  const lifetimePadala = useMemo(() => transfers.reduce((s, t) => s + (t.amount_usd || 0), 0), [transfers]);
  const TIERS = useMemo(() => TIER_DEFS.map(t => ({ ...t, reached: lifetimePadala >= t.min })), [lifetimePadala]);
  const currentTier = [...TIERS].reverse().find(t => t.reached) || TIERS[0];

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.VirtualCard.list("-created_date", 1).catch(() => []),
      base44.entities.Transfer.list("-created_date", 100).catch(() => []),
    ]).then(([u, cards, txs]) => {
      setUser(u);
      if (cards.length > 0) setCardData(cards[0]);
      setTransfers(txs);
    });
  }, []);

  const cardholderName = user?.full_name?.toUpperCase() || "KINNECTFI USER";
  const isFrozen = cardData?.is_frozen || false;
  const issued = !!cardData;

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Issue virtual card — generates data and persists
  const handleIssue = async () => {
    if (issued || issuing) return;
    setIssuing(true);
    await new Promise(r => setTimeout(r, 1200)); // Revolut-style 1.2s "issuance" delay
    const data = generateCardData();
    const newCard = await base44.entities.VirtualCard.create({
      ...data,
      is_frozen: false,
      contactless_enabled: true,
      instant_settlement: false,
      spending_limit: 5000,
      status: "active",
      physical_requested: false,
      physical_status: "none",
    });
    setCardData(newCard);
    setShowDetails(true);
    setIssuing(false);
    showSuccess("Virtual card issued in seconds! ✓");
  };

  // Persist toggle to backend
  const updateCard = async (patch) => {
    if (!cardData) return;
    const updated = { ...cardData, ...patch };
    setCardData(updated);
    await base44.entities.VirtualCard.update(cardData.id, patch).catch(() => {});
  };

  const handleFreeze = async () => {
    const next = !isFrozen;
    await updateCard({ is_frozen: next, status: next ? "frozen" : "active" });
    showSuccess(next ? "Card frozen! All transactions disabled." : "Card unfrozen! Ready to use.");
  };

  const handleContactless = () => updateCard({ contactless_enabled: !cardData?.contactless_enabled });
  const handleInstant = () => updateCard({ instant_settlement: !cardData?.instant_settlement });

  const handleCopy = (value, key) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const handleSpendingLimitSave = async () => {
    const val = parseFloat(limitInput);
    if (!val || val <= 0) return;
    await updateCard({ spending_limit: val });
    setSheet(null);
    showSuccess(`Spending limit set to $${val.toLocaleString()}/month.`);
  };

  const handlePhysicalOrder = async () => {
    if (!physAddr.address || !physAddr.city || !physAddr.zip) return;
    setSaving(true);
    await updateCard({
      physical_requested: true,
      physical_status: "processing",
      physical_address: physAddr.address,
      physical_city: physAddr.city,
      physical_state: physAddr.state,
      physical_zip: physAddr.zip,
      physical_country: physAddr.country,
    });
    setSaving(false);
    setSheet(null);
    showSuccess("Physical card ordered! Arrives in 5–10 business days.");
  };

  const handleReportStolen = async () => {
    await updateCard({ is_frozen: true, status: "cancelled" });
    setSheet(null);
    showSuccess("Card frozen & replacement requested. Check your email.");
  };

  const closeSheet = () => setSheet(null);

  // Mask card number
  const maskedNumber = cardData
    ? cardData.card_number.split(" ").map((g, i) => (showDetails ? g : (i < 3 ? "••••" : g))).join(" ")
    : "•••• •••• •••• ••••";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-lg font-extrabold sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {taglish ? "Mga Kard" : "Cards"}
        </h1>
        <p className={`text-xs ${muted}`}>{taglish ? "Pamahalaan ang iyong mga panandaliang susi" : "Manage your financial keys"}</p>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-xl text-sm font-bold"
          >
            <Check className="w-4 h-4" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card visual */}
      <div className="flex justify-center mb-4">
        <div
          className={`w-full max-w-sm h-48 rounded-2xl relative overflow-hidden shadow-2xl transition-all duration-500 ${isFrozen ? "grayscale opacity-60" : ""}`}
          style={{ background: "linear-gradient(135deg, #0d1a3a 0%, #1a2a4a 40%, #2a1a00 100%)" }}
        >
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 70% 60%, rgba(201,160,80,0.5) 0%, transparent 60%)" }} />
          {/* Chip */}
          <div className="absolute top-5 left-5 w-8 h-6 rounded-sm bg-primary/60" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 4px)" }} />

          <div className="p-5 h-full flex flex-col justify-between relative z-10">
            <div className="flex justify-between items-start">
              <div className="ml-10">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isFrozen ? "text-blue-400" : "text-white/50"}`}>
                  {isFrozen ? "🔒 FROZEN" : issued ? "VIRTUAL CARD" : "NOT ISSUED"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className={`w-3.5 h-3.5 ${cardData?.contactless_enabled ? "text-white/60" : "text-white/20"}`} />
                <span className="text-white/40 text-[9px] font-bold tracking-widest">KINNECTFI</span>
              </div>
            </div>

            {/* Card number */}
            <div className="flex items-center gap-1">
              {issued ? (
                <p className="font-mono text-white text-base tracking-widest">{maskedNumber}</p>
              ) : (
                <p className="font-mono text-white/20 text-base tracking-widest">•••• •••• •••• ••••</p>
              )}
              {issued && showDetails && (
                <button onClick={() => handleCopy(cardData.card_number, "card")} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
                  {copied === "card" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-white" />}
                </button>
              )}
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/30 text-[8px] uppercase tracking-widest mb-0.5">Cardholder</p>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wide">{cardholderName}</p>
              </div>
              <div className="flex gap-4 text-[9px]">
                <div>
                  <p className="text-white/30 uppercase tracking-wider mb-0.5">EXP</p>
                  <p className="text-white/70 font-bold font-mono">{issued && showDetails ? cardData.expiry : "—/——"}</p>
                </div>
                <div>
                  <p className="text-white/30 uppercase tracking-wider mb-0.5">CVV</p>
                  <div className="flex items-center gap-1">
                    <p className="text-white/70 font-bold font-mono">{issued && showDetails ? cardData.cvv : "•••"}</p>
                    {issued && showDetails && (
                      <button onClick={() => handleCopy(cardData.cvv, "cvv")} className="opacity-50 hover:opacity-100">
                        {copied === "cvv" ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-white" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-red-500/80" />
                <div className="w-7 h-7 rounded-full bg-yellow-500/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issue button */}
      {!issued ? (
        <button
          onClick={handleIssue}
          disabled={issuing}
          className="w-full flex items-center justify-center gap-2 bg-primary text-secondary font-bold py-4 rounded-xl mb-3 hover:opacity-90 disabled:opacity-70 transition-all active:scale-[0.98]"
        >
          {issuing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Issuing your card...</>
          ) : (
            <><Plus className="w-4 h-4" /> Issue Virtual Card — Instant</>
          )}
        </button>
      ) : (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all active:scale-[0.98] ${darkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-black/5 text-[#1a2a4a]"}`}
          >
            {showDetails ? <EyeOff className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4 text-purple-400" />}
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
          <button
            onClick={handleFreeze}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all active:scale-[0.98] ${isFrozen ? "border-blue-400/40 bg-blue-400/10 text-blue-400" : darkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-black/10 hover:bg-black/5 text-[#1a2a4a]"}`}
          >
            <Snowflake className={`w-4 h-4 ${isFrozen ? "text-blue-400" : "text-blue-400"}`} />
            {isFrozen ? "Unfreeze" : "Freeze"}
          </button>
        </div>
      )}

      {/* Last 4 badge + physical status */}
      <div className="flex gap-2 justify-center mb-4 flex-wrap">
        {issued && (
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
            ✦ VISA •••• {cardData.last4}
          </span>
        )}
        <span className={`${darkMode ? "bg-white/5 text-white/50" : "bg-black/5 text-black/50"} text-xs font-bold px-3 py-1 rounded-full`}>
          🛡 ZERO LIABILITY
        </span>
        {cardData?.physical_status && cardData.physical_status !== "none" && (
          <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Package className="w-3 h-3" />
            Physical: {cardData.physical_status.toUpperCase()}
          </span>
        )}
      </div>

      {/* Order physical card button */}
      <button
        onClick={() => setSheet({ type: "orderPhysical" })}
        className={`w-full flex items-center justify-center gap-2 border rounded-xl py-3.5 font-bold text-sm mb-6 active:scale-[0.98] transition-all ${
          cardData?.physical_requested
            ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
            : darkMode ? "border-white/10 text-white/70 hover:bg-white/5" : "border-black/10 text-[#1a2a4a]/70 hover:bg-black/5"
        }`}
      >
        <CardIcon className="w-4 h-4 text-primary" />
        {cardData?.physical_requested
          ? `Physical Card — ${cardData.physical_status === "processing" ? "Being Prepared 📦" : "Shipped! 🚀"}`
          : taglish ? "Mag-order ng Pisikal na Kard" : "Order Physical Card"}
      </button>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {CARD_TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === t ? "border-primary text-primary" : `border-transparent ${muted}`}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "My Card" && (
        <div className="space-y-3">
          {/* Card number detail row (when shown) */}
          {issued && showDetails && (
            <div className={`border rounded-2xl p-4 ${card}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-3`}>Card Details</p>
              {[
                { label: "Card Number", value: cardData.card_number, key: "card" },
                { label: "Expiry", value: cardData.expiry, key: "exp" },
                { label: "CVV", value: cardData.cvv, key: "cvv" },
              ].map(row => (
                <div key={row.key} className={`flex items-center justify-between py-2.5 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                  <span className={`text-xs ${muted}`}>{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm">{row.value}</span>
                    <button onClick={() => handleCopy(row.value, row.key)} className={`p-1 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-black/10"}`}>
                      {copied === row.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className={`w-3.5 h-3.5 ${muted}`} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={`border rounded-2xl p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-primary text-lg">👨‍👩‍👧</span>
              <h3 className="font-bold">{taglish ? "Mga Kard ng Pamilya" : "Family Cards"}</h3>
              <button onClick={() => { setFamilyNameInput(""); setSheet({ type: "addFamily" }); }} className="ml-auto text-primary text-xs font-bold hover:underline py-1 px-2">+ ADD NEW</button>
            </div>
            <p className={`text-xs ${muted}`}>{taglish ? "Magdagdag ng miyembro ng pamilya para sa shared na kard." : "Add family members to share a spending card."}</p>
          </div>
        </div>
      )}

      {activeTab === "Transactions" && (
        <CardTransactionFeed cardLast4={cardData?.last4} darkMode={darkMode} />
      )}

      {activeTab === "_Loyalty_removed" && (
        <div className="rounded-2xl p-6 bg-[#0d1526] border border-white/10">
          <div className="flex justify-between items-start mb-4 gap-3">
            <div>
              <h3 className="text-white font-extrabold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>KinnectFi Tiers</h3>
              <p className="text-white/50 text-sm">Elevate your status as a global provider.</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white/40 text-xs mb-0.5">Lifetime Padala</p>
              <p className="text-white font-black text-lg">${lifetimePadala.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              <p className="text-primary text-xs font-bold">{currentTier.name} TIER</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { name: "BAYANI PERKS", tierName: "BAYANI", perks: ["0.5% Cash rebate on all Padala", "Priority PH support line"] },
              { name: "DATU PERKS",   tierName: "DATU",   perks: ["1.0% Cash rebate on all Padala", "Free lounge access at NAIA"] },
              { name: "LAKAN EXCELLENCE", tierName: "LAKAN", perks: ["1.5% Cash rebate on all Padala", "Personal Kinnect concierge"] }
            ].map((t, i) => {
              const tierIndex = TIER_DEFS.findIndex(td => td.name === t.tierName);
              const currentIndex = TIER_DEFS.findIndex(td => td.name === currentTier.name);
              const unlocked = currentIndex >= tierIndex;
              return (
                <div key={i} className={`rounded-xl p-3 relative overflow-hidden ${unlocked ? "border border-primary/40 bg-primary/10" : "bg-white/5 opacity-60"}`}>
                  {!unlocked && (
                    <div className="absolute top-2 right-2 text-white/30 text-base">🔒</div>
                  )}
                  <p className={`text-[10px] font-black uppercase mb-2 ${unlocked ? "text-primary" : "text-white/30"}`}>{t.name}</p>
                  {t.perks.map((p, j) => (
                    <p key={j} className={`text-xs flex gap-1 mb-1 ${unlocked ? "text-white/70" : "text-white/25"}`}>
                      <span className={`flex-shrink-0 ${unlocked ? "text-primary" : "text-white/25"}`}>{unlocked ? "✓" : "·"}</span>{p}
                    </p>
                  ))}
                  {!unlocked && (
                    <p className="text-[9px] text-white/30 mt-2 font-bold uppercase tracking-wider">
                      Reach {t.tierName} to unlock
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "Controls" && (
        <div className={`border rounded-2xl p-5 ${card}`}>
          <h3 className={`font-bold mb-4 ${textMain}`}>{taglish ? "Kontrol ng Kard" : "Card Controls"}</h3>
          {!issued && (
            <div className={`text-center py-6 ${muted} text-sm`}>Issue a virtual card first to manage controls.</div>
          )}
          {issued && (
            <div className="space-y-1">
              {[
                { icon: Snowflake, label: "Freeze Card", sub: "Temporarily disable all transactions", color: "text-blue-400", value: isFrozen, set: handleFreeze },
                { icon: Wifi, label: "Contactless Pay", sub: "Tap-to-pay functionality", color: "text-blue-500", value: cardData?.contactless_enabled, set: handleContactless },
                { icon: Zap, label: "Instant Settlement", sub: "Settle transfers in seconds, not days", color: "text-yellow-500", value: cardData?.instant_settlement, set: handleInstant, badge: "BETA" },
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

              <div className={`flex items-center justify-between py-4 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <div className="flex items-start gap-3">
                  <Key className={`w-4 h-4 mt-0.5 flex-shrink-0 ${muted}`} />
                  <div><p className={`font-semibold text-sm ${textMain}`}>Card PIN</p><p className={`text-xs ${muted}`}>Change 4-digit security PIN</p></div>
                </div>
                <button onClick={() => { setPinInput(""); setSheet({ type: "changePin" }); }}
                  className={`text-sm font-bold px-4 py-2 rounded-xl border flex-shrink-0 ml-3 active:scale-95 ${darkMode ? "border-white/20 hover:bg-white/5 text-white" : "border-black/20 hover:bg-black/5 text-[#1a2a4a]"}`}>
                  Change
                </button>
              </div>

              <div className={`flex items-center justify-between py-4 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <div className="flex items-start gap-3">
                  <DollarSign className={`w-4 h-4 mt-0.5 flex-shrink-0 ${muted}`} />
                  <div><p className={`font-semibold text-sm ${textMain}`}>Spending Limit</p><p className={`text-xs ${muted}`}>${(cardData?.spending_limit || 5000).toLocaleString()}/month</p></div>
                </div>
                <button onClick={() => { setLimitInput(String(cardData?.spending_limit || 5000)); setSheet({ type: "spendingLimit" }); }}
                  className={`text-sm font-bold px-4 py-2 rounded-xl border flex-shrink-0 ml-3 active:scale-95 ${darkMode ? "border-white/20 hover:bg-white/5 text-white" : "border-black/20 hover:bg-black/5 text-[#1a2a4a]"}`}>
                  Edit
                </button>
              </div>

              <div className={`flex items-center justify-between py-4 border-t ${darkMode ? "border-white/5" : "border-black/5"}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                  <div><p className="font-semibold text-sm text-red-500">Report Stolen</p><p className={`text-xs ${muted}`}>Freeze and replace card</p></div>
                </div>
                <button onClick={() => setSheet({ type: "reportStolen" })}
                  className="text-red-500 text-sm font-bold px-4 py-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 active:scale-95 flex-shrink-0 ml-3">Report</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "_Subscriptions_removed" && (
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
                  <button onClick={() => setSheet({ type: "cancelSub", label: s.label })} className="text-red-400 text-xs font-bold hover:underline py-1">Cancel</button>
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
      <AnimatePresence>
        {/* Physical card order with address form */}
        <BottomSheet open={sheet?.type === "orderPhysical"} onClose={closeSheet} title="Order Physical Card" darkMode={darkMode}>
          {cardData?.physical_requested ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-3xl">📦</div>
              <p className={`font-extrabold text-xl mb-2 ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>Order Placed!</p>
              <p className={`text-sm mb-1 ${darkMode ? "text-white/60" : "text-black/60"}`}>Shipping to:</p>
              <p className={`text-sm font-semibold mb-1 ${darkMode ? "text-white" : "text-[#1a2a4a]"}`}>{cardData.physical_address}</p>
              <p className={`text-sm mb-4 ${darkMode ? "text-white/60" : "text-black/60"}`}>{cardData.physical_city}, {cardData.physical_state} {cardData.physical_zip}</p>
              <span className="bg-emerald-500/20 text-emerald-500 text-xs font-bold px-3 py-1.5 rounded-full">Status: {cardData.physical_status?.toUpperCase()}</span>
              <p className={`text-xs mt-4 ${darkMode ? "text-white/40" : "text-black/40"}`}>Estimated delivery: 5–10 business days</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl p-3 mb-5">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-primary text-xs font-semibold">Enter your delivery address. Your physical card will arrive in 5–10 business days.</p>
              </div>
              <div className="space-y-3 mb-5">
                <input value={physAddr.address} onChange={e => setPhysAddr(p => ({ ...p, address: e.target.value }))}
                  placeholder="Street address" className={inputCls} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={physAddr.city} onChange={e => setPhysAddr(p => ({ ...p, city: e.target.value }))}
                    placeholder="City" className={inputCls} />
                  <input value={physAddr.state} onChange={e => setPhysAddr(p => ({ ...p, state: e.target.value }))}
                    placeholder="State / Province" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={physAddr.zip} onChange={e => setPhysAddr(p => ({ ...p, zip: e.target.value }))}
                    placeholder="ZIP / Postal code" className={inputCls} />
                  <select value={physAddr.country} onChange={e => setPhysAddr(p => ({ ...p, country: e.target.value }))}
                    className={inputCls + " cursor-pointer"}>
                    {["United States", "United Kingdom", "Canada", "Australia", "UAE", "Saudi Arabia", "Singapore", "Japan", "Germany", "Italy"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handlePhysicalOrder}
                disabled={!physAddr.address || !physAddr.city || !physAddr.zip || saving}
                className="w-full bg-primary text-secondary font-bold py-4 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Confirm Order →"}
              </button>
            </>
          )}
        </BottomSheet>

        <BottomSheet open={sheet?.type === "changePin"} onClose={closeSheet} title="Change PIN" darkMode={darkMode}>
          <p className={`text-sm mb-4 ${darkMode ? "text-white/60" : "text-black/60"}`}>Enter your new 4-digit PIN.</p>
          <input type="password" inputMode="numeric" maxLength={4} value={pinInput}
            onChange={e => setPinInput(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            className={`w-full border rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-widest outline-none focus:border-primary mb-4 ${darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/20" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"}`}
          />
          <button disabled={pinInput.length !== 4}
            onClick={() => { closeSheet(); showSuccess("PIN changed successfully!"); }}
            className="w-full bg-primary text-secondary font-bold py-4 rounded-xl disabled:opacity-40">
            Save New PIN
          </button>
        </BottomSheet>

        <BottomSheet open={sheet?.type === "spendingLimit"} onClose={closeSheet} title="Monthly Spending Limit" darkMode={darkMode}>
          <p className={`text-sm mb-4 ${darkMode ? "text-white/60" : "text-black/60"}`}>Current limit: ${(cardData?.spending_limit || 5000).toLocaleString()}/month.</p>
          <div className={`flex items-center border rounded-xl px-4 py-3 mb-4 ${darkMode ? "bg-[#0d1526] border-white/10 text-white" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"}`}>
            <span className="text-lg font-bold mr-2 opacity-50">$</span>
            <input type="number" inputMode="decimal" value={limitInput} onChange={e => setLimitInput(e.target.value)}
              className="flex-1 bg-transparent outline-none text-lg font-bold" />
          </div>
          <button disabled={!limitInput || isNaN(limitInput)} onClick={handleSpendingLimitSave}
            className="w-full bg-primary text-secondary font-bold py-4 rounded-xl disabled:opacity-40">
            Update Limit
          </button>
        </BottomSheet>

        <BottomSheet open={sheet?.type === "reportStolen"} onClose={closeSheet} title="Report Card Stolen" darkMode={darkMode}>
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-500 text-sm font-semibold">This will immediately freeze your card and begin the replacement process. This cannot be undone.</p>
          </div>
          <button onClick={handleReportStolen} className="w-full bg-red-500 text-white font-bold py-4 rounded-xl mb-3">Yes, Report as Stolen</button>
          <button onClick={closeSheet} className={`w-full font-bold py-4 rounded-xl border ${darkMode ? "border-white/10 text-white/60" : "border-black/10 text-black/60"}`}>Cancel</button>
        </BottomSheet>

        <BottomSheet open={sheet?.type === "addFamily"} onClose={closeSheet} title="Add Family Card" darkMode={darkMode}>
          <p className={`text-sm mb-4 ${darkMode ? "text-white/60" : "text-black/60"}`}>Enter the family member's full name:</p>
          <input type="text" value={familyNameInput} onChange={e => setFamilyNameInput(e.target.value)}
            placeholder="e.g. Maria Santos"
            className={`w-full border rounded-xl px-4 py-4 text-base font-semibold outline-none focus:border-primary mb-4 ${darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/20" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]"}`}
          />
          <button disabled={!familyNameInput.trim()}
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
      </AnimatePresence>
    </div>
  );
}