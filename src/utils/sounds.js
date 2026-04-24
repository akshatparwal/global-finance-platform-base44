/**
 * Sound effect utility using the Web Audio API — no external files needed.
 * Generates tones procedurally to avoid any asset dependencies.
 */

let ctx = null;

function getCtx() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  }
  return ctx;
}

function playTone(frequency, duration, type = "sine", gainVal = 0.18) {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.04, c.currentTime + duration * 0.5);
    gain.gain.setValueAtTime(gainVal, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {}
}

function playChord(notes, duration, type = "sine") {
  notes.forEach(f => playTone(f, duration, type));
}

export const sfx = {
  /** Bright success chime — transfer complete, goal reached */
  success: () => {
    playTone(523, 0.12); // C5
    setTimeout(() => playTone(659, 0.12), 90); // E5
    setTimeout(() => playChord([784, 1047], 0.28), 180); // G5 + C6
  },

  /** Soft click — button press */
  click: () => playTone(880, 0.06, "triangle", 0.08),

  /** Gentle confirm — form submit, toggle on */
  confirm: () => {
    playTone(440, 0.08);
    setTimeout(() => playTone(554, 0.14), 70);
  },

  /** Warm error buzz */
  error: () => {
    playTone(220, 0.18, "sawtooth", 0.12);
    setTimeout(() => playTone(196, 0.22, "sawtooth", 0.1), 160);
  },

  /** Coin drop — points earned */
  coin: () => {
    playTone(1046, 0.06);
    setTimeout(() => playTone(880, 0.06), 60);
    setTimeout(() => playTone(1046, 0.12), 120);
  },

  /** Freeze card whoosh */
  freeze: () => playTone(300, 0.3, "triangle", 0.1),
};