/**
 * Haptic feedback utility — wraps the Web Vibration API with named patterns.
 * Falls back silently on unsupported platforms (iOS, desktop).
 */

const vibrate = (pattern) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
};

export const haptic = {
  /** Light tap — button press, toggle */
  light: () => vibrate(10),
  /** Medium — selection confirmed, card tap */
  medium: () => vibrate([12, 8, 12]),
  /** Heavy — error, freeze card */
  heavy: () => vibrate([20, 10, 20, 10, 20]),
  /** Success pattern — transfer complete, goal reached */
  success: () => vibrate([10, 50, 20, 50, 30]),
  /** Error pattern — failed transfer */
  error: () => vibrate([30, 20, 30, 20, 60]),
  /** Notification tap */
  notification: () => vibrate([15, 30, 15]),
};