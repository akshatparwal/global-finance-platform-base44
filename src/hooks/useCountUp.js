import { useEffect, useState, useRef } from "react";

/**
 * useCountUp — animates from 0 → target with easeOutCubic.
 * Uses IntersectionObserver so it only starts when the element is visible.
 * Returns { value, ref } — attach `ref` to your container element.
 */
export function useCountUp(target, duration = 1200, delay = 150) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!target || target === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start - delay;
            if (elapsed < 0) {
              requestAnimationFrame(animate);
              return;
            }
            const progress = Math.min(elapsed / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(target * eased);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, delay]);

  return { value, ref };
}