/*
 * Audio — synthesized xylophone dings + soft clicks via Web Audio.
 * No asset files; works offline. Everything is a no-op while muted or if the
 * browser blocks audio. An AudioContext is created lazily and resumed on the
 * first user gesture (a click), which browsers require.
 */
const KanjiAudio = (function () {
  let ctx = null;
  let muted = false;

  // Ascending pentatonic-ish scale (C5 D5 E5 G5 A5 C6 D6) for the lift-up.
  const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // A plucked, xylophone-like tone: two quick-decaying partials.
  function tone(freq, when, gainPeak, dur) {
    const c = ctx;
    const t = when;
    [1, 2.0].forEach((mult, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = freq * mult;
      const peak = gainPeak * (i === 0 ? 1 : 0.28);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
  }

  return {
    setMuted(m) { muted = m; },
    isMuted() { return muted; },

    // Play the i-th ascending note (clamped to the scale length).
    ding(i) {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      const f = SCALE[Math.min(i, SCALE.length - 1)];
      tone(f, c.currentTime, 0.5, 0.55);
    },

    // Soft click for a normal pick.
    click() {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      tone(880, c.currentTime, 0.18, 0.1);
    },

    // Low buzz for a wrong pick.
    wrong() {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(120, t + 0.18);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 0.22);
    },

    // Happy little run for winning.
    win() {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      SCALE.forEach((f, i) => tone(f, c.currentTime + i * 0.09, 0.45, 0.5));
    }
  };
})();
