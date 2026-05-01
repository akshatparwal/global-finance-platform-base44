/**
 * FundWalletModal — Add Funds sheet.
 * Methods: ACH, Wire, Instant (simulated), Crypto onramp via Privy.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Building2, Zap, ArrowDownToLine, CheckCircle, Wallet } from "lucide-react";
import { processDeposit } from "@/functions/processDeposit";
import { haptic } from "@/utils/haptic";
import { usePrivyWallet } from "@/hooks/usePrivyWallet";

const METHODS = [
  { id: "ach",     label: "ACH Transfer",      sub: "1–3 business days · Free",   icon: Building2,       badge: null },
  { id: "wire",    label: "Wire Transfer",      sub: "Same day · Free",            icon: Zap,             badge: "FAST" },
  { id: "instant", label: "Instant Deposit",    sub: "Via debit card · 1.5% fee",  icon: ArrowDownToLine, badge: "INSTANT" },
  { id: "crypto",  label: "Buy USDC (Crypto)",  sub: "Card / bank → USDC on Base", icon: Wallet,          badge: "NEW" },
];

function CopyRow({ label, value, darkMode }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  const muted = darkMode ? "text-white/40" : "text-black/40";
  const text  = darkMode ? "text-white"    : "text-[#1a2a4a]";
  return (
    <div className={`flex items-center justify-between py-3 border-b last:border-0 ${darkMode ? "border-white/5" : "border-black/5"}`}>
      <div>
        <p className={`text-[10px] uppercase tracking-wider font-bold ${muted} mb-0.5`}>{label}</p>
        <p className={`font-mono font-bold text-sm ${text}`}>{value}</p>
      </div>
      <button onClick={handleCopy} className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-black/10"}`}>
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className={`w-4 h-4 ${muted}`} />}
      </button>
    </div>
  );
}

export default function FundWalletModal({ onClose, darkMode, user }) {
  const [method, setMethod]               = useState("ach");
  const [instantAmount, setInstantAmount] = useState("");
  const [instantSuccess, setInstantSuccess] = useState(false);
  const [depositing, setDepositing]       = useState(false);
  const { walletAddress }                 = usePrivyWallet();

  const bg    = darkMode ? "bg-[#0d1526]" : "bg-white";
  const card  = darkMode ? "bg-white/5 border-white/10" : "bg-[#f5efe6] border-black/8";
  const text  = darkMode ? "text-white"   : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  const userId     = user?.id || "demo";
  const routingNum = "021000021";
  const accountNum = "8" + userId.replace(/[^0-9]/g, "").padEnd(9, "0").slice(0, 9);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className={`w-full sm:max-w-md ${bg} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div>
            <h3 className={`font-extrabold text-xl ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Add Funds</h3>
            <p className={`text-xs ${muted}`}>Deposit to your USD wallet</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8">
          <div className="space-y-2 mb-6">
            {METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${method === m.id ? "border-primary bg-primary/8" : darkMode ? "border-white/10 hover:border-white/20" : "border-black/10 hover:border-black/20"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${method === m.id ? "bg-primary/20" : darkMode ? "bg-white/5" : "bg-black/5"}`}>
                  <m.icon className={`w-5 h-5 ${method === m.id ? "text-primary" : muted}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${text}`}>{m.label}</p>
                  <p className={`text-xs ${muted}`}>{m.sub}</p>
                </div>
                {m.badge && (
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full flex-shrink-0 ${
                    m.badge === "INSTANT" ? "bg-emerald-500/20 text-emerald-500" :
                    m.badge === "NEW"     ? "bg-blue-500/20 text-blue-400" :
                    "bg-primary/20 text-primary"
                  }`}>{m.badge}</span>
                )}
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${method === m.id ? "border-primary" : darkMode ? "border-white/20" : "border-black/20"}`}>
                  {method === m.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {(method === "ach" || method === "wire") && (
              <motion.div key={method} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className={`rounded-2xl border p-4 mb-4 ${card}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-3`}>
                    {method === "ach" ? "ACH Deposit Details" : "Wire Transfer Details"}
                  </p>
                  <CopyRow label="Bank Name"            value="KinnectFi Bancorp (FDIC)"           darkMode={darkMode} />
                  <CopyRow label="Routing Number (ABA)" value={routingNum}                          darkMode={darkMode} />
                  <CopyRow label="Account Number"       value={accountNum}                          darkMode={darkMode} />
                  {method === "wire" && <CopyRow label="SWIFT / BIC" value="KFIBUS33"              darkMode={darkMode} />}
                  <CopyRow label="Account Type"         value="Checking"                            darkMode={darkMode} />
                  <CopyRow label="Beneficiary Name"     value={user?.full_name || "KinnectFi User"} darkMode={darkMode} />
                </div>
                <div className="flex items-start gap-3 bg-primary/10 border border-primary/20 rounded-xl p-3">
                  <span className="text-primary text-lg flex-shrink-0">ℹ️</span>
                  <p className="text-primary text-xs leading-relaxed">
                    {method === "ach"
                      ? "Use these details to transfer from your US bank. ACH deposits typically arrive in 1–3 business days. No fees charged by KinnectFi."
                      : "Wire transfers from US banks arrive the same day if sent before 3PM ET. International wires take 1–2 business days."}
                  </p>
                </div>
              </motion.div>
            )}

            {method === "instant" && (
              <motion.div key="instant" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {instantSuccess ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className={`font-extrabold text-xl mb-1 ${text}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Deposit Successful!</p>
                    <p className="text-emerald-400 font-black text-2xl mb-1">${parseFloat(instantAmount || 0).toFixed(2)}</p>
                    <p className={`text-sm ${muted} mb-5`}>Added to your USD wallet · Available now</p>
                    <button onClick={onClose} className="bg-primary text-secondary font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90">Done ✓</button>
                  </motion.div>
                ) : (
                  <div className={`rounded-2xl border p-5 ${card}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-4`}>Instant Deposit via Debit Card</p>
                    <div className="space-y-3 mb-4">
                      <input placeholder="Card Number" inputMode="numeric"
                        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${darkMode ? "bg-[#1a2332] border-white/10 text-white placeholder-white/30" : "bg-white border-black/10 text-[#1a2a4a]"}`} />
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="MM / YY" inputMode="numeric"
                          className={`border rounded-xl px-4 py-3 text-sm outline-none ${darkMode ? "bg-[#1a2332] border-white/10 text-white placeholder-white/30" : "bg-white border-black/10 text-[#1a2a4a]"}`} />
                        <input placeholder="CVV" inputMode="numeric"
                          className={`border rounded-xl px-4 py-3 text-sm outline-none ${darkMode ? "bg-[#1a2332] border-white/10 text-white placeholder-white/30" : "bg-white border-black/10 text-[#1a2a4a]"}`} />
                      </div>
                      <div className={`flex items-center border rounded-xl overflow-hidden ${darkMode ? "bg-[#1a2332] border-white/10" : "bg-white border-black/10"}`}>
                        <span className={`px-3 text-lg font-bold ${muted}`}>$</span>
                        <input type="number" inputMode="decimal" placeholder="0.00"
                          value={instantAmount} onChange={e => setInstantAmount(e.target.value)}
                          className={`flex-1 py-3 pr-4 bg-transparent outline-none text-lg font-bold ${darkMode ? "text-white" : "text-[#1a2a4a]"}`} />
                      </div>
                    </div>
                    <button
                      disabled={!instantAmount || parseFloat(instantAmount) <= 0 || depositing}
                      onClick={async () => {
                        haptic.medium();
                        setDepositing(true);
                        const res = await processDeposit({
                          amount: parseFloat(instantAmount),
                          method: "instant",
                          currency_code: "USD",
                        });
                        setDepositing(false);
                        if (res?.data?.success) {
                          setInstantSuccess(true);
                        }
                      }}
                      className="w-full bg-primary text-secondary font-black py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {depositing
                        ? <><span className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />Processing...</>
                        : "Deposit Instantly →"}
                    </button>
                    <p className={`text-[10px] ${muted} text-center mt-2`}>1.5% processing fee · Funds available immediately</p>
                  </div>
                )}
              </motion.div>
            )}

            {method === "crypto" && (
              <motion.div key="crypto" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className={`rounded-2xl border p-5 mb-4 ${card}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${text}`}>Your On-Chain Wallet</p>
                      <p className={`text-xs ${muted}`}>USDC on Base · Non-custodial</p>
                    </div>
                  </div>
                  {walletAddress ? (
                    <CopyRow label="Your USDC Deposit Address (Base)" value={walletAddress} darkMode={darkMode} />
                  ) : (
                    <div className="flex items-center gap-2 py-3">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <p className={`text-xs ${muted}`}>Creating your wallet…</p>
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
                  <span className="text-blue-400 text-lg flex-shrink-0">🔗</span>
                  <p className="text-blue-400 text-xs leading-relaxed">
                    Send <strong>USDC on Base</strong> to this address from any exchange (Coinbase, Binance, etc.) or another wallet. Funds arrive in ~30 seconds.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                  <span className="text-yellow-400 text-base flex-shrink-0">⚠️</span>
                  <p className="text-yellow-400 text-xs leading-relaxed">
                    Only send <strong>USDC on the Base network</strong>. Sending other tokens or on other networks may result in permanent loss.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}