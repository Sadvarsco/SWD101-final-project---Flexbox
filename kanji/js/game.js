/*
 * KANJI COLLAPSE — kawaii kanji matching game.
 *
 * Loop:
 *   - Pick a KANJI brick first (others are grayed until you do).
 *   - Pick its matching readings/meaning. Each pick glides down into the
 *     "review tray" and lines up so you can read the whole word together.
 *   - When the set is complete it lifts away one brick at a time with an
 *     ascending xylophone run, and the wall collapses to fill the gaps.
 *
 * Difficulty:
 *   easy   — a wrong pick just marks that brick; your progress is kept.
 *   normal — a wrong pick resets the current selection (gentle penalty).
 *   hard   — like normal, plus the gray-out guidance is turned off.
 *
 * Learning:
 *   Each kanji has an SRS score (see srs.js). First-try-clean clears bump it
 *   up; wrong picks bump it down. Weak words appear more often.
 */

/* ------------------------------------------------------------------ *
 * Config
 * ------------------------------------------------------------------ */

const TYPES = {
  kanji: { label: "Kanji",    cls: "t-kanji", order: 0 },
  on:    { label: "On-yomi",  cls: "t-on",    order: 1 },
  kun:   { label: "Kun-yomi", cls: "t-kun",   order: 2 },
  en:    { label: "English",  cls: "t-en",    order: 3 }
};

const COLS = 8;
const CLEAR_POINTS = 20;
const FIRST_TRY_BONUS = 15;
const PENALTY = { easy: 5, normal: 10, hard: 18 };
const LIFT_STAGGER = 190; // ms between bricks lifting away

const SETTINGS_KEY = "kc.settings.v1";

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

const state = {
  tiles: [],           // { id, groupId, type, value, kanji, col, row, el, tstate, wrong }
  rows: 0,
  mode: "normal",
  activeGroup: null,
  staged: [],          // tiles picked for the current set, in pick order
  hadWrong: false,     // did a wrong pick happen during the current set?
  score: 0,
  groupsTotal: 0,
  groupsCleared: 0,
  busy: false
};

const settings = {
  mode: "normal",
  size: 8,
  sound: true,
  labels: { kanji: true, on: true, kun: true, en: true }
};

let boardEl, shelfEl, els;

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function jishoURL(k) { return "https://jisho.org/search/" + encodeURIComponent(k + " #kanji"); }
function wiktURL(k) { return "https://en.wiktionary.org/wiki/" + encodeURIComponent(k) + "#Japanese"; }

function wallMatches(groupId) {
  return state.tiles.filter(
    (t) => t.groupId === groupId && t.type !== "kanji" && t.tstate === "wall"
  );
}
function allMatches(groupId) {
  return state.tiles.filter(
    (t) => t.groupId === groupId && t.type !== "kanji" && t.tstate !== "cleared"
  );
}

/* ------------------------------------------------------------------ *
 * Settings persistence
 * ------------------------------------------------------------------ */

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (s) {
      settings.mode = s.mode || settings.mode;
      settings.size = s.size || settings.size;
      settings.sound = s.sound !== undefined ? s.sound : settings.sound;
      if (s.labels) Object.assign(settings.labels, s.labels);
    }
  } catch (e) {}
}
function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
}

function applyLabelClasses() {
  ["kanji", "on", "kun", "en"].forEach((t) => {
    document.body.classList.toggle("hide-lbl-" + t, !settings.labels[t]);
  });
}

/* ------------------------------------------------------------------ *
 * Build & lay out the wall
 * ------------------------------------------------------------------ */

function buildTiles(count) {
  const chosen = SRS.sample(KANJI, count);
  const tiles = [];
  let id = 0;
  chosen.forEach((entry, groupId) => {
    ["kanji", "on", "kun", "en"].forEach((type) => {
      const value = type === "kanji" ? entry.kanji : entry[type];
      if (!value) return;
      tiles.push({
        id: id++, groupId, type, value,
        kanji: entry.kanji, col: 0, row: 0, el: null,
        tstate: "wall", wrong: false
      });
    });
  });
  return { tiles, groupsTotal: chosen.length };
}

function layout(tiles) {
  const rows = Math.ceil(tiles.length / COLS);
  shuffle(tiles).forEach((tile, i) => {
    const fromBottom = Math.floor(i / COLS);
    tile.col = i % COLS;
    tile.row = rows - 1 - fromBottom;
  });
  return rows;
}

function makeTileEl(tile) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "tile " + TYPES[tile.type].cls;
  el.setAttribute("aria-label", TYPES[tile.type].label + ": " + tile.value);

  const brick = document.createElement("span");
  brick.className = "brick";

  const face = document.createElement("span");
  face.className = "face";
  face.textContent = tile.value;

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = TYPES[tile.type].label;

  brick.appendChild(face);
  brick.appendChild(tag);
  el.appendChild(brick);
  el.addEventListener("click", () => onTileClick(tile));
  tile.el = el;
  return el;
}

