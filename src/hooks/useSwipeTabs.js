/**
 * useSwipeTabs — returns touch handlers that detect left/right swipes
 * and call onSwipeLeft / onSwipeRight callbacks.
 * Dead zone: 40px vertical before cancelling. Min horizontal: 60px.
 */
import { useRef, useCallback } from "react";

export function useSwipeTabs({ onSwipeLeft, onSwipeRight, minX = 60, maxY = 50 }) {
  const startX = useRef(null);
  const startY = useRef(null);

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - startY.current);
    startX.current = null;
    startY.current = null;

    // Ignore if scroll was primarily vertical
    if (dy > maxY) return;

    if (dx < -minX) onSwipeLeft?.();
    else if (dx > minX)  onSwipeRight?.();
  }, [onSwipeLeft, onSwipeRight, minX, maxY]);

  return { onTouchStart, onTouchEnd };
}