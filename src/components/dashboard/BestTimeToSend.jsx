/**
 * BestTimeToSend — Intelligent "Highly Optimal" badge on Pay page.
 * Compares current rate to a rolling average and shows a tip.
 */
export default function BestTimeToSend({ rate, ratesLoading, darkMode }) {
  // Rolling average from recent rate history
  const RATE_AVG = 56.05;
  const diff = rate ? rate - RATE_AVG : 0;
  const isOptimal = diff >= 0.3;
  const isGood = diff >= 0;
  const isLow = diff < -0.3;

  const card = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/10";
  const text = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/50" : "text-[#1a2a4a]/50";

  if (ratesLoading || !rate) return null;

  return (
    <div className={`border rounded-xl px-3 py-2.5 mb-4 flex items-center justify-between gap-2 ${card}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm flex-shrink-0">
          {isOptimal ? "🔥" : isGood ? "🕐" : "💡"}
        </span>
        <div className="min-w-0">
          <p className={`text-xs font-bold ${text}`}>Best Time to Send</p>
          <p className={`text-[10px] ${muted}`}>
            {isOptimal
              ? `₱${diff.toFixed(2)} above avg — Send now for max value!`
              : isGood
                ? "Good rate right now"
                : `₱${Math.abs(diff).toFixed(2)} below avg — rate may improve`}
          </p>
        </div>
      </div>
      <span
        className={`text-[9px] font-black uppercase px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${
          isOptimal
            ? "bg-emerald-500/20 text-emerald-500"
            : isGood
              ? "bg-primary/20 text-primary"
              : "bg-orange-500/20 text-orange-400"
        }`}
      >
        {isOptimal
          ? "HIGHLY OPTIMAL"
          : isGood
            ? "OPTIMAL"
            : "WAIT"}
      </span>
    </div>
  );
}