function positionTile(tile) {
  if (tile.tstate !== "wall") return;
  const el = tile.el;
  el.style.transform = "";
  el.style.left = (tile.col * 100 / COLS) + "%";
  el.style.top = (tile.row * 100 / state.rows) + "%";
  el.style.width = (100 / COLS) + "%";
  el.style.height = (100 / state.rows) + "%";
}

function render() {
  boardEl.style.setProperty("--rows", state.rows);
  boardEl.innerHTML = "";
  shelfEl.innerHTML = "";
  state.tiles.forEach((tile) => {
    boardEl.appendChild(makeTileEl(tile));
    positionTile(tile);
  });
}

/* ------------------------------------------------------------------ *
 * FLIP reparenting (board <-> review tray)
 * ------------------------------------------------------------------ */

function reparentFLIP(el, newParent, mutate) {
  const first = el.getBoundingClientRect();
  mutate();
  newParent.appendChild(el);
  const last = el.getBoundingClientRect();
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const sx = last.width ? first.width / last.width : 1;
  const sy = last.height ? first.height / last.height : 1;
  el.style.transition = "none";
  el.style.transformOrigin = "top left";
  el.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")";
  void el.offsetWidth; // reflow
  el.style.transition = "transform .38s cubic-bezier(.2,.85,.3,1)";
  el.style.transform = "";
}

function stageTile(tile) {
  tile.tstate = "staged";
  state.staged.push(tile);
  reparentFLIP(tile.el, shelfEl, () => {
    tile.el.classList.add("shelved");
    tile.el.style.left = tile.el.style.top = "";
    tile.el.style.width = tile.el.style.height = "";
  });
}

function unstageAll() {
  // Return every staged tile to its (still-empty) wall cell.
  state.staged.forEach((tile) => {
    reparentFLIP(tile.el, boardEl, () => {
      tile.el.classList.remove("shelved");
      tile.tstate = "wall";
      tile.el.style.left = (tile.col * 100 / COLS) + "%";
      tile.el.style.top = (tile.row * 100 / state.rows) + "%";
      tile.el.style.width = (100 / COLS) + "%";
      tile.el.style.height = (100 / state.rows) + "%";
    });
  });
  state.staged = [];
}

/* ------------------------------------------------------------------ *
 * Click handling
 * ------------------------------------------------------------------ */

function onTileClick(tile) {
  if (state.busy || tile.tstate !== "wall" || tile.wrong) return;

  // No kanji chosen yet.
  if (state.activeGroup === null) {
    if (tile.type !== "kanji") {
      flashHint("Pick a Kanji brick first! 🐾");
      return;
    }
    beginSet(tile);
    return;
  }

  // A set is in progress.
  if (tile.type === "kanji") {
    // Choosing a different kanji mid-set counts as a wrong move.
    handleWrong(tile);
    return;
  }

  if (tile.groupId === state.activeGroup) {
    KanjiAudio.click();
    stageTile(tile);
    updateGrayout();
    updateTarget();
    if (wallMatches(state.activeGroup).length === 0) completeSet();
    return;
  }

  handleWrong(tile);
}

function beginSet(kanjiTile) {
  state.activeGroup = kanjiTile.groupId;
  state.hadWrong = false;
  state.staged = [];
  KanjiAudio.click();
  stageTile(kanjiTile);
  updateGrayout();
  updateTarget();
  // A lone kanji (all its matches already gone) clears on its own.
  if (wallMatches(state.activeGroup).length === 0) completeSet();
}

function handleWrong(tile) {
  KanjiAudio.wrong();
  if (!state.hadWrong) {
    SRS.bump(state.tiles.find((t) => t.groupId === state.activeGroup).kanji, -1);
  }
  state.hadWrong = true;

  // shake feedback
  tile.el.classList.remove("shake");
  void tile.el.offsetWidth;
  tile.el.classList.add("shake");
  setTimeout(() => tile.el && tile.el.classList.remove("shake"), 400);

  if (state.mode === "easy") {
    // Don't reset — just mark this wrong brick out for the rest of the set.
    tile.wrong = true;
    tile.el.classList.add("wrong");
    state.score = Math.max(0, state.score - PENALTY.easy);
    flashHint("Not a match — try another. 💦");
    updateHUD();
  } else {
    state.score = Math.max(0, state.score - PENALTY[state.mode]);
    flashHint("Oops! Selection reset (−" + PENALTY[state.mode] + ").");
    endSet(); // returns staged tiles, clears state
  }
}

/* ------------------------------------------------------------------ *
 * Completing / ending a set
 * ------------------------------------------------------------------ */

