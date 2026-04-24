/**
 * Skeleton loader primitives.
 * Usage:
 *   <Skeleton className="h-4 w-32 rounded-lg" darkMode />
 *   <TransactionSkeleton darkMode count={4} />
 *   <WalletSkeleton darkMode />
 *   <GoalSkeleton darkMode count={3} />
 */
export function Skeleton({ className = "", darkMode }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${darkMode ? "bg-white/8" : "bg-black/8"} ${className}`}
    />
  );
}

export function TransactionSkeleton({ darkMode, count = 4 }) {
  const border = darkMode ? "border-white/5" : "border-black/5";
  const bg = darkMode ? "bg-[#1a2332]" : "bg-white";
  return (
    <div className={`rounded-2xl border overflow-hidden ${bg} ${border}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-4 py-3.5 border-b last:border-0 ${border}`}
        >
          <Skeleton darkMode className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton darkMode className="h-3.5 w-36 rounded" />
            <Skeleton darkMode className="h-2.5 w-20 rounded" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton darkMode className="h-3.5 w-14 rounded" />
            <Skeleton darkMode className="h-2.5 w-10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WalletSkeleton({ darkMode }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[0, 1].map(i => (
        <div
          key={i}
          className="rounded-2xl p-4 h-32 animate-pulse"
          style={{ background: "linear-gradient(135deg, #1a2a4a, #3d2e00)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-white/10" />
              <div className="w-10 h-3 rounded bg-white/10" />
            </div>
            <div className="w-8 h-4 rounded-full bg-white/10" />
          </div>
          <div className="w-12 h-2 rounded bg-white/10 mb-2" />
          <div className="w-20 h-5 rounded bg-white/20" />
        </div>
      ))}
    </div>
  );
}

export function GoalSkeleton({ darkMode, count = 3 }) {
  const border = darkMode ? "border-white/5 bg-[#1a2332]" : "border-black/5 bg-white";
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`border rounded-xl p-4 flex items-center gap-4 ${border}`}>
          <Skeleton darkMode className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton darkMode className="h-3.5 w-28 rounded" />
            <Skeleton darkMode className="h-2 w-full rounded-full" />
            <Skeleton darkMode className="h-2.5 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton({ darkMode, count = 3 }) {
  const border = darkMode ? "border-white/5 bg-[#1a2332]" : "border-black/5 bg-white";
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`border rounded-xl p-3 ${border}`}>
          <Skeleton darkMode className="h-2.5 w-14 rounded mb-2" />
          <Skeleton darkMode className="h-5 w-10 rounded" />
        </div>
      ))}
    </div>
  );
}

export function NetWorthSkeleton() {
  return (
    <div
      className="rounded-2xl p-6 animate-pulse"
      style={{ background: "linear-gradient(135deg, #1a2a4a 0%, #3d2e00 50%, #8a6a00 100%)" }}
    >
      <div className="w-24 h-2.5 rounded bg-white/10 mb-3" />
      <div className="w-48 h-9 rounded bg-white/20 mb-2" />
      <div className="w-32 h-3 rounded bg-white/10 mb-5" />
      <div className="flex justify-between pt-3 border-t border-white/10">
        <div className="w-28 h-3 rounded bg-white/10" />
        <div className="w-16 h-7 rounded-full bg-white/10" />
      </div>
    </div>
  );
}