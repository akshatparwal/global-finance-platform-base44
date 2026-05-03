/**
 * CardTransactionFeed — shows recent transfers as virtual card transactions.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TransactionSkeleton } from "@/components/ui/SkeletonLoader";

export default function CardTransactionFeed({ cardLast4, darkMode }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Transfer.filter({ category: "other" }, "-created_date", 8)
      .then(setTransfers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const divider = darkMode ? "border-white/5" : "border-black/5";

  return (
    <div className={`border rounded-2xl ${card}`}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className={`font-bold ${text}`}>Card Transactions</h3>
          {cardLast4 && <p className={`text-xs ${muted}`}>VISA •••• {cardLast4}</p>}
        </div>
        <span className="bg-emerald-500/20 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded-full">LIVE</span>
      </div>

      {loading && (
        <div className="px-4 pb-4">
          <TransactionSkeleton darkMode={darkMode} count={4} />
        </div>
      )}

      {!loading && transfers.length === 0 && (
        <div className="text-center py-10 px-5">
          <p className="text-3xl mb-2">💳</p>
          <p className={`text-sm font-semibold ${text} mb-1`}>No transactions yet</p>
          <p className={`text-xs ${muted}`}>Your card activity will appear here once you make transfers.</p>
        </div>
      )}

      {!loading && transfers.length > 0 && (
        <div className="divide-y divide-transparent">
          {transfers.map((t, i) => (
            <div key={t.id || i} className={`flex items-center gap-3 px-5 py-3.5 border-t ${divider}`}>
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                {t.merchant_emoji || t.recipient_name?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${text}`}>{t.merchant_name || `To: ${t.recipient_name}`}</p>
                <p className={`text-[10px] ${muted}`}>{t.recipient_bank || "KinnectFi"} · {new Date(t.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-black ${text}`}>-${t.amount_usd?.toFixed(2)}</p>
                <p className={`text-[9px] font-bold uppercase ${t.status === "completed" ? "text-emerald-500" : "text-yellow-400"}`}>{t.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={`px-5 py-3 border-t ${divider} flex items-center justify-between`}>
        <p className={`text-xs ${muted}`}>{transfers.length} recent transactions</p>
        <p className={`text-xs font-bold text-primary`}>-${transfers.reduce((s, t) => s + (t.amount_usd || 0), 0).toFixed(2)} total</p>
      </div>
    </div>
  );
}