import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, RefreshCw, Shield, Clock, Plus } from "lucide-react";

const RECENT = [
  { initials: "NM", label: "Nanay", color: "bg-purple-500" },
  { initials: "TJ", label: "Tatay", color: "bg-blue-500" },
  { initials: "AR", label: "Ate", color: "bg-red-500" },
  { initials: "KM", label: "Kuya", color: "bg-yellow-500" },
  { initials: "TL", label: "Tita", color: "bg-teal-500" },
];

const SCHEDULED = [
  { emoji: "🏠", label: "Rent Payment", sub: "Monthly · 1st · Next: Apr 1", amount: "$1,800.00" },
  { emoji: "⚡", label: "Meralco (Electricity)", sub: "Monthly · 15th · Next: Mar 15", amount: "₱3,450.00" },
  { emoji: "💧", label: "Maynilad (Water)", sub: "Monthly · 20th · Next: Mar 20", amount: "₱890.00" },
  { emoji: "🏛️", label: "SSS Multi-Purpose Loan", sub: "Monthly · 28th · Next: Mar 28", amount: "₱1,200.00" },
  { emoji: "📡", label: "Internet", sub: "Monthly · 20th · Next: Mar 20", amount: "$65.00" },
];

export default function Pay() {
  const { darkMode } = useOutletContext() || {};
  const [sendAmount, setSendAmount] = useState("");
  const rate = 56.2;
  const receive = sendAmount ? (parseFloat(sendAmount) * rate).toFixed(2) : "0.00";
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const inputBg = darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Send Money</h1>
          <p className={`text-sm ${muted}`}>Fast, secure cross-border transfers</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-primary text-xs font-bold">NEXT SWELDO DAY: MAR 30</span>
        </div>
      </div>

      {/* Best time banner */}
      <div className={`border rounded-2xl p-4 mb-6 flex items-start justify-between ${card}`}>
        <div className="flex items-start gap-3">
          <span className="text-primary text-xl">🕐</span>
          <div>
            <h3 className="font-bold text-sm">Best Time to Send</h3>
            <p className={`text-xs ${muted} mb-1`}>The current rate of ₱56.42 is in the top 5% of the last 30 days. Send now for maximum value!</p>
            <div className="flex gap-3 text-xs">
              <span className="text-primary">↑ +₱0.42 vs. last week</span>
              <span className={muted}>⏱ Rate may dip in 4h</span>
            </div>
          </div>
        </div>
        <span className="bg-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase px-2 py-1 rounded-full">HIGHLY OPTIMAL</span>
      </div>

      {/* Send form */}
      <div className={`border rounded-2xl p-6 mb-6 ${card}`}>
        <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 mb-5 ${inputBg} border`}>
          <Search className="w-4 h-4 opacity-40" />
          <input placeholder="Search by email or name..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className={`text-xs font-bold uppercase tracking-wider ${muted}`}>Recent:</span>
          <div className="flex gap-2">
            {RECENT.map((r,i) => (
              <div key={i} className="flex flex-col items-center gap-1 cursor-pointer group">
                <div className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center text-white text-xs font-black group-hover:scale-110 transition-transform`}>{r.initials}</div>
                <span className={`text-[9px] ${muted}`}>{r.label}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-current opacity-30 flex items-center justify-center"><Plus className="w-3 h-3" /></div>
              <span className={`text-[9px] ${muted}`}>Add</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={`text-xs font-bold uppercase tracking-wider ${muted} mb-2 block`}>You Send</label>
            <div className="flex items-center gap-2">
              <input value={sendAmount} onChange={e => setSendAmount(e.target.value.replace(/[^0-9.]/g,""))}
                placeholder="$ 0.00" className={`flex-1 border rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-primary transition-colors ${inputBg}`} />
              <div className="bg-[#0d1526] text-white rounded-xl px-3 py-3 flex items-center gap-1 flex-shrink-0">
                <span>🇺🇸</span><span className="text-sm font-bold">USD</span>
              </div>
            </div>
          </div>
          <div>
            <label className={`text-xs font-bold uppercase tracking-wider ${muted} mb-2 block`}>They Receive</label>
            <div className="flex items-center gap-2">
              <div className={`flex-1 border rounded-xl px-4 py-3 text-lg font-bold ${inputBg}`}>₱ {receive}</div>
              <div className="bg-primary text-secondary rounded-xl px-3 py-3 flex items-center gap-1 flex-shrink-0">
                <span>🇵🇭</span><span className="text-sm font-bold">PHP</span>
                <span className="text-xs">→</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between py-3 border-t border-b ${darkMode ? "border-white/5" : "border-black/5"} mb-4`}>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3 h-3 text-primary" />
            <span className={`text-xs font-bold uppercase tracking-wider ${muted}`}>Live Exchange Rate</span>
          </div>
          <span className="font-bold text-sm">1 USD = {rate} PHP</span>
        </div>

        <div className={`rounded-xl p-4 mb-4 ${darkMode ? "bg-white/3" : "bg-black/3"}`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider">Zero Spread Guarantee</span>
            </div>
            <span className="text-primary text-xs font-bold">🔒 INSURED TRANSFER</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className={muted}>Kinnect Transfer fee</span><span className="font-bold">$2.99</span></div>
            <div className="flex justify-between"><span className={muted}>FX Markup</span><span className="text-primary font-bold">COMMISSION FREE</span></div>
            <div className="flex justify-between"><span className={muted}>Arrival time</span><span className="text-primary font-bold">Instant (~30s)</span></div>
          </div>
        </div>

        <button className={`w-full py-4 rounded-xl font-bold text-lg text-secondary transition-all hover:opacity-90 ${sendAmount && parseFloat(sendAmount) > 0 ? "bg-primary" : "bg-primary/40 cursor-not-allowed"}`}>
          CONTINUE →
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl mb-4 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
        {["Transfer History","Tools","Protection","Shipments"].map(t => (
          <button key={t} className={`flex-1 py-2 rounded-lg text-xs font-semibold ${t === "Transfer History" ? "bg-white/10 text-current" : muted}`}>{t}</button>
        ))}
      </div>

      <div>
        <h3 className="font-bold mb-3">Recent Transfers</h3>
        <div className={`border rounded-xl p-6 text-center mb-6 ${card}`}>
          <p className={`text-sm ${muted}`}>No transfers yet. Send your first padala!</p>
        </div>

        <h3 className="font-bold mb-3">Scheduled & Bills</h3>
        <div className="space-y-2">
          {SCHEDULED.map((s,i) => (
            <div key={i} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border ${card}`}>
              <span className="text-2xl flex-shrink-0">{s.emoji}</span>
              <div className="flex-1"><p className="font-semibold text-sm">{s.label}</p><p className={`text-xs ${muted}`}>{s.sub}</p></div>
              <div className="text-right"><p className="font-bold text-sm">{s.amount}</p><span className="text-primary text-[10px] font-bold uppercase">ACTIVE</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}