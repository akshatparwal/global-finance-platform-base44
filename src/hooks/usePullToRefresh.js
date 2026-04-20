import { useState, useEffect, useRef } from "react";

/**
 * usePullToRefresh — attaches touch listeners to a ref'd container.
 * @param {Function} onRefresh  async callback called when pull threshold is met
 * @param {number}   threshold  px of pull required (default 70)
 */
export function usePullToRefresh(onRefresh, threshold = 70) {
  const containerRef = useRef(null);
  const [pulling, setPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!startY.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && el.scrollTop === 0) {
        setPulling(true);
        setPullY(Math.min(dy, threshold * 1.5));
        if (dy > threshold) e.preventDefault();
      }
    };

    const onTouchEnd = async () => {
      if (pullY >= threshold && !refreshing) {
        setRefreshing(true);
        setPullY(0);
        setPulling(false);
        try { await onRefresh(); } finally { setRefreshing(false); }
      } else {
        setPulling(false);
        setPullY(0);
      }
      startY.current = 0;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, pullY, refreshing, threshold]);

  return { containerRef, pulling, pullY, refreshing };
}