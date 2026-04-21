import { useMemo } from "react";
import { Shield, Zap, Info, TrendingDown, CheckCircle } from "lucide-react";

const KINNECT_FEE = 2.99;       // flat USD fee
const FX_MARKUP   = 0;          // zero spread
const COMPETITOR_MARKUP = 0.025; // 2.5% typical competitor markup for comparison

export default function TransferEstimator({ sendAmount, rate, darkMode, taglish }) {
  const amt = parseFloat(sendAmount) || 0;

  const calc = useMemo(() => {
    if (amt <= 0 || !rate) return null;

    const netUSD       = Math.max(amt - KINNECT_FEE, 0);   // USD after fee deducted
    const phpReceived  = netUSD * rate;                      // final PHP to recipient
    const grossPhp     = amt * rate;                         // PHP if no fee existed
    const feeInPhp     = KINNECT_FEE * rate;                 // fee expressed in PHP
    const effectiveRate= phpReceived / amt;                  // effective rate including fee
    const savings      = amt * COMPETITOR_MARKUP * rate;     // PHP saved vs competitor

    // Competitor comparison: they charge 2.5% markup on rate + higher fee ($4.99)
    const competitorRate = rate * (1 - COMPETITOR_MARKUP);
    const competitorPhp  = (amt - 4.99) * competitorRate;
    const youSave        = phpReceived - competitorPhp;

    return { netUSD, phpReceived, grossPhp, feeInPhp, effectiveRate, savings, competitorPhp, youSave };
  }, [amt, rate]);

  const muted    = darkMode ? "text-white/50"  : "text-[#1a2a4a]/50";
  const text     = darkMode ? "text-white"     : "text-[#1a2a4a]";
  const divider  = darkMode ? "border-white/5" : "border-black/5";
  const rowBg    = darkMode ? "bg-white/3"     : "bg-black/[0.02]";

  if (amt <= 0 || !calc) {
    return (
      <div className={`rounded-xl p-4 border ${darkMode ? "border-white/5 bg-white/3" : "border-black/5 bg-black/[0.02]"}`}>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">Transfer Estimator</span>
        </div>
        <p className={`text-xs ${muted}`}>Enter an amount above to see the full fee breakdown and exact PHP your recipient will receive.</p>
      </div>
    );
  }

  const rows = [
    {
      label: taglish ? "Halaga na ipapadala" : "Amount you send",
      value: `$${amt.toFixed(2)}`,
      sub: null,
      highlight: false,
    },
    {
      label: taglish ? "Bayad ng KinnectFi" : "KinnectFi transfer fee",
      value: `−$${KINNECT_FEE.toFixed(2)}`,
      sub: "Flat fee · no hidden charges",
      highlight: false,
      negative: true,
    },
    {
      label: taglish ? "USD na mako-convert" : "USD converted",
      value: `$${calc.netUSD.toFixed(2)}`,
      sub: null,
      highlight: false,
    },
    {
      label: taglish ? "Live na palitan" : "Live exchange rate",
      value: `×  ₱${rate.toFixed(2)}`,
      sub: "Mid-market rate · zero markup",
      highlight: false,
    },
    {
      label: taglish ? "FX Markup" : "FX markup / spread",
      value: "₱0.00",
      sub: "Zero spread guarantee",
      highlight: false,
      good: true,
    },
  ];

  return (
    <div className={`rounded-xl overflow-hidden border ${darkMode ? "border-white/5" : "border-black/10"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {taglish ? "Transfer Estimator" : "Transfer Estimator"}
          </span>
        </div>
        <span className="text-primary text-[10px] font-bold flex items-center gap-1">
          🔒 {taglish ? "Insured" : "INSURED TRANSFER"}
        </span>
      </div>

      {/* Fee rows */}
      <div className={`px-4 py-3 space-y-2 ${darkMode ? "bg-[#0d1526]" : "bg-[#f9f5ef]"}`}>
        {rows.map((row, i) => (
          <div key={i} className={`flex items-center justify-between py-1.5 border-b ${divider} last:border-0`}>
            <div>
              <p className={`text-sm ${text}`}>{row.label}</p>
              {row.sub && <p className={`text-[10px] ${muted}`}>{row.sub}</p>}
            </div>
            <span className={`font-bold text-sm ${
              row.negative ? "text-red-400" : row.good ? "text-emerald-500" : text
            }`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Final recipient amount — highlighted */}
      <div className="px-4 py-4 bg-primary flex items-center justify-between">
        <div>
          <p className="text-secondary/70 text-[10px] uppercase tracking-widest font-bold mb-0.5">
            {taglish ? "Matatanggap ng pamilya mo" : "Recipient receives"}
          </p>
          <p className="text-secondary font-black text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            ₱{calc.phpReceived.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-secondary/60 text-[10px] mt-0.5">
            {taglish ? "Effective rate" : "Effective rate"}: ₱{calc.effectiveRate.toFixed(2)}/USD
          </p>
        </div>
        <div className="text-right">
          <Zap className="w-8 h-8 text-secondary/30 mb-1 ml-auto" />
          <p className="text-secondary/70 text-[10px] font-bold uppercase">~30s arrival</p>
        </div>
      </div>

      {/* Competitor comparison */}
      {calc.youSave > 0 && (
        <div className={`px-4 py-3 flex items-center gap-3 border-t ${divider} ${darkMode ? "bg-[#0d1526]" : "bg-[#f9f5ef]"}`}>
          <TrendingDown className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <div className="flex-1">
            <p className={`text-xs font-bold ${text}`}>
              {taglish ? "Nakatipid ka ng" : "You save"}{" "}
              <span className="text-emerald-500">
                ₱{calc.youSave.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>{" "}
              {taglish ? "kumpara sa ibang serbisyo" : "vs. typical remittance services"}
            </p>
            <p className={`text-[10px] ${muted}`}>
              Competitors avg: ₱{calc.competitorPhp > 0 ? calc.competitorPhp.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"} · 2.5% markup + $4.99 fee
            </p>
          </div>
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        </div>
      )}

      {/* Info note */}
      <div className={`px-4 py-2.5 flex items-start gap-2 border-t ${divider} ${darkMode ? "bg-[#0a0f1a]" : "bg-black/[0.02]"}`}>
        <Info className={`w-3 h-3 ${muted} flex-shrink-0 mt-0.5`} />
        <p className={`text-[10px] ${muted}`}>
          {taglish
            ? "Ang halaga ay batay sa live na palitan at maaaring magbago nang kaunti bago makumpleto ang transaksyon."
            : "Estimate based on live mid-market rate. Final amount locked at the moment you confirm the transfer."}
        </p>
      </div>
    </div>
  );
}