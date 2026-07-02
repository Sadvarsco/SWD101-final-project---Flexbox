/*
 * SRS — a tiny Anki-style "how well do you know this word" tracker.
 *
 * Each kanji carries a score (0..MAX). Getting a set right on the first try
 * bumps it up; a wrong pick bumps it down. The score feeds weighted sampling
 * so weak words show up more often and strong ones show up rarely — but every
 * word keeps a small weight, so nothing ever disappears entirely.
 *
 * Scores persist per-browser in localStorage.
 */
const SRS = (function () {
  const KEY = "kc.srs.v1";
  const MAX = 5;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(scores) {
    try { localStorage.setItem(KEY, JSON.stringify(scores)); } catch (e) {}
  }

  const scores = load();

  function clamp(n) { return Math.max(0, Math.min(MAX, n)); }

  return {
    MAX,
    get(kanji) { return scores[kanji] || 0; },
    bump(kanji, delta) {
      scores[kanji] = clamp((scores[kanji] || 0) + delta);
      save(scores);
    },
    reset() {
      Object.keys(scores).forEach((k) => delete scores[k]);
      save(scores);
    },
    // Higher score -> lower weight, but always >= 1 so it can still appear.
    weight(kanji) { return (MAX - this.get(kanji)) + 1; },

    // Weighted sample of `n` distinct entries (by entry.kanji) without replacement.
    sample(entries, n) {
      const pool = entries.slice();
      const chosen = [];
      n = Math.min(n, pool.length);
      for (let i = 0; i < n; i++) {
        const weights = pool.map((e) => this.weight(e.kanji));
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        let idx = 0;
        for (; idx < pool.length; idx++) {
          r -= weights[idx];
          if (r <= 0) break;
        }
        idx = Math.min(idx, pool.length - 1);
        chosen.push(pool[idx]);
        pool.splice(idx, 1);
      }
      return chosen;
    }
  };
})();
