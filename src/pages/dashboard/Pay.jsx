import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, RefreshCw, Shield, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLiveRates } from "@/hooks/useLiveRates";

const RECENT = [
  { initials: "NM", label: "Nanay", color: "bg-purple-500", bank: "GCash" },
  { initials: "TJ", label: "Tatay", color: "bg-blue-500", bank: "BDO" },
  { initials: "AR", label: "Ate", color: "bg-red-500", bank: "BPI" },
  { initials: "KM", label: "Kuya", color: "bg-yellow-500", bank: "GCash" },
  { initials: "TL", label: "Tita", color: "bg-teal-500", bank: "Metrobank" },
];

const SCHEDULED = [
  { emoji: "🏠", label: "Rent Payment", sub: "Monthly · 1st · Next: May 1", amount: "$1,800.00" },
  { emoji: "⚡", label: "Meralco (Electricity)", sub: "Monthly · 15th · Next: May 15", amount: "₱3,450.00" },
  { emoji: "💧", label: "Maynilad (Water)", sub: "Monthly · 20th · Next: May 20", amount: "₱890.00" },
  { emoji: "🏛️", label: "SSS Multi-Purpose Loan", sub: "Monthly · 28th · Next: May 28", amount: "₱1,200.00" },
  { emoji: "📡", label: "Internet", sub: "Monthly · 20th · Next: May 20", amount: "$65.00" },
];

const PAY_TABS = ["Transfer History", "Tools", "Protection", "Shipments"];

export default function Pay() {
  const { darkMode, taglish } = useOutletContext() || {};
  const [sendAmount, setSendAmount] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("Transfer History");
  const { rates, loading: ratesLoading } = useLiveRates();
  const rate = rates?.USDPHP || 56.24;
  const receive = sendAmount ? (parseFloat(sendAmount) * rate).toFixed(2) : "0.00";
  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const inputBg = darkMode ? "bg-[#0d1526] border-white/10 text-white placeholder-white/30" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";

  useEffect(() => {
    base44.entities.Transfer.list("-created_date", 10).then(setTransfers).catch(() => {});
  }, []);

  const handleSend = async () => {
    const amt = parseFloat(sendAmount);
    if (!amt || amt <= 0) return;
    setSending(true);

    // Optimistic entry — shown immediately
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticTransfer = {
      id: optimisticId,
      amount_usd: amt,
      amount_php: parseFloat(receive),
      recipient_name: selectedRecipient?.label || "Family",
      recipient_bank: selectedRecipient?.bank || "GCash",
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
        recipient_name: optimisticTransfer.recipient_name,
        recipient_bank: optimisticTransfer.recipient_bank,
        status: "completed",
        rate,
        fee: 2.99,
      });
      // Replace optimistic entry with real one
      setTransfers(prev => prev.map(t => t.id === optimisticId ? { ...saved, status: "completed" } : t));
      alert(`✅ Transfer of $${amt} (₱${receive}) sent successfully to ${optimisticTransfer.recipient_name}!\n\nArrival: ~30 seconds`);
    } catch {
      // Roll back optimistic entry on failure
      setTransfers(prev => prev.filter(t => t.id !== optimisticId));
      setSendAmount(String(amt));
      alert("Transfer failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {taglish ? "Magpadala" : "Send Money"}
          </h1>
          <p className={`text-sm ${muted}`}>{taglish ? "Mabilis at ligtas na padala" : "Fast, secure cross-border transfers"}</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-primary text-xs font-bold">NEXT SWELDO DAY: APR 30</span>
        </div>
      </div>

      {/* Best time banner */}
      <div className={`border rounded-2xl p-4 mb-6 flex items-start justify-between ${card}`}>
        <div className="flex items-start gap-3">
          <span className="text-primary text-xl">🕐</span>
          <div>
            <h3 className="font-bold text-sm">{taglish ? "Pinakamabuting Oras Magpadala" : "Best Time to Send"}</h3>
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
        <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 mb-5 ${inputBg}`}>
          <Search className="w-4 h-4 opacity-40" />
          <input placeholder={taglish ? "Hanapin ang tatanggap..." : "Search by email or name..."}
            className="flex-1 bg-transparent outline-none text-sm" />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className={`text-xs font-bold uppercase tracking-wider ${muted}`}>{taglish ? "Kamakailan:" : "Recent:"}</span>
          <div className="flex gap-2">
            {RECENT.map((r,i) => (
              <button key={i} onClick={() => setSelectedRecipient(r === selectedRecipient ? null : r)}
                className="flex flex-col items-center gap-1 group">
                <div className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center text-white text-xs font-black group-hover:scale-110 transition-transform ring-2 ${selectedRecipient?.initials === r.initials ? "ring-primary" : "ring-transparent"}`}>{r.initials}</div>
                <span className={`text-[9px] ${muted}`}>{r.label}</span>
              </button>
            ))}
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-current opacity-30 flex items-center justify-center"><Plus className="w-3 h-3" /></div>
              <span className={`text-[9px] ${muted}`}>{taglish ? "Dagdag" : "Add"}</span>
            </button>
          </div>
        </div>

        {selectedRecipient && (
          <div className="mb-4 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-primary text-sm">✓</span>
            <span className="text-primary text-sm font-bold">Sending to: {selectedRecipient.label} via {selectedRecipient.bank}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={`text-xs font-bold uppercase tracking-wider ${muted} mb-2 block`}>{taglish ? "Ipadala" : "You Send"}</label>
            <div className="flex items-center gap-2">
              <input value={sendAmount} onChange={e => setSendAmount(e.target.value.replace(/[^0-9.]/g,""))}
                placeholder="$ 0.00" className={`flex-1 border rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-primary transition-colors ${inputBg}`} />
              <div className="bg-[#0d1526] text-white rounded-xl px-3 py-3 flex items-center gap-1 flex-shrink-0">
                <span>🇺🇸</span><span className="text-sm font-bold">USD</span>
              </div>
            </div>
          </div>
          <div>
            <label className={`text-xs font-bold uppercase tracking-wider ${muted} mb-2 block`}>{taglish ? "Matatanggap" : "They Receive"}</label>
            <div className="flex items-center gap-2">
              <div className={`flex-1 border rounded-xl px-4 py-3 text-lg font-bold ${inputBg}`}>₱ {receive}</div>
              <div className="bg-primary text-secondary rounded-xl px-3 py-3 flex items-center gap-1 flex-shrink-0">
                <span>🇵🇭</span><span className="text-sm font-bold">PHP</span>
              </div>
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

        <div className={`rounded-xl p-4 mb-4 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
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

        <button onClick={handleSend} disabled={!sendAmount || parseFloat(sendAmount) <= 0 || sending}
          className={`w-full py-4 rounded-xl font-bold text-lg text-secondary transition-all hover:opacity-90 ${sendAmount && parseFloat(sendAmount) > 0 ? "bg-primary" : "bg-primary/40 cursor-not-allowed"}`}>
          {sending ? "SENDING..." : taglish ? "MAGPADALA →" : "SEND NOW →"}
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl mb-4 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
        {PAY_TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === t ? "bg-primary text-secondary" : muted}`}>{t}</button>
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
                <div key={i} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border ${card}`}>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">
                    {t.recipient_name?.[0] || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{t.recipient_name}</p>
                    <p className={`text-xs ${muted}`}>{t.recipient_bank} · {new Date(t.created_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${t.amount_usd}</p>
                    <span className={`text-[10px] font-bold uppercase ${t.status === "completed" ? "text-emerald-500" : "text-primary"}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="font-bold mb-3">{taglish ? "Naka-iskedyul na Bayad" : "Scheduled & Bills"}</h3>
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
      )}

      {activeTab === "Tools" && (
        <div className={`border rounded-2xl p-6 ${card}`}>
          <h3 className="font-bold mb-4">Transfer Tools</h3>
          <div className="space-y-3">
            {[
              { icon: "📊", label: "Rate Alerts", sub: "Get notified when PHP/USD hits your target rate", action: () => alert("Rate alerts — set your target rate and we'll notify you!") },
              { icon: "🔄", label: "Auto-Padala", sub: "Schedule recurring transfers automatically", action: () => alert("Auto-Padala — schedule monthly transfers to your family!") },
              { icon: "💱", label: "Currency Converter", sub: "Convert between 10+ currencies", action: () => alert("Multi-currency converter coming soon!") },
            ].map((tool, i) => (
              <button key={i} onClick={tool.action}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left hover:border-primary/30 transition-colors ${card}`}>
                <span className="text-2xl">{tool.icon}</span>
                <div><p className="font-semibold text-sm">{tool.label}</p><p className={`text-xs ${muted}`}>{tool.sub}</p></div>
              </button>
            ))}
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
    </div>
  );
}