/**
 * PointsRedemption — real rewards catalog: fee credits, partner vouchers, charity.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATALOG = [
  {
    id: "fee_credit_1",
    category: "fee_credits",
    icon: "💸",
    title: "Free Transfer",
    desc: "Waive the fee on your next transfer",
    points: 500,
    value: "$2.99",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
  },
  {
    id: "fee_credit_3",
    category: "fee_credits",
    icon: "🔥",
    title: "3 Free Transfers",
    desc: "Fee-free sends for your next 3 padala",
    points: 1200,
    value: "$8.97",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    badge: "BEST VALUE",
  },
  {
    id: "gcash_100",
    category: "voucher",
    icon: "📱",
    title: "GCash ₱100 Credits",
    desc: "Sent directly to your GCash wallet",
    points: 800,
    value: "₱100",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
  },
  {
    id: "jollibee",
    category: "voucher",
    icon: "🍔",
    title: "Jollibee ₱200 Voucher",
    desc: "Treat your family back home",
    points: 1500,
    value: "₱200",
    color: "from-red-500/20 to-red-500/5",
    border: "border-red-500/30",
  },
  {
    id: "iwanttfc",
    category: "voucher",
    icon: "📺",
    title: "iWantTFC 1-Month",
    desc: "Stream Filipino content for free",
    points: 600,
    value: "$5.99",
    color: "from-yellow-500/20 to-yellow-500/5",
    border: "border-yellow-500/30",
  },
  {
    id: "charity_1",
    category: "charity",
    icon: "🌿",
    title: "Plant 10 Trees in PH",
    desc: "Via One Tree Planted Philippines",
    points: 300,
    value: "10 trees",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
  },
  {
    id: "charity_2",
    category: "charity",
    icon: "📚",
    title: "School Supplies for 1 Child",
    desc: "Donated to Gawad Kalinga",
    points: 750,
    value: "1 child",
    color: "from-teal-500/20 to-teal-500/5",
    border: "border-teal-500/30",
  },
  {
    id: "points_boost",
    category: "boost",
    icon: "⚡",
    title: "2x Points Weekend",
    desc: "Double points on all transfers this weekend",
    points: 1000,
    value: "2x boost",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "fee_credits", label: "💸 Credits" },
  { id: "voucher", label: "🎁 Vouchers" },
  { id: "charity", label: "🌿 Charity" },
  { id: "boost", label: "⚡ Boosts" },
];

export default function PointsRedemption({ points = 2450, darkMode, onClose }) {
  const [filter, setFilter] = useState("all");
  const [confirming, setConfirming] = useState(null); // item being confirmed
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(null);
  const [balance, setBalance] = useState(points);

  const bg = darkMode ? "bg-[#0d1526]" : "bg-white";
  const card = darkMode ? "bg-white/5 border-white/10" : "bg-[#f5efe6] border-black/10";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";

  const filtered = filter === "all" ? CATALOG : CATALOG.filter(c => c.category === filter);

  const handleRedeem = async (item) => {
    setRedeeming(true);
    // Simulate redemption — in production would call backend
    await new Promise(r => setTimeout(r, 1200));
    setBalance(b => b - item.points);
    setRedeemed(item);
    setConfirming(null);
    setRedeeming(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`w-full sm:max-w-md ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0" style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2e00 60%, #8a6a00 100%)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Kinnect Points</p>
              <p className="text-white font-black text-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {balance.toLocaleString()} <span className="text-base font-normal text-white/50">pts</span>
              </p>
              <p className="text-white/40 text-xs">≈ ${(balance / 1000).toFixed(2)} value</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 flex-shrink-0 overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === c.id ? "bg-primary text-secondary" : darkMode ? "bg-white/5 text-white/50 hover:bg-white/10" : "bg-black/5 text-black/50 hover:bg-black/10"}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Catalog */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <AnimatePresence mode="wait">
            {redeemed ? (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-12 text-center"
              >
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl mb-4">{redeemed.icon}</div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Check className="w-6 h-6 text-emerald-500" />
                </div>
                <p className={`font-extrabold text-xl mb-1 ${text}`}>Redeemed!</p>
                <p className={`text-sm ${muted} mb-1`}>{redeemed.title}</p>
                <p className={`text-xs ${muted}`}>
                  {redeemed.category === "fee_credits"
                    ? "Your credit will apply automatically on your next transfer."
                    : redeemed.category === "charity"
                    ? "Your donation has been sent. Thank you for giving back!"
                    : "Your voucher code will arrive via email within 10 minutes."}
                </p>
                <button onClick={() => setRedeemed(null)} className="mt-6 text-primary text-sm font-bold hover:underline">
                  Redeem another →
                </button>
              </motion.div>
            ) : (
              <motion.div key="catalog" className="grid grid-cols-1 gap-3 pt-2">
                {filtered.map(item => {
                  const canAfford = balance >= item.points;
                  return (
                    <div key={item.id} className={`border rounded-2xl p-4 bg-gradient-to-br ${item.color} ${item.border} ${!canAfford ? "opacity-50" : ""}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-3xl flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className={`font-bold text-sm ${text}`}>{item.title}</p>
                            {item.badge && <span className="bg-primary text-secondary text-[9px] font-black px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                          </div>
                          <p className={`text-xs ${muted} mb-2`}>{item.desc}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-primary font-black text-sm">{item.points.toLocaleString()} pts</span>
                              <span className={`text-xs ${muted} ml-1`}>· {item.value}</span>
                            </div>
                            <button
                              onClick={() => canAfford && setConfirming(item)}
                              disabled={!canAfford}
                              className={`text-xs font-black px-4 py-2 rounded-xl transition-all active:scale-95 ${canAfford ? "bg-primary text-secondary hover:opacity-90" : "bg-black/10 text-black/30 cursor-not-allowed"}`}
                            >
                              {canAfford ? "Redeem" : "Not enough pts"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-xs ${bg} rounded-3xl p-6 shadow-2xl`}
            >
              <div className="text-center mb-4">
                <span className="text-5xl">{confirming.icon}</span>
                <p className={`font-extrabold text-lg mt-3 mb-1 ${text}`}>{confirming.title}</p>
                <p className={`text-sm ${muted} mb-1`}>{confirming.desc}</p>
                <p className="text-primary font-black">{confirming.points.toLocaleString()} pts · {confirming.value}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirming(null)} className={`flex-1 py-3 rounded-xl border font-bold text-sm ${darkMode ? "border-white/10 text-white/60" : "border-black/10 text-black/60"}`}>
                  Cancel
                </button>
                <button onClick={() => handleRedeem(confirming)} disabled={redeeming}
                  className="flex-1 bg-primary text-secondary font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90">
                  {redeeming ? <><Loader2 className="w-4 h-4 animate-spin" /> Redeeming...</> : "Confirm →"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}