/* PodViz — Manga motion-comic prototype renderer.
 *
 * Mirrors the PodViz data model so it ports to the ffmpeg/ASS engine later:
 *   words  : [{ t, e, w }]          (word start/end seconds + text)  == out/<ep>/words.json
 *   beats  : [{ t_in, t_out, ... }] (panel/shot windows)             == storyboard.json
 *
 * The bubble word-reveal is the same idea as build_ass()'s per-word \k karaoke;
 * here it's drawn on a <canvas> so we can iterate on the *look* before committing
 * to ASS vector shapes / PNG overlays in render_manga.py.
 */
(() => {
  "use strict";

  const CANVAS = document.getElementById("stage");
  const ctx = CANVAS.getContext("2d");
  const W = CANVAS.width, H = CANVAS.height;

  // ---- player state -------------------------------------------------------
  const state = {
    ep: null,
    playing: false,
    t: 0,                 // current time (s)
    dur: 0,
    clockBase: 0,         // performance.now() anchor when (re)started/seeked
    tBase: 0,             // state.t at the anchor
    audio: null,          // optional <audio> driving the clock
    bubbleOverride: "auto",
    captionOverride: "auto",
    fx: { halftone: true, screentone: false, speedlines: false },
    bubbleImg: null,
    bubbleSafe: { x: 120, y: 120, w: 360, h: 150, vbW: 600, vbH: 380 },
  };

  // ---- tiny helpers -------------------------------------------------------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const overshoot = p => { const c = 1.70158; const x = p - 1; return 1 + (c + 1) * x * x * x + c * x * x; };

  function fmt(t) { return t.toFixed(1); }

  // Group a beat's words into readable lines (same heuristic as PodViz group_lines).
  function groupLines(words, maxw = 5, gap = 0.6) {
    const lines = [];
    let cur = [];
    for (let i = 0; i < words.length; i++) {
      cur.push(words[i]);
      const nxt = words[i + 1];
      const ends = /[.?!]$/.test(words[i].w);
      const g = nxt ? nxt.t - words[i].e : 99;
      if (cur.length >= maxw || ends || g > gap) { lines.push(cur); cur = []; }
    }
    if (cur.length) lines.push(cur);
    return lines;
  }

  function activeBeat(t) {
    const b = state.ep.beats;
    for (let i = 0; i < b.length; i++) if (t >= b[i].t_in && t < b[i].t_out) return { beat: b[i], i };
    if (t >= b[b.length - 1].t_out) return { beat: b[b.length - 1], i: b.length - 1 };
    return { beat: b[0], i: 0 };
  }

  // ---- background / panel -------------------------------------------------
  function drawPaper() {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);
    const m = 26; // gutter
    const px = m, py = m, pw = W - m * 2, ph = H - m * 2;
    // paper
    const g = ctx.createLinearGradient(0, py, 0, py + ph);
    g.addColorStop(0, "#f7f2e7");
    g.addColorStop(1, "#e7ddca");
    ctx.fillStyle = g;
    ctx.fillRect(px, py, pw, ph);
    return { px, py, pw, ph };
  }

  function panelFrame(p) {
    ctx.lineJoin = "miter";
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 14;
    ctx.strokeRect(p.px + 7, p.py + 7, p.pw - 14, p.ph - 14);
  }

  // ---- comic FX -----------------------------------------------------------
  function fxHalftone(p, intensity = 1) {
    const step = 26, r0 = 7;
    const cx = p.px + p.pw * 0.30, cy = p.py + p.ph * 0.78;
    const maxd = Math.hypot(p.pw, p.ph);
    ctx.save();
    ctx.beginPath(); ctx.rect(p.px, p.py, p.pw, p.ph); ctx.clip();
    ctx.fillStyle = "rgba(10,10,10,0.16)";
    for (let y = p.py; y < p.py + p.ph; y += step) {
      for (let x = p.px; x < p.px + p.pw; x += step) {
        const d = Math.hypot(x - cx, y - cy) / maxd;     // 0..~1
        const r = clamp((d - 0.15) * r0 * intensity, 0, r0);
        if (r < 0.4) continue;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  function fxScreentone(p) {
    ctx.save();
    ctx.beginPath(); ctx.rect(p.px, p.py, p.pw, p.ph); ctx.clip();
    ctx.strokeStyle = "rgba(10,10,10,0.10)";
    ctx.lineWidth = 6;
    for (let x = p.px - p.ph; x < p.px + p.pw; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, p.py); ctx.lineTo(x + p.ph, p.py + p.ph); ctx.stroke();
    }
    ctx.restore();
  }

  function fxSpeedlines(p, focus, k = 1) {
    ctx.save();
    ctx.beginPath(); ctx.rect(p.px, p.py, p.pw, p.ph); ctx.clip();
    ctx.strokeStyle = "rgba(10,10,10,0.55)";
    const N = 90, R = Math.hypot(p.pw, p.ph);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + (i % 2 ? 0.02 : -0.02);
      const inner = 250 + (i % 3) * 30;
      ctx.lineWidth = 2 + (i % 4);
      ctx.beginPath();
      ctx.moveTo(focus.x + Math.cos(a) * inner, focus.y + Math.sin(a) * inner);
      ctx.lineTo(focus.x + Math.cos(a) * R, focus.y + Math.sin(a) * R);
      ctx.globalAlpha = 0.7 * k;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ---- procedural placeholder host (swap for beat.src art) ----------------
  // Drawn around a nominal head at (cx, cyHead); mouth opening animates 0..1.
  function drawHost(cx, mouthY, open, accent) {
    const headR = 150;
    const cyHead = mouthY - 120;
    ctx.save();
    ctx.translate(cx, 0);

    // shoulders / bust
    ctx.fillStyle = "#2b2f3a";
    ctx.strokeStyle = "#0a0a0a"; ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-330, H);
    ctx.bezierCurveTo(-330, mouthY + 150, -170, mouthY + 70, -120, mouthY + 60);
    ctx.lineTo(120, mouthY + 60);
    ctx.bezierCurveTo(170, mouthY + 70, 330, mouthY + 150, 330, H);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // collar accent
    ctx.strokeStyle = accent; ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-118, mouthY + 64); ctx.lineTo(0, mouthY + 150); ctx.lineTo(118, mouthY + 64);
    ctx.stroke();

    // neck
    ctx.fillStyle = "#e9c39a"; ctx.strokeStyle = "#0a0a0a"; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.rect(-46, cyHead + 95, 92, 90); ctx.fill(); ctx.stroke();

    // head
    ctx.fillStyle = "#f0cda3";
    ctx.beginPath(); ctx.ellipse(0, cyHead, headR * 0.82, headR, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // hair (manga spikes)
    ctx.fillStyle = "#1b1b22";
    ctx.beginPath();
    ctx.moveTo(-headR * 0.86, cyHead - 6);
    ctx.lineTo(-headR * 0.7, cyHead - headR * 1.05);
    ctx.lineTo(-headR * 0.32, cyHead - headR * 0.7);
    ctx.lineTo(-headR * 0.12, cyHead - headR * 1.18);
    ctx.lineTo(headR * 0.16, cyHead - headR * 0.72);
    ctx.lineTo(headR * 0.4, cyHead - headR * 1.12);
    ctx.lineTo(headR * 0.66, cyHead - headR * 0.6);
    ctx.lineTo(headR * 0.86, cyHead - 10);
    ctx.lineTo(headR * 0.7, cyHead - headR * 0.2);
    ctx.bezierCurveTo(headR * 0.5, cyHead - headR * 0.62, -headR * 0.5, cyHead - headR * 0.62, -headR * 0.7, cyHead - headR * 0.2);
    ctx.closePath(); ctx.fill();

    // eyes
    const ey = cyHead + 6, ex = 64;
    for (const s of [-1, 1]) {
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.ellipse(s * ex, ey, 40, 52, 0, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 7; ctx.strokeStyle = "#0a0a0a"; ctx.stroke();
      ctx.fillStyle = "#23314d";
      ctx.beginPath(); ctx.arc(s * ex + 6, ey + 8, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(s * ex + 14, ey, 7, 0, Math.PI * 2); ctx.fill();
      // brow
      ctx.strokeStyle = "#1b1b22"; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(s * ex - 38, ey - 58); ctx.lineTo(s * ex + 30, ey - 48); ctx.stroke();
    }
    // nose
    ctx.strokeStyle = "rgba(10,10,10,0.5)"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(6, ey + 36); ctx.lineTo(-12, ey + 64); ctx.lineTo(8, ey + 70); ctx.stroke();

    // mouth — opens with speech
    const mw = 58, mo = 6 + open * 60;
    ctx.fillStyle = "#7d2231"; ctx.strokeStyle = "#0a0a0a"; ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-mw, mouthY - 120 + 120); // anchor near mouthY
    ctx.quadraticCurveTo(0, mouthY - 6, mw, mouthY - 60 + 60);
    ctx.quadraticCurveTo(0, mouthY - 6 + mo, -mw, mouthY - 60 + 60);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    if (open > 0.25) { // tongue hint
      ctx.fillStyle = "#c0566a";
      ctx.beginPath(); ctx.ellipse(0, mouthY - 8 + mo * 0.4, mw * 0.5, mo * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // ---- speech bubble ------------------------------------------------------
  function roundRectPath(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function cloudPath(x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
    const bumps = 18;
    ctx.beginPath();
    for (let i = 0; i <= bumps; i++) {
      const a = (i / bumps) * Math.PI * 2;
      const wob = (i % 2 === 0) ? 1.0 : 0.86;
      const px = cx + Math.cos(a) * rx * wob;
      const py = cy + Math.sin(a) * ry * wob;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function spikyPath(x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2, rx = w / 2 + 18, ry = h / 2 + 18;
    const pts = 22;
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const out = (i % 2 === 0) ? 1.0 : 0.72;
      const px = cx + Math.cos(a) * rx * out;
      const py = cy + Math.sin(a) * ry * out;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function tail(fromX, fromY, toX, toY, style) {
    if (style === "vector-cloud") { // trailing little puffs
      const n = 3;
      for (let i = 1; i <= n; i++) {
        const p = i / (n + 1);
        const px = lerp(fromX, toX, p), py = lerp(fromY, toY, p);
        const r = lerp(20, 7, p);
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
        ctx.lineWidth = 7; ctx.strokeStyle = "#0a0a0a"; ctx.stroke();
      }
      return;
    }
    const w = style === "vector-spiky" ? 22 : 46;
    ctx.beginPath();
    ctx.moveTo(fromX - w / 2, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(fromX + w / 2, fromY);
    ctx.closePath();
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.lineWidth = 9; ctx.strokeStyle = "#0a0a0a";
    ctx.lineJoin = "round"; ctx.stroke();
  }

  // wrap reveal-words to lines that fit maxW; returns array of arrays of {word, lit, active, idx}
  function layout(tokens, font, maxW) {
    ctx.font = font;
    const space = ctx.measureText(" ").width;
    const rows = []; let row = []; let wpx = 0;
    for (const tk of tokens) {
      const wd = ctx.measureText(tk.word).width;
      if (row.length && wpx + space + wd > maxW) { rows.push(row); row = []; wpx = 0; }
      row.push({ ...tk, w: wd });
      wpx += (row.length > 1 ? space : 0) + wd;
    }
    if (row.length) rows.push(row);
    return { rows, space };
  }

  function drawBubble(beat, line, t, mouth, accent, bornAt) {
    if (!line) return;
    const style = state.bubbleOverride !== "auto" ? state.bubbleOverride : (beat.bubble || "vector-round");
    const mode = state.captionOverride !== "auto" ? state.captionOverride : (beat.caption || "typeon");

    // reveal tokens for this line
    const tokens = [];
    let anyActive = false;
    for (let i = 0; i < line.length; i++) {
      const wd = line[i];
      const spoken = t >= wd.e;
      const active = t >= wd.t && t < wd.e;
      anyActive = anyActive || active;
      const shown = mode === "karaoke" ? true : (t >= wd.t - 0.04);
      if (!shown) continue;
      tokens.push({ word: wd.w, spoken, active, idx: i });
    }
    if (!tokens.length) return anyActive;

    const fontSize = 58;
    const font = `${fontSize}px Bangers, "Comic Sans MS", "Arial Black", sans-serif`;
    const maxTextW = 560;
    const { rows } = layout(tokens, font, maxTextW);

    // bubble box sized to text
    const lineH = fontSize * 1.06;
    let textW = 0;
    ctx.font = font;
    for (const r of rows) {
      let rw = 0; for (let i = 0; i < r.length; i++) rw += (i ? ctx.measureText(" ").width : 0) + r[i].w;
      textW = Math.max(textW, rw);
    }
    const padX = 46, padY = 38;
    const bw = Math.min(maxTextW, textW) + padX * 2;
    const bh = rows.length * lineH + padY * 2;

    // place bubble up-left of mouth, tail down to mouth
    let bx = clamp(mouth[0] - bw * 0.5, 70, W - bw - 70);
    let by = clamp(mouth[1] - 320 - bh, 60, H - bh - 260);

    // born-in animation (scale + fade) over 0.32s
    const age = clamp((t - bornAt) / 0.32, 0, 1);
    const scale = lerp(0.6, 1, overshoot(age));
    const alpha = easeOut(clamp(age / 0.6, 0, 1));

    ctx.save();
    ctx.globalAlpha = alpha;
    const ccx = bx + bw / 2, ccy = by + bh / 2;
    ctx.translate(ccx, ccy); ctx.scale(scale, scale); ctx.translate(-ccx, -ccy);

    // tail first (under bubble outline)
    tail(mouth[0], by + bh - 6, mouth[0], mouth[1] - 70, style);

    // bubble body
    if (style === "png" && state.bubbleImg) {
      const s = state.bubbleSafe;
      // scale image so its safe-area maps to our text box
      const sx = bw / s.w, sy = bh / s.h;
      const iw = s.vbW * sx, ih = s.vbH * sy;
      const ix = bx - s.x * sx, iy = by - s.y * sy;
      ctx.drawImage(state.bubbleImg, ix, iy, iw, ih);
    } else {
      if (style === "vector-cloud") cloudPath(bx, by, bw, bh);
      else if (style === "vector-spiky") spikyPath(bx, by, bw, bh);
      else roundRectPath(bx, by, bw, bh, 34);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.lineWidth = style === "vector-spiky" ? 11 : 9;
      ctx.strokeStyle = "#0a0a0a"; ctx.lineJoin = "round"; ctx.stroke();
    }

    // text
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    let ty = by + padY;
    for (const r of rows) {
      let rw = 0; for (let i = 0; i < r.length; i++) rw += (i ? ctx.measureText(" ").width : 0) + r[i].w;
      let tx = bx + (bw - rw) / 2;
      for (let i = 0; i < r.length; i++) {
        const tk = r[i];
        const reveal = mode === "typeon" ? clamp((t - line[tk.idx].t + 0.04) / 0.16, 0, 1) : 1;
        const pop = tk.active ? 1.12 : (mode === "typeon" ? lerp(0.7, 1, easeOut(reveal)) : 1);
        ctx.save();
        const wx = tx + (i ? ctx.measureText(" ").width : 0);
        ctx.translate(wx + tk.w / 2, ty + fontSize * 0.5);
        ctx.scale(pop, pop);
        ctx.translate(-(wx + tk.w / 2), -(ty + fontSize * 0.5));
        // color: spoken = ink, active = accent, upcoming(karaoke) = grey
        ctx.fillStyle = tk.active ? accent : (tk.spoken ? "#0a0a0a" : (mode === "karaoke" ? "#9a9a9a" : "#0a0a0a"));
        ctx.globalAlpha = alpha * (mode === "typeon" ? reveal : 1);
        ctx.lineWidth = 6; ctx.strokeStyle = "rgba(10,10,10,0.0)";
        if (i > 0) ctx.fillText(" ", tx, ty);
        ctx.fillText(tk.word, wx, ty);
        ctx.restore();
        tx = wx + tk.w;
      }
      ty += lineH;
    }
    ctx.restore();
    return anyActive;
  }

  // ---- line selection + born tracking ------------------------------------
  let _lineKey = null, _lineBorn = 0;
  function currentLine(beat, t) {
    const bw = state.ep.words.filter(w => w.t >= beat.t_in && w.t < beat.t_out);
    const lines = groupLines(bw);
    if (!lines.length) return null;
    let chosen = lines[0];
    for (const ln of lines) {
      const s = ln[0].t, e = ln[ln.length - 1].e + 0.4;
      if (t >= s && t < e) { chosen = ln; break; }
      if (t >= s) chosen = ln; // most recent
    }
    const key = `${beat.t_in}:${chosen[0].t}`;
    if (key !== _lineKey) { _lineKey = key; _lineBorn = chosen[0].t - 0.05; }
    return chosen;
  }

  // mouth openness from word timing (flap)
  function mouthOpen(t) {
    for (const w of state.ep.words) {
      if (t >= w.t && t < w.e) {
        const p = (t - w.t) / Math.max(0.05, w.e - w.t);
        return 0.45 + 0.55 * Math.abs(Math.sin(p * Math.PI * 2.5));
      }
    }
    return 0.06; // idle
  }

  // ---- main render --------------------------------------------------------
  function render() {
    const t = state.t;
    const { beat, i } = activeBeat(t);
    const accent = (state.ep.speakers?.[beat.speaker]?.accent) || "#f5c518";

    const p = drawPaper();

    // beat-entry motion applied to the panel art
    const inP = clamp((t - beat.t_in) / 0.5, 0, 1);
    ctx.save();
    ctx.beginPath(); ctx.rect(p.px, p.py, p.pw, p.ph); ctx.clip();

    let dx = 0, dy = 0, rot = 0, sc = 1;
    const motion = beat.motion || "pop";
    if (motion === "pop") sc = lerp(0.9, 1, overshoot(inP));
    else if (motion === "drift") dx = lerp(40, 0, easeOut(inP));
    else if (motion === "shake") rot = (1 - inP) * Math.sin(t * 40) * 0.012;

    // FX under character
    if (state.fx.screentone && (beat.fx?.includes("screentone"))) fxScreentone(p);
    if (state.fx.halftone && (beat.fx?.includes("halftone"))) fxHalftone(p, 1);

    ctx.save();
    const cx0 = p.px + p.pw / 2, cy0 = p.py + p.ph / 2;
    ctx.translate(cx0, cy0); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-cx0 + dx, -cy0 + dy);

    const mouth = beat.mouth || [W * 0.5, H * 0.55];
    // beat.src support: if a real panel image is provided + loaded, draw it; else procedural host
    if (beat._img) {
      ctx.drawImage(beat._img, p.px, p.py, p.pw, p.ph);
    } else {
      const open = mouthOpen(t);
      drawHost(p.px + p.pw * 0.5, mouth[1], open, accent);
    }
    ctx.restore();

    if (state.fx.speedlines && (beat.fx?.includes("speedlines"))) {
      const k = clamp(1 - (t - beat.t_in) / 0.6, 0, 1) * 0.6 + 0.4;
      fxSpeedlines(p, { x: p.px + p.pw / 2, y: p.py + p.ph * 0.45 }, k);
    }

    ctx.restore(); // panel clip

    panelFrame(p);

    // caption / chapter chip (top-left) — uses meta like build_ass title
    ctx.font = `40px Bangers, "Arial Black", sans-serif`;
    ctx.textBaseline = "top"; ctx.textAlign = "left";
    ctx.fillStyle = accent;
    ctx.fillRect(p.px + 26, p.py + 26, ctx.measureText(state.ep.meta.title).width + 36, 56);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillText(state.ep.meta.title, p.px + 44, p.py + 32);

    // bubble
    const line = currentLine(beat, t);
    drawBubble(beat, line, t, mouth, accent, _lineBorn);

    // shot counter
    ctx.font = `28px system-ui, sans-serif`;
    ctx.textAlign = "right"; ctx.fillStyle = "rgba(10,10,10,.5)";
    ctx.fillText(`SHOT ${i + 1}/${state.ep.beats.length}`, p.px + p.pw - 30, p.py + p.ph - 44);
  }

  // ---- clock --------------------------------------------------------------
  function tick() {
    if (state.playing) {
      if (state.audio) state.t = state.audio.currentTime;
      else state.t = state.tBase + (performance.now() - state.clockBase) / 1000;
      if (state.t >= state.dur) { state.t = state.dur; pause(); }
    }
    render();
    syncUI();
    requestAnimationFrame(tick);
  }

  // ---- controls -----------------------------------------------------------
  const $ = id => document.getElementById(id);

  function play() {
    if (state.t >= state.dur) seek(0);
    state.playing = true;
    state.clockBase = performance.now();
    state.tBase = state.t;
    if (state.audio) { state.audio.currentTime = state.t; state.audio.play().catch(() => {}); }
    $("play").textContent = "❚❚ Pause";
  }
  function pause() {
    state.playing = false;
    if (state.audio) state.audio.pause();
    $("play").textContent = "▶ Play";
  }
  function seek(t) {
    state.t = clamp(t, 0, state.dur);
    state.tBase = state.t; state.clockBase = performance.now();
    if (state.audio) state.audio.currentTime = state.t;
  }
  function syncUI() {
    $("seek").value = (state.t / state.dur) * 100 || 0;
    $("time").textContent = `${fmt(state.t)} / ${fmt(state.dur)}s`;
  }

  function wire() {
    $("play").onclick = () => state.playing ? pause() : play();
    $("restart").onclick = () => { seek(0); play(); };
    $("seek").oninput = e => { const was = state.playing; pause(); seek(e.target.value / 100 * state.dur); if (was) play(); };
    $("bubbleStyle").onchange = e => state.bubbleOverride = e.target.value;
    $("caption").onchange = e => state.captionOverride = e.target.value;
    for (const id of ["fxHalftone", "fxScreentone", "fxSpeed"]) {
      $(id).onclick = e => {
        const k = e.target.dataset.fx;
        state.fx[k] = !state.fx[k];
        e.target.classList.toggle("on", state.fx[k]);
        e.target.style.background = state.fx[k] ? "var(--accent)" : "";
        e.target.style.color = state.fx[k] ? "#111" : "";
      };
    }
    // reflect initial fx button states
    $("fxHalftone").style.background = "var(--accent)"; $("fxHalftone").style.color = "#111";
    $("audioFile").onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const a = new Audio(URL.createObjectURL(f));
      a.addEventListener("loadedmetadata", () => {
        state.audio = a;
        state.dur = Math.max(state.dur, a.duration);
        seek(0);
      });
    };
  }

  // optional: preload beat.src panel art if provided in data
  function preloadPanels() {
    for (const b of state.ep.beats) {
      if (b.src) { const im = new Image(); im.onload = () => b._img = im; im.src = b.src; }
    }
  }

  // ---- boot ---------------------------------------------------------------
  async function boot() {
    const ep = await fetch("data/episode.json").then(r => r.json());
    state.ep = ep;
    state.dur = ep.words[ep.words.length - 1].e + 1.0;

    // load PNG-bubble art + its safe area
    const img = new Image();
    img.onload = () => state.bubbleImg = img;
    img.src = "assets/bubble-burst.svg";

    preloadPanels();
    wire();
    try { await document.fonts.load('58px "Bangers"'); await document.fonts.ready; } catch (e) {}
    requestAnimationFrame(tick);
  }

  boot();
})();
