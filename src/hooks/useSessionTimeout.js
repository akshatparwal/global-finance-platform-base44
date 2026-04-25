/**
 * useSessionTimeout — warns the user 2 min before auto-logout due to inactivity.
 * Resets on any mouse/keyboard/touch activity.
 * TIMEOUT_MS: total inactivity time before logout (default 15 min)
 * WARN_BEFORE_MS: how early to show the warning (default 2 min)
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const TIMEOUT_MS = 15 * 60 * 1000;   // 15 minutes
const WARN_BEFORE_MS = 2 * 60 * 1000; // warn 2 min before

export function useSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const logoutTimer = useRef(null);
  const warnTimer = useRef(null);
  const countdownTimer = useRef(null);

  const clearAll = () => {
    clearTimeout(logoutTimer.current);
    clearTimeout(warnTimer.current);
    clearInterval(countdownTimer.current);
  };

  const doLogout = useCallback(() => {
    clearAll();
    base44.auth.logout("/");
  }, []);

  const resetTimers = useCallback(() => {
    clearAll();
    setShowWarning(false);
    setSecondsLeft(120);

    warnTimer.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(120);
      countdownTimer.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) { doLogout(); return 0; }
          return s - 1;
        });
      }, 1000);
    }, TIMEOUT_MS - WARN_BEFORE_MS);

    logoutTimer.current = setTimeout(doLogout, TIMEOUT_MS);
  }, [doLogout]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "touchstart", "click", "scroll"];
    const handler = () => resetTimers();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetTimers();
    return () => {
      clearAll();
      events.forEach(e => window.removeEventListener(e, handler));
    };
  }, [resetTimers]);

  const extendSession = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  return { showWarning, secondsLeft, extendSession, doLogout };
}