/**
 * useNotifications
 * Subscribes to real-time entity changes for Transfer, RateAlert, and SavingsGoal.
 * Builds a rich, persistent in-app notification feed.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "kinnectfi_notifications";
const MAX_NOTIFICATIONS = 50;

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(notifications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch {}
}

function makeTransferNotif(transfer, type) {
  const isNew = type === "create";
  const name = transfer.recipient_name || "your recipient";
  const amount = transfer.amount_usd ? `$${transfer.amount_usd}` : "";
  const phpAmount = transfer.amount_php ? ` (₱${Number(transfer.amount_php).toLocaleString("en-PH")})` : "";
  const bank = transfer.recipient_bank ? ` via ${transfer.recipient_bank}` : "";

  if (isNew) {
    return {
      id: `transfer-create-${transfer.id}-${Date.now()}`,
      type: "transfer_sent",
      icon: "💸",
      color: "emerald",
      title: `Padala Sent — ${amount}`,
      desc: `${amount}${phpAmount} sent to ${name}${bank}. Arriving in ~30 seconds.`,
      time: new Date().toISOString(),
      unread: true,
      entityId: transfer.id,
    };
  } else if (transfer.status === "completed") {
    return {
      id: `transfer-complete-${transfer.id}-${Date.now()}`,
      type: "transfer_delivered",
      icon: "✅",
      color: "emerald",
      title: `Delivered to ${name}`,
      desc: `${amount}${phpAmount} was successfully delivered to ${name}${bank}.`,
      time: new Date().toISOString(),
      unread: true,
      entityId: transfer.id,
    };
  } else if (transfer.status === "failed") {
    return {
      id: `transfer-failed-${transfer.id}-${Date.now()}`,
      type: "transfer_failed",
      icon: "❌",
      color: "red",
      title: "Transfer Failed",
      desc: `Your transfer of ${amount} to ${name} could not be completed. Please try again.`,
      time: new Date().toISOString(),
      unread: true,
      entityId: transfer.id,
    };
  }
  return null;
}

function makeRateAlertNotif(alert) {
  const dir = alert.direction === "above" ? "above ↑" : "below ↓";
  return {
    id: `rate-alert-${alert.id}-${Date.now()}`,
    type: "rate_alert",
    icon: "🔔",
    color: "amber",
    title: `Rate Alert Triggered!`,
    desc: `USD/PHP hit ₱${alert.target_rate} — ${dir} your target. Best time to send padala now!`,
    time: new Date().toISOString(),
    unread: true,
    entityId: alert.id,
  };
}

function makeSavingsNotif(goal) {
  const pct = goal.target_amount > 0
    ? Math.round((goal.current_amount / goal.target_amount) * 100)
    : 0;

  // Milestone thresholds
  const milestones = [25, 50, 75, 100];
  const hit = milestones.find(m => pct >= m);
  if (!hit) return null;

  const isComplete = pct >= 100;
  return {
    id: `goal-${goal.id}-${hit}-${Date.now()}`,
    type: "savings_milestone",
    icon: isComplete ? "🏆" : goal.emoji || "🎯",
    color: isComplete ? "yellow" : "primary",
    title: isComplete ? `Goal Reached: ${goal.label}!` : `${hit}% of "${goal.label}" reached`,
    desc: isComplete
      ? `Congrats! You've fully funded your "${goal.label}" goal. 🎉`
      : `You're ${hit}% of the way to your ₱${goal.target_amount?.toLocaleString()} "${goal.label}" goal. Keep it up!`,
    time: new Date().toISOString(),
    unread: true,
    entityId: goal.id,
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState(loadStored);
  const [toast, setToast] = useState(null); // latest "push" toast
  const toastTimer = useRef(null);
  const seenTransfers = useRef(new Set());
  const seenAlerts = useRef(new Set());
  const seenGoalMilestones = useRef(new Set());

  // Seed seen sets from stored notifications so we don't re-fire on mount
  useEffect(() => {
    const stored = loadStored();
    stored.forEach(n => {
      if (n.entityId) {
        if (n.type?.startsWith("transfer")) seenTransfers.current.add(n.entityId);
        if (n.type === "rate_alert") seenAlerts.current.add(n.entityId);
        if (n.type === "savings_milestone") seenGoalMilestones.current.add(n.entityId + "-" + (n.desc?.match(/(\d+)%/)?.[1] || ""));
      }
    });
  }, []);

  const pushNotif = useCallback((notif) => {
    if (!notif) return;
    setNotifications(prev => {
      const next = [notif, ...prev].slice(0, MAX_NOTIFICATIONS);
      persist(next);
      return next;
    });
    // Show toast banner
    setToast(notif);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, unread: false }));
      persist(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    persist([]);
  }, []);

  const dismissToast = useCallback(() => {
    clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const unsubTransfer = base44.entities.Transfer.subscribe((event) => {
      const t = event.data;
      if (!t) return;

      if (event.type === "create" && !seenTransfers.current.has(`create-${t.id}`)) {
        seenTransfers.current.add(`create-${t.id}`);
        pushNotif(makeTransferNotif(t, "create"));
      } else if (event.type === "update") {
        const key = `update-${t.id}-${t.status}`;
        if (!seenTransfers.current.has(key)) {
          seenTransfers.current.add(key);
          const notif = makeTransferNotif(t, "update");
          if (notif) pushNotif(notif);
        }
      }
    });

    const unsubAlert = base44.entities.RateAlert.subscribe((event) => {
      const a = event.data;
      if (!a || !a.triggered) return;
      const key = `triggered-${a.id}`;
      if (!seenAlerts.current.has(key)) {
        seenAlerts.current.add(key);
        pushNotif(makeRateAlertNotif(a));
      }
    });

    const unsubGoal = base44.entities.SavingsGoal.subscribe((event) => {
      const g = event.data;
      if (!g || event.type === "delete") return;
      const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
      const milestones = [25, 50, 75, 100];
      milestones.forEach(m => {
        if (pct >= m) {
          const key = `${g.id}-${m}`;
          if (!seenGoalMilestones.current.has(key)) {
            seenGoalMilestones.current.add(key);
            pushNotif(makeSavingsNotif(g));
          }
        }
      });
    });

    return () => {
      unsubTransfer();
      unsubAlert();
      unsubGoal();
    };
  }, [pushNotif]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return { notifications, toast, unreadCount, dismiss, markAllRead, clearAll, dismissToast };
}