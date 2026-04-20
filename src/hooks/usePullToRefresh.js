import { useState, useEffect, useRef, useCallback } from "react";

/**
 * usePullToRefresh — attaches touch listeners to a ref'd container.
 * Renders an indicator ABOVE the container (not inside it) to avoid
 * clipping with sticky headers. Uses a spring-decay for the visual
 * rubber-band feel and clamps pullY so the indicator never grows unbounded.
 *
 * @param {Function} onRefresh  async callback called when pull threshold is met
 * @param {number}   threshold  px of pull required (default 70)
 */
export function usePullToRefresh(onRefresh, threshold = 70) {
  const containerRef = useRef(null);
  const [pullY, setPullY] = useState(0);       // 0–threshold, spring-damped
  const [phase, setPhase] = useState("idle");  // idle | pulling | ready | refreshing
  const startY = useRef(0);
  const isTracking = useRef(false);

  const handleTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    isTracking.current = true;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isTracking.current || !startY.current) return;
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) { isTracking.current = false; return; }

    const raw = e.touches[0].clientY - startY.current;
    if (raw <= 0) return;

    // Rubber-band damping: the further you pull, the harder it gets
    const damped = threshold * (1 - Math.exp(-raw / (threshold * 1.8)));
    setPullY(damped);
    setPhase(damped >= threshold * 0.85 ? "ready" : "pulling");
    e.preventDefault();
  }, [threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isTracking.current) return;
    isTracking.current = false;
    startY.current = 0;

    if (phase === "ready") {
      setPhase("refreshing");
      setPullY(0);
      try { await onRefresh(); } finally { setPhase("idle"); }
    } else {
      setPullY(0);
      setPhase("idle");
    }
  }, [phase, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { containerRef, pullY, phase };
}