function completeSet() {
  state.busy = true;
  const group = state.staged.slice();
  const kanji = group[0].kanji;

  let gained = group.length * CLEAR_POINTS;
  if (!state.hadWrong) {
    gained += FIRST_TRY_BONUS;
    SRS.bump(kanji, +1); // clean first-try clear = you know it a bit better
  }
  state.score += gained;
  state.groupsCleared++;
  flashHint("✓ " + group[0].value + "  +" + gained + (state.hadWrong ? "" : "  ⭐first try!"));

  // Lift each brick away in order with an ascending ding.
  group.forEach((tile, i) => {
    setTimeout(() => {
      if (!tile.el) return;
      tile.el.style.transition = "transform .42s ease, opacity .42s ease";
      tile.el.style.transform = "translateY(-170%) scale(.55) rotate(-6deg)";
      tile.el.style.opacity = "0";
      KanjiAudio.ding(i);
    }, i * LIFT_STAGGER);
  });

  const done = group.length * LIFT_STAGGER + 460;
  setTimeout(() => {
    group.forEach((tile) => {
      tile.tstate = "cleared";
      if (tile.el) tile.el.remove();
    });
    state.tiles = state.tiles.filter((t) => t.tstate !== "cleared");
    resetSetState();
    applyGravity();
    state.tiles.forEach(positionTile);
    state.busy = false;
    updateGrayout();
    updateTarget();
    updateHUD();
    renderProgress();
    if (state.tiles.length === 0) win();
  }, done);
}

// End a set WITHOUT clearing (used on wrong-reset in normal/hard).
function endSet() {
  unstageAll();
  resetSetState();
  updateGrayout();
  updateTarget();
}

function resetSetState() {
  state.activeGroup = null;
  state.staged = [];
  state.hadWrong = false;
  // clear any easy-mode "wrong" marks so those bricks work again next set
  state.tiles.forEach((t) => {
    if (t.wrong) { t.wrong = false; t.el && t.el.classList.remove("wrong"); }
  });
}

/* ------------------------------------------------------------------ *
 * Gravity
 * ------------------------------------------------------------------ */

function applyGravity() {
  for (let c = 0; c < COLS; c++) {
    const colTiles = state.tiles.filter((t) => t.col === c).sort((a, b) => a.row - b.row);
    let row = state.rows - 1;
    for (let i = colTiles.length - 1; i >= 0; i--) colTiles[i].row = row--;
  }
  const used = [];
  for (let c = 0; c < COLS; c++) if (state.tiles.some((t) => t.col === c)) used.push(c);
  const remap = {};
  used.forEach((c, i) => (remap[c] = i));
  state.tiles.forEach((t) => (t.col = remap[t.col]));
}

/* ------------------------------------------------------------------ *
 * Gray-out guidance
 * ------------------------------------------------------------------ */

function updateGrayout() {
  const guide = state.mode !== "hard"; // hard mode = no visual guidance
  state.tiles.forEach((tile) => {
    if (tile.tstate !== "wall" || !tile.el) return;
    let disabled = false;
    if (guide) {
      if (state.activeGroup === null) disabled = tile.type !== "kanji";
      else disabled = tile.type === "kanji";
    }
    if (tile.wrong) disabled = true;
    tile.el.classList.toggle("disabled", disabled);
  });
}

/* ------------------------------------------------------------------ *
 * HUD / target / progress
 * ------------------------------------------------------------------ */

function updateHUD() {
  els.score.textContent = state.score;
  els.left.textContent = (state.groupsTotal - state.groupsCleared) + " / " + state.groupsTotal;
  els.modeLabel.textContent = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
}

function updateTarget() {
  const panel = els.target;
  if (state.activeGroup === null) {
    panel.innerHTML = '<p class="target-empty">Tap a <b>Kanji</b> brick to start a word. 🐱</p>';
    return;
  }
  const kanjiTile = state.tiles.find((t) => t.groupId === state.activeGroup && t.type === "kanji");
  const ch = kanjiTile ? kanjiTile.value : state.staged[0].value;
  const stagedIds = new Set(state.staged.map((t) => t.id));
  const rows = allMatches(state.activeGroup).map((m) => {
    const got = stagedIds.has(m.id);
    return '<li class="' + (got ? "got" : "") + '">' +
      '<span class="dot ' + TYPES[m.type].cls + '"></span>' +
      '<span class="ttype">' + TYPES[m.type].label + "</span>" +
      '<span class="tval">' + (got ? m.value : "❓") + "</span></li>";
  }).join("");
  panel.innerHTML =
    '<div class="target-kanji">' + ch + "</div>" +
    '<ul class="target-list">' + rows + "</ul>" +
    '<div class="target-links">' +
      '<a href="' + jishoURL(ch) + '" target="_blank" rel="noopener">📖 Jisho</a>' +
      '<a href="' + wiktURL(ch) + '" target="_blank" rel="noopener">📜 Wiktionary</a>' +
    "</div>";
}

