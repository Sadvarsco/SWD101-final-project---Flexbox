/*
 * Audio — synthesized xylophone dings, soft clicks, and a little jingle
 * composer, all via Web Audio. No asset files; works offline.
 *
 * The win jingle is inspired by Japanese train-departure melodies
 * (hassha melody) but composed randomly on the spot from pentatonic
 * patterns — nothing copyrighted, and a slightly different tune each time.
 *
 * Everything is a no-op while muted or if the browser blocks audio. The
 * AudioContext is created lazily and resumed on the first user gesture.
 */
const KanjiAudio = (function () {
  let ctx = null;
  let muted = false;

  // Ascending pentatonic scale (C5 D5 E5 G5 A5 C6 D6) for the lift-up dings.
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

  // A plucked, bell-like tone: fundamental + quieter upper partial.
  function tone(freq, when, gainPeak, dur) {
    const c = ctx;
    [1, 2.0].forEach((mult, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = freq * mult;
      const peak = gainPeak * (i === 0 ? 1 : 0.28);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(peak, when + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(g).connect(c.destination);
      o.start(when);
      o.stop(when + dur + 0.02);
    });
  }

  // Bell with a soft echo — the station-speaker sound.
  function bell(freq, when, gainPeak, dur) {
    tone(freq, when, gainPeak, dur);
    tone(freq, when + 0.16, gainPeak * 0.35, dur * 0.9);
  }

  /* ---- random kawaii departure jingle ------------------------------ */

  // Pentatonic degree tables (relative to a root), in semitones.
  const PENT = [0, 2, 4, 7, 9, 12, 14, 16];
  const ROOTS = [523.25, 587.33, 659.25];        // C5, D5, E5
  // Rhythm templates: note lengths in beats (last note held).
  const RHYTHMS = [
    [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.5],
    [0.5, 0.25, 0.25, 0.5, 0.5, 0.5, 0.5, 1.5],
    [0.25, 0.25, 0.5, 0.25, 0.25, 0.5, 0.5, 1.5]
  ];

  function semis(root, n) { return root * Math.pow(2, n / 12); }

  function composeJingle() {
    const root = ROOTS[Math.floor(Math.random() * ROOTS.length)];
    const rhythm = RHYTHMS[Math.floor(Math.random() * RHYTHMS.length)];
    const beat = 0.16 + Math.random() * 0.05; // tempo wobble per jingle

    // Random walk upward through the pentatonic, resolving high on root/5th.
    const notes = [];
    let deg = Math.floor(Math.random() * 2); // start near the bottom
    for (let i = 0; i < rhythm.length - 1; i++) {
      notes.push(deg);
      const step = Math.random() < 0.72 ? 1 : (Math.random() < 0.5 ? 2 : -1);
      deg = Math.max(0, Math.min(PENT.length - 1, deg + step));
    }
    notes.push(Math.random() < 0.5 ? 5 : 3); // land on high root (12) or fifth (7)

    return { root, rhythm, notes, beat };
  }

  return {
    setMuted(m) { muted = m; },
    isMuted() { return muted; },

    // Play the i-th ascending note (clamped to the scale length).
    ding(i) {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      tone(SCALE[Math.min(i, SCALE.length - 1)], c.currentTime, 0.5, 0.55);
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

    // Tiny sparkle for using a hint.
    hint() {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      tone(1318.5, c.currentTime, 0.25, 0.3);
      tone(1760, c.currentTime + 0.08, 0.2, 0.3);
    },

    // Win: a freshly-composed departure-style jingle, then repeat it once
    // quieter — like the platform speaker echoing down the station.
    win() {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      const j = composeJingle();
      let t = c.currentTime + 0.05;
      const play = (gain) => {
        let tt = t;
        j.notes.forEach((deg, i) => {
          const dur = j.rhythm[i] * j.beat * 4;
          bell(semis(j.root, PENT[deg]), tt, gain, Math.max(0.35, dur * 1.4));
          tt += dur;
        });
        return tt;
      };
      t = play(0.42) + 0.12;
      play(0.18); // echo pass
    }
  };
})();
