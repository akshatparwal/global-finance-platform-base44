/**
 * CurrencyConverter — real inline converter for the Tools tab.
 */
import { useState, useMemo } from "react";
import { ArrowLeftRight } from "lucide-react";

const CURRENCIES = [
  { code: "USD", flag: "🇺🇸", name: "US Dollar" },
  { code: "PHP", flag: "🇵🇭", name: "Philippine Peso" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
  { code: "AED", flag: "🇦🇪", name: "UAE Dirham" },
  { code: "SAR", flag: "🇸🇦", name: "Saudi Riyal" },
  { code: "SGD", flag: "🇸🇬", name: "Singapore Dollar" },
  { code: "HKD", flag: "🇭🇰", name: "Hong Kong Dollar" },
  { code: "JPY", flag: "🇯🇵", name: "Japanese Yen" },
  { code: "KRW", flag: "🇰🇷", name: "Korean Won" },
];

// Approximate rates vs USD
const RATES_TO_USD = {
  USD: 1, PHP: 56.24, EUR: 0.92, GBP: 0.79,
  AED: 3.67, SAR: 3.75, SGD: 1.35, HKD: 7.82,
  JPY: 154.5, KRW: 1350,
};

export default function CurrencyConverter({ darkMode }) {
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("PHP");
  const [amount, setAmount] = useState("100");

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";
  const inputBg = darkMode ? "bg-[#0d1526] border-white/10 text-white" : "bg-[#f5efe6] border-black/10 text-[#1a2a4a]";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";

  const converted = useMemo(() => {
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt)) return "0.00";
    const inUSD = amt / RATES_TO_USD[fromCode];
    const result = inUSD * RATES_TO_USD[toCode];
    return result >= 100 ? result.toLocaleString("en-US", { maximumFractionDigits: 2 }) : result.toFixed(4);
  }, [amount, fromCode, toCode]);

  const effectiveRate = useMemo(() => {
    const r = RATES_TO_USD[toCode] / RATES_TO_USD[fromCode];
    return r >= 1 ? r.toFixed(4) : (1 / r).toFixed(4);
  }, [fromCode, toCode]);

  const swap = () => { setFromCode(toCode); setToCode(fromCode); };

  const fromCur = CURRENCIES.find(c => c.code === fromCode);
  const toCur   = CURRENCIES.find(c => c.code === toCode);

  return (
    <div className={`border rounded-2xl p-5 ${card}`}>
      <h3 className={`font-bold mb-4 ${text}`}>💱 Currency Converter</h3>

      {/* Amount input */}
      <div className="mb-3">
        <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1.5 block`}>Amount</label>
        <div className={`flex items-center border rounded-xl overflow-hidden ${inputBg}`}>
          <div className={`px-3 h-12 flex items-center text-sm font-bold border-r ${darkMode ? "border-white/10 text-white/50" : "border-black/10 text-black/50"}`}>
            {fromCur?.flag}
          </div>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 bg-transparent px-3 h-12 text-xl font-black outline-none"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* From / To selectors + swap */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1.5 block`}>From</label>
          <select
            value={fromCode}
            onChange={e => setFromCode(e.target.value)}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold outline-none ${inputBg}`}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={swap}
          className="mt-5 w-10 h-10 flex-shrink-0 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <label className={`text-[10px] font-bold uppercase tracking-wider ${muted} mb-1.5 block`}>To</label>
          <select
            value={toCode}
            onChange={e => setToCode(e.target.value)}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold outline-none ${inputBg}`}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg, #1a2a4a, #3d2e00)" }}>
        <p className="text-white/40 text-xs mb-1">{amount || 0} {fromCode} equals</p>
        <p className="text-white font-black text-3xl mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {toCur?.flag} {converted} {toCode}
        </p>
        <p className="text-white/30 text-xs">
          1 {fromCode} ≈ {RATES_TO_USD[toCode] / RATES_TO_USD[fromCode] >= 1
            ? `${(RATES_TO_USD[toCode] / RATES_TO_USD[fromCode]).toFixed(4)} ${toCode}`
            : `${(RATES_TO_USD[fromCode] / RATES_TO_USD[toCode]).toFixed(4)} ${fromCode}`
          }
        </p>
      </div>

      {/* Quick amounts */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {[50, 100, 200, 500, 1000].map(v => (
          <button
            key={v}
            onClick={() => setAmount(String(v))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              amount === String(v)
                ? "border-primary bg-primary/10 text-primary"
                : darkMode ? "border-white/10 text-white/50 hover:border-primary/30" : "border-black/10 text-black/50 hover:border-primary/30"
            }`}
          >
            {fromCur?.flag} {v}
          </button>
        ))}
      </div>

      <p className={`text-[10px] ${muted} mt-3 text-center`}>Rates are indicative. KinnectFi live rates apply at transfer time.</p>
    </div>
  );
}