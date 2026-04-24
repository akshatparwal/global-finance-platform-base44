import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import TransactionList from "@/components/transactions/TransactionList";

export default function Transactions() {
  const { darkMode, taglish } = useOutletContext() || {};
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  useEffect(() => {
    base44.entities.Transfer.list("-created_date", 100)
      .then(setTransfers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = base44.entities.Transfer.subscribe((event) => {
      if (event.type === "create") {
        setTransfers(prev => [event.data, ...prev]);
      } else if (event.type === "update") {
        setTransfers(prev => prev.map(t => t.id === event.id ? event.data : t));
      } else if (event.type === "delete") {
        setTransfers(prev => prev.filter(t => t.id !== event.id));
      }
    });
    return unsub;
  }, []);

  const totalThisMonth = transfers
    .filter(t => {
      const d = new Date(t.created_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, t) => s + (t.amount_usd || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-extrabold sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {taglish ? "Kasaysayan ng Transaksyon" : "Transaction History"}
        </h1>
        <p className={`text-xs ${muted}`}>
          {taglish ? "Lahat ng iyong padala at bayad" : "All your transfers, bills & subscriptions"}
        </p>
      </div>

      {/* Month summary pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {[
          { label: "This Month", value: `$${totalThisMonth.toFixed(2)}`, sub: "spent" },
          { label: "Remittances", value: `${transfers.filter(t => t.category === "remittance").length}`, sub: "transfers" },
          { label: "Avg Fee", value: "$0.00", sub: "per transfer" },
        ].map((s, i) => (
          <div
            key={i}
            className={`flex-shrink-0 rounded-2xl px-4 py-3 border ${darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/8"}`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-0.5`}>{s.label}</p>
            <p className={`font-black text-lg ${darkMode ? "text-white" : "text-[#1a2a4a]"}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {s.value}
            </p>
            <p className={`text-[10px] ${muted}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      <TransactionList transfers={transfers} loading={loading} darkMode={darkMode} taglish={taglish} />
    </div>
  );
}