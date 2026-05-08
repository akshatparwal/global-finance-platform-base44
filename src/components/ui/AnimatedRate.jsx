/**
 * AnimatedRate — slot-machine / ticker animation when the rate value changes.
 * Fades out the old value and slides in the new one from the top.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedRate({ value, prefix = "", suffix = "", className = "", decimals = 2 }) {
  const [display, setDisplay] = useState(value);
  const [key, setKey] = useState(0);
  const prev = useRef(value);

  useEffect(() => {
    if (value !== prev.current) {
      prev.current = value;
      setKey(k => k + 1);
      setDisplay(value);
    }
  }, [value]);

  const formatted = typeof value === "number" ? value.toFixed(decimals) : value;

  return (
    <span className={`inline-flex items-center overflow-hidden ${className}`} style={{ verticalAlign: "bottom" }}>
      {prefix}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={key}
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{ display: "inline-block" }}
        >
          {formatted}
        </motion.span>
      </AnimatePresence>
      {suffix}
    </span>
  );
}