function renderProgress() {
  const inPlay = new Set(state.tiles.map((t) => t.kanji));
  // Show everything you've touched, plus what's currently on the wall.
  const rows = KANJI
    .map((e) => ({ k: e.kanji, en: e.en, s: SRS.get(e.kanji), live: inPlay.has(e.kanji) }))
    .filter((r) => r.s > 0 || r.live)
    .sort((a, b) => b.s - a.s || a.k.localeCompare(b.k));

  if (rows.length === 0) {
    els.progress.innerHTML = '<p class="muted">Clear some words to build your progress. 🌱</p>';
    return;
  }
  els.progress.innerHTML = rows.map((r) => {
    let stars = "";
    for (let i = 0; i < SRS.MAX; i++) stars += i < r.s ? "★" : "☆";
    return '<div class="prow' + (r.live ? " live" : "") + '">' +
      '<span class="pk">' + r.k + "</span>" +
      '<span class="pen">' + r.en + "</span>" +
      '<span class="pstars">' + stars + "</span></div>";
  }).join("");
}

let hintTimer;
function flashHint(msg) {
  els.hint.textContent = msg;
  els.hint.classList.add("show");
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => els.hint.classList.remove("show"), 1900);
}

/* ------------------------------------------------------------------ *
 * Win + new game
 * ------------------------------------------------------------------ */

function win() {
  KanjiAudio.win();
  boardEl.innerHTML =
    '<div class="win">' +
    '<div class="win-cat">🐱</div>' +
    "<h2>Wall cleared!</h2>" +
    "<p>Score <b>" + state.score + "</b></p>" +
    "</div>";
  updateTarget();
}

function newGame() {
  state.mode = settings.mode;
  state.score = 0;
  state.groupsCleared = 0;
  state.busy = false;
  resetSetState();

  const built = buildTiles(settings.size);
  state.tiles = built.tiles;
  state.groupsTotal = built.groupsTotal;
  state.rows = layout(state.tiles);

  render();
  updateGrayout();
  updateTarget();
  updateHUD();
  renderProgress();
}

/* ------------------------------------------------------------------ *
 * Settings UI wiring
 * ------------------------------------------------------------------ */

function syncControls() {
  els.mode.value = settings.mode;
  els.size.value = String(settings.size);
  els.sound.checked = settings.sound;
  ["kanji", "on", "kun", "en"].forEach((t) => {
    els["lbl_" + t].checked = settings.labels[t];
  });
  els.lblAll.checked = Object.values(settings.labels).every(Boolean);
  KanjiAudio.setMuted(!settings.sound);
  applyLabelClasses();
}

function wireControls() {
  els.mode.addEventListener("change", () => {
    settings.mode = els.mode.value; saveSettings(); newGame();
  });
  els.size.addEventListener("change", () => {
    settings.size = parseInt(els.size.value, 10); saveSettings(); newGame();
  });
  els.sound.addEventListener("change", () => {
    settings.sound = els.sound.checked; KanjiAudio.setMuted(!settings.sound); saveSettings();
  });
  els.lblAll.addEventListener("change", () => {
    const on = els.lblAll.checked;
    ["kanji", "on", "kun", "en"].forEach((t) => { settings.labels[t] = on; });
    syncControls(); saveSettings();
  });
  ["kanji", "on", "kun", "en"].forEach((t) => {
    els["lbl_" + t].addEventListener("change", () => {
      settings.labels[t] = els["lbl_" + t].checked;
      els.lblAll.checked = Object.values(settings.labels).every(Boolean);
      applyLabelClasses(); saveSettings();
    });
  });
  els.newGame.addEventListener("click", newGame);
  els.reset.addEventListener("click", () => {
    SRS.reset(); renderProgress(); flashHint("Progress reset. 🌸");
  });
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  boardEl = document.getElementById("board");
  shelfEl = document.getElementById("shelf");
  els = {
    score: document.getElementById("score"),
    left: document.getElementById("left"),
    modeLabel: document.getElementById("modeLabel"),
    target: document.getElementById("target"),
    hint: document.getElementById("hint"),
    progress: document.getElementById("progress"),
    mode: document.getElementById("mode"),
    size: document.getElementById("size"),
    sound: document.getElementById("sound"),
    lblAll: document.getElementById("lbl-all"),
    lbl_kanji: document.getElementById("lbl-kanji"),
    lbl_on: document.getElementById("lbl-on"),
    lbl_kun: document.getElementById("lbl-kun"),
    lbl_en: document.getElementById("lbl-en"),
    newGame: document.getElementById("newGame"),
    reset: document.getElementById("reset")
  };

  loadSettings();
  syncControls();
  wireControls();
  newGame();
});
