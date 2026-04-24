import { useState, useMemo } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import TransactionDetailSheet from "./TransactionDetailSheet";

const CATEGORY_META = {
  remittance:    { label: "Remittance",    emoji: "💸", color: "bg-blue-500/15 text-blue-400",    dot: "bg-blue-400" },
  bills:         { label: "Bills",         emoji: "⚡", color: "bg-orange-500/15 text-orange-400", dot: "bg-orange-400" },
  subscriptions: { label: "Subscriptions", emoji: "📺", color: "bg-purple-500/15 text-purple-400", dot: "bg-purple-400" },
  savings:       { label: "Savings",       emoji: "🏦", color: "bg-emerald-500/15 text-emerald-400",dot: "bg-emerald-400" },
  other:         { label: "Other",         emoji: "💳", color: "bg-gray-500/15 text-gray-400",     dot: "bg-gray-400" },
};

const STATUS_META = {
  completed: { color: "text-emerald-400" },
  pending:   { color: "text-yellow-400" },
  failed:    { color: "text-red-400" },
};

const DATE_FILTERS = [
  { label: "All Time", value: "all" },
  { label: "Today",    value: "today" },
  { label: "This Week",value: "week" },
  { label: "This Month",value:"month" },
];

function groupByDate(txs) {
  const groups = {};
  txs.forEach(tx => {
    const d = new Date(tx.created_date);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    let label;
    if (d.toDateString() === today.toDateString()) label = "Today";
    else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
    else label = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });
  return groups;
}

export default function TransactionList({ transfers = [], loading, darkMode, taglish }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/8";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const inputBg = darkMode ? "bg-white/8 border-white/10 text-white placeholder-white/30" : "bg-black/5 border-black/10 text-[#1a2a4a]";

  const filtered = useMemo(() => {
    let txs = [...transfers].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    // Search
    if (search) {
      const q = search.toLowerCase();
      txs = txs.filter(t =>
        t.recipient_name?.toLowerCase().includes(q) ||
        t.merchant_name?.toLowerCase().includes(q) ||
        t.recipient_bank?.toLowerCase().includes(q) ||
        t.note?.toLowerCase().includes(q)
      );
    }

    // Category
    if (categoryFilter !== "all") {
      txs = txs.filter(t => t.category === categoryFilter);
    }

    // Date
    if (dateFilter !== "all") {
      const now = new Date();
      txs = txs.filter(t => {
        const d = new Date(t.created_date);
        if (dateFilter === "today") return d.toDateString() === now.toDateString();
        if (dateFilter === "week") return (now - d) < 7 * 86400000;
        if (dateFilter === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        return true;
      });
    }

    return txs;
  }, [transfers, search, categoryFilter, dateFilter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const totalSpent = filtered.reduce((s, t) => s + (t.amount_usd || 0), 0);

  const activeFiltersCount = (categoryFilter !== "all" ? 1 : 0) + (dateFilter !== "all" ? 1 : 0);

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="flex gap-2 mb-3">
        <div className={`flex-1 flex items-center gap-2 border rounded-xl px-3 py-2.5 ${inputBg}`}>
          <Search className="w-4 h-4 opacity-40 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={taglish ? "Hanapin ang transaksyon..." : "Search transactions..."}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 opacity-40" /></button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border font-bold text-sm flex-shrink-0 transition-colors ${
            showFilters || activeFiltersCount > 0
              ? "border-primary bg-primary/10 text-primary"
              : `${darkMode ? "border-white/10 text-white/60" : "border-black/10 text-[#1a2a4a]/60"}`
          }`}
        >
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-secondary text-[9px] font-black rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className={`border rounded-2xl p-4 mb-3 ${card}`}>
          <div className="mb-3">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2`}>Category</p>
            <div className="flex flex-wrap gap-1.5">
              {[{ value: "all", label: "All", emoji: "🔍" }, ...Object.entries(CATEGORY_META).map(([k, v]) => ({ value: k, label: v.label, emoji: v.emoji }))].map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => setCategoryFilter(value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    categoryFilter === value
                      ? "bg-primary text-secondary"
                      : darkMode ? "bg-white/8 text-white/60 hover:bg-white/15" : "bg-black/8 text-black/60 hover:bg-black/12"
                  }`}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-2`}>Date Range</p>
            <div className="flex flex-wrap gap-1.5">
              {DATE_FILTERS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setDateFilter(value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    dateFilter === value
                      ? "bg-primary text-secondary"
                      : darkMode ? "bg-white/8 text-white/60 hover:bg-white/15" : "bg-black/8 text-black/60 hover:bg-black/12"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setCategoryFilter("all"); setDateFilter("all"); }}
              className="mt-3 text-xs text-red-400 font-bold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border mb-3 ${card}`}>
          <span className={`text-xs font-semibold ${muted}`}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
          <span className={`text-sm font-black ${text}`}>-${totalSpent.toFixed(2)}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-16 rounded-xl animate-pulse ${darkMode ? "bg-white/5" : "bg-black/5"}`} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className={`border rounded-2xl p-10 text-center ${card}`}>
          <p className="text-3xl mb-2">🔍</p>
          <p className={`text-sm font-semibold ${text} mb-1`}>No transactions found</p>
          <p className={`text-xs ${muted}`}>{search ? "Try a different search term" : "Your transactions will appear here"}</p>
        </div>
      )}

      {/* Grouped transactions */}
      {!loading && Object.entries(grouped).map(([dateLabel, txs]) => (
        <div key={dateLabel} className="mb-4">
          {/* Date header */}
          <div className="flex items-center justify-between mb-2 px-1">
            <p className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>{dateLabel}</p>
            <p className={`text-[10px] font-bold ${muted}`}>
              -${txs.reduce((s, t) => s + (t.amount_usd || 0), 0).toFixed(2)}
            </p>
          </div>

          {/* Transaction rows */}
          <div className={`border rounded-2xl overflow-hidden ${card}`}>
            {txs.map((tx, i) => {
              const cat = CATEGORY_META[tx.category] || CATEGORY_META.other;
              const statusMeta = STATUS_META[tx.status] || STATUS_META.completed;
              return (
                <button
                  key={tx.id || i}
                  onClick={() => setSelectedTx(tx)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b last:border-0 ${
                    darkMode ? "border-white/5 hover:bg-white/4" : "border-black/5 hover:bg-black/3"
                  } active:scale-[0.99]`}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
                    style={{ background: tx.merchant_color || "linear-gradient(135deg, #1a2a4a, #3d2e00)" }}
                  >
                    {tx.merchant_emoji || cat.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${text}`}>
                      {tx.merchant_name || tx.recipient_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${cat.color.split(" ")[1]}`}>
                        {cat.emoji} {cat.label}
                      </span>
                      {tx.recipient_bank && (
                        <>
                          <span className={`text-[9px] ${muted}`}>·</span>
                          <span className={`text-[9px] ${muted} truncate`}>{tx.recipient_bank}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount + status */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-black ${text}`}>-${tx.amount_usd?.toFixed(2)}</p>
                    <p className={`text-[9px] font-bold uppercase ${statusMeta.color}`}>{tx.status}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Detail sheet */}
      {selectedTx && (
        <TransactionDetailSheet
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}