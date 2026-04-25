/**
 * Monzo-style "Pulse" spending graph — smooth SVG area chart with animated
 * day markers and a gradient fill. Tapping a day shows the exact amount.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Generate 30 daily data points from real transfers
function buildDailyTotals(transfers) {
  const days = {};
  const now = new Date();

  // Seed all 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days[key] = 0;
  }

  // Accumulate transfer amounts per day
  (transfers || []).forEach(t => {
    const key = new Date(t.created_date).toISOString().slice(0, 10);
    if (key in days) days[key] += t.amount_usd || 0;
  });

  return Object.entries(days).map(([date, amount], i) => ({ date, amount, i }));
}

function smoothPoints(data) {
  // Simple 3-point moving average for a smooth curve
  return data.map((d, i) => {
    const prev = data[i - 1]?.amount ?? d.amount;
    const next = data[i + 1]?.amount ?? d.amount;
    return { ...d, smooth: (prev + d.amount + next) / 3 };
  });
}

function buildSvgPath(points, w, h, maxVal, padV = 16) {
  if (!points.length) return "";
  const x = (i) => (i / (points.length - 1)) * w;
  const y = (v) => padV + (1 - v / (maxVal || 1)) * (h - padV * 2);

  // Catmull-Rom spline via cubic bezier approximation
  let d = `M ${x(0)} ${y(points[0].smooth)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const x0 = x(i), y0 = y(points[i].smooth);
    const x1 = x(i + 1), y1 = y(points[i + 1].smooth);
    const cpx = (x0 + x1) / 2;
    d += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

export default function SpendingPulse({ transfers = [], darkMode }) {
  const [hovered, setHovered] = useState(null);
  const W = 340, H = 110;

  const daily = useMemo(() => smoothPoints(buildDailyTotals(transfers)), [transfers]);
  const maxVal = useMemo(() => Math.max(...daily.map(d => d.smooth), 1), [daily]);

  const linePath = useMemo(() => buildSvgPath(daily, W, H, maxVal), [daily, maxVal, W, H]);
  const areaPath = linePath + ` L ${W} ${H} L 0 ${H} Z`;

  const totalMonth = daily.reduce((s, d) => s + d.amount, 0);
  const today = daily[daily.length - 1];

  const textMain = darkMode ? "text-white" : "text-[#1a2a4a]";
  const muted = darkMode ? "text-white/40" : "text-[#1a2a4a]/40";
  const cardBg = darkMode ? "bg-[#1a2332] border-white/5" : "bg-white border-black/5";

  const getX = (i) => (i / (daily.length - 1)) * W;
  const getY = (v) => 16 + (1 - v / maxVal) * (H - 32);

  return (
    <div className={`border rounded-2xl p-5 ${cardBg}`} role="region" aria-label="30-day spending pulse graph">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`text-[10px] uppercase tracking-widest font-bold ${muted} mb-0.5`}>
            Spending Pulse · Last 30 Days
          </p>
          <AnimatePresence mode="wait">
            {hovered ? (
              <motion.div key="hovered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className={`text-2xl font-black ${textMain}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  ${hovered.amount.toFixed(2)}
                </p>
                <p className={`text-xs ${muted}`}>
                  {new Date(hovered.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </motion.div>
            ) : (
              <motion.div key="total" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className={`text-2xl font-black ${textMain}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  ${totalMonth.toFixed(2)}
                </p>
                <p className={`text-xs ${muted}`}>total this period</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1.5 bg-primary/10 rounded-xl px-2.5 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-primary text-[10px] font-bold">LIVE</span>
        </div>
      </div>

      {/* SVG graph */}
      <div className="relative select-none overflow-hidden" style={{ height: H }}>
        <svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          overflow="hidden"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="pulseLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill="url(#pulseGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#pulseLineGrad)"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Hover dot */}
          {hovered && (
            <g>
              <line
                x1={getX(hovered.i)}
                y1={0}
                x2={getX(hovered.i)}
                y2={H}
                stroke="hsl(var(--primary))"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />
              <circle
                cx={getX(hovered.i)}
                cy={getY(hovered.smooth)}
                r={5}
                fill="hsl(var(--primary))"
                stroke="white"
                strokeWidth={2}
              />
            </g>
          )}

          {/* Today marker */}
          {!hovered && today && (
            <g>
              <circle cx={W} cy={getY(today.smooth)} r={4} fill="hsl(var(--primary))" />
              <circle cx={W} cy={getY(today.smooth)} r={8} fill="hsl(var(--primary))" opacity={0.2}>
                <animate attributeName="r" from="4" to="12" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Invisible touch/hover targets — mobile-reliable */}
          {daily.map((d, i) => (
            <rect
              key={i}
              x={getX(i) - W / daily.length / 2}
              y={0}
              width={W / daily.length}
              height={H}
              fill="transparent"
              style={{ cursor: "crosshair", touchAction: "none" }}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={(e) => { e.preventDefault(); setHovered(d); }}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const svgEl = e.currentTarget.closest("svg");
                if (!svgEl) return;
                const rect = svgEl.getBoundingClientRect();
                const relX = ((touch.clientX - rect.left) / rect.width) * W;
                const idx = Math.min(daily.length - 1, Math.max(0, Math.round((relX / W) * (daily.length - 1))));
                setHovered(daily[idx]);
              }}
              onTouchEnd={() => setTimeout(() => setHovered(null), 1800)}
              aria-label={`${new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: $${d.amount.toFixed(2)}`}
            />
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1.5">
        {[0, 9, 19, 29].map(i => (
          <span key={i} className={`text-[9px] ${muted}`}>
            {new Date(daily[i]?.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        ))}
      </div>
    </div>
  );
}