/*
 * KANJI COLLAPSE — a brick-wall matching game for learning kanji.
 *
 * How it plays:
 *   - The wall is built from bricks. Each brick shows ONE face of a kanji:
 *     the character, its on-yomi, its kun-yomi, or its English meaning.
 *   - Click a KANJI brick to make it active. Then click every brick that
 *     belongs to it (its readings + meaning). Once you've collected all of
 *     that kanji's bricks still on the wall, the group crumbles away and the
 *     bricks above collapse down to fill the gap.
 *   - A wrong click (a brick from a different kanji) gently resets your
 *     selection and costs a few points. Clear the whole wall to win.
 */

/* ------------------------------------------------------------------ *
 * Config & state
 * ------------------------------------------------------------------ */

const TYPES = {
  kanji: { label: "Kanji",    cls: "t-kanji" },
  on:    { label: "On-yomi",  cls: "t-on" },
  kun:   { label: "Kun-yomi", cls: "t-kun" },
  en:    { label: "English",  cls: "t-en" }
};

const COLS = 8;             // wall width in bricks
const WRONG_PENALTY = 15;   // points lost per wrong click
const CLEAR_POINTS = 20;    // points per brick cleared

const state = {
  tiles: [],            // { id, groupId, type, value, kanji, col, row, el, cleared }
  rows: 0,
  activeGroup: null,    // groupId of the kanji currently being hunted
  selected: new Set(),  // tile ids selected within the active group (excl. kanji)
  score: 0,
  wrong: 0,
  groupsTotal: 0,
  groupsCleared: 0,
  busy: false           // locks input during clear animations
};

let boardEl, hudEls;

/* ------------------------------------------------------------------ *
 * Utilities
 * ------------------------------------------------------------------ */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ *
 * Board construction
 * ------------------------------------------------------------------ */

function buildTiles(kanjiCount) {
  const chosen = shuffle(KANJI).slice(0, kanjiCount);
  const tiles = [];
  let id = 0;

  chosen.forEach((entry, groupId) => {
    ["kanji", "on", "kun", "en"].forEach((type) => {
      const value = type === "kanji" ? entry.kanji : entry[type];
      if (!value) return; // skip a missing reading, if any
      tiles.push({
        id: id++,
        groupId,
        type,
        value,
        kanji: entry.kanji,
        col: 0,
        row: 0,
        el: null,
        cleared: false
      });
    });
  });

  return { tiles, groupsTotal: chosen.length };
}

// Lay bricks into the grid, packed solid from the bottom-left up.
function layout(tiles) {
  const rows = Math.ceil(tiles.length / COLS);
  const shuffled = shuffle(tiles);
  shuffled.forEach((tile, i) => {
    const rowFromBottom = Math.floor(i / COLS);
    tile.col = i % COLS;
    tile.row = rows - 1 - rowFromBottom;
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
  const el = tile.el;
  el.style.left = (tile.col * 100 / COLS) + "%";
  el.style.top = (tile.row * 100 / state.rows) + "%";
  el.style.width = (100 / COLS) + "%";
  el.style.height = (100 / state.rows) + "%";
}

function render() {
  boardEl.style.setProperty("--rows", state.rows);
  boardEl.innerHTML = "";
  state.tiles.forEach((tile) => {
    boardEl.appendChild(makeTileEl(tile));
    positionTile(tile);
  });
}

/* ------------------------------------------------------------------ *
 * Selection & matching
 * ------------------------------------------------------------------ */

// Bricks (non-kanji) still on the wall belonging to a group.
function remainingMatches(groupId) {
  return state.tiles.filter(
    (t) => t.groupId === groupId && t.type !== "kanji" && !t.cleared
  );
}

function kanjiTileOf(groupId) {
  return state.tiles.find(
    (t) => t.groupId === groupId && t.type === "kanji" && !t.cleared
  );
}

function clearActive() {
  state.activeGroup = null;
  state.selected.clear();
  state.tiles.forEach((t) => {
    t.el && t.el.classList.remove("active", "picked");
  });
  updateHUD();
}

function flashWrong(tile) {
  if (!tile.el) return;
  tile.el.classList.remove("shake");
  // reflow so the animation can retrigger
  void tile.el.offsetWidth;
  tile.el.classList.add("shake");
  setTimeout(() => tile.el && tile.el.classList.remove("shake"), 400);
}

function onTileClick(tile) {
  if (state.busy || tile.cleared) return;

  // Nothing active yet: only a kanji brick starts a hunt.
  if (state.activeGroup === null) {
    if (tile.type !== "kanji") {
      flashHint("Start by clicking a " + '"Kanji"' + " brick.");
      flashWrong(tile);
      return;
    }
    startHunt(tile);
    return;
  }

  // A hunt is active.
  // Clicking the active kanji again cancels the hunt.
  if (tile.type === "kanji" && tile.groupId === state.activeGroup) {
    clearActive();
    return;
  }

  // Correct matching brick for the active kanji.
  if (tile.groupId === state.activeGroup && tile.type !== "kanji") {
    if (state.selected.has(tile.id)) return; // already picked
    state.selected.add(tile.id);
    tile.el.classList.add("picked");
    revealHunt();

    // All of this kanji's bricks collected? Crumble the group.
    if (state.selected.size >= remainingMatches(state.activeGroup).length) {
      completeGroup(state.activeGroup);
    }
    return;
  }

  // Anything else is a wrong click: gentle penalty + reset.
  state.score = Math.max(0, state.score - WRONG_PENALTY);
  state.wrong++;
  flashWrong(tile);
  clearActive();
  flashHint("Not a match — selection reset (−" + WRONG_PENALTY + ").");
}

function startHunt(kanjiTile) {
  const matches = remainingMatches(kanjiTile.groupId);

  // A lone kanji with no remaining bricks clears on its own.
  if (matches.length === 0) {
    state.activeGroup = kanjiTile.groupId;
    completeGroup(kanjiTile.groupId);
    return;
  }

  state.activeGroup = kanjiTile.groupId;
  state.selected.clear();
  state.tiles.forEach((t) => t.el && t.el.classList.remove("active", "picked"));
  kanjiTile.el.classList.add("active");
  revealHunt();
}

/* ------------------------------------------------------------------ *
 * Clearing + gravity
 * ------------------------------------------------------------------ */

function completeGroup(groupId) {
  const kanjiTile = kanjiTileOf(groupId);
  const group = [kanjiTile].concat(remainingMatches(groupId)).filter(Boolean);

  state.busy = true;
  state.score += group.length * CLEAR_POINTS;
  state.groupsCleared++;

  group.forEach((t) => {
    t.cleared = true;
    if (t.el) {
      t.el.classList.remove("active", "picked");
      t.el.classList.add("crumble");
    }
  });

  flashHint("✓ " + kanjiTile.value + " cleared!  +" + group.length * CLEAR_POINTS);
  state.activeGroup = null;
  state.selected.clear();

  setTimeout(() => {
    // Remove cleared tiles from the DOM + state.
    group.forEach((t) => t.el && t.el.remove());
    state.tiles = state.tiles.filter((t) => !t.cleared);
    applyGravity();
    state.tiles.forEach(positionTile);
    state.busy = false;
    updateHUD();
    if (state.tiles.length === 0) win();
  }, 380);
}

// Drop bricks down each column, then shift columns left over empty gaps.
function applyGravity() {
  // Vertical fall within columns.
  for (let c = 0; c < COLS; c++) {
    const colTiles = state.tiles
      .filter((t) => t.col === c)
      .sort((a, b) => a.row - b.row);
    let row = state.rows - 1;
    for (let i = colTiles.length - 1; i >= 0; i--) {
      colTiles[i].row = row--;
    }
  }

  // Horizontal collapse: pull non-empty columns leftward.
  const usedCols = [];
  for (let c = 0; c < COLS; c++) {
    if (state.tiles.some((t) => t.col === c)) usedCols.push(c);
  }
  const remap = {};
  usedCols.forEach((c, i) => (remap[c] = i));
  state.tiles.forEach((t) => (t.col = remap[t.col]));
}

/* ------------------------------------------------------------------ *
 * HUD
 * ------------------------------------------------------------------ */

function updateHUD() {
  hudEls.score.textContent = state.score;
  hudEls.wrong.textContent = state.wrong;
  hudEls.left.textContent =
    (state.groupsTotal - state.groupsCleared) + " / " + state.groupsTotal;
}

// The target panel: shows the active kanji and which faces you still need.
function revealHunt() {
  const panel = hudEls.target;
  if (state.activeGroup === null) {
    panel.innerHTML = '<span class="target-empty">Click a Kanji brick to begin.</span>';
    return;
  }
  const kanjiTile = kanjiTileOf(state.activeGroup);
  const matches = remainingMatches(state.activeGroup);
  const rows = matches
    .map((m) => {
      const got = state.selected.has(m.id);
      return (
        '<li class="' + (got ? "got" : "") + '">' +
        '<span class="dot ' + TYPES[m.type].cls + '"></span>' +
        TYPES[m.type].label +
        (got ? ": " + m.value : "") +
        "</li>"
      );
    })
    .join("");
  panel.innerHTML =
    '<div class="target-kanji">' + kanjiTile.value + "</div>" +
    '<ul class="target-list">' + rows + "</ul>";
}

let hintTimer;
function flashHint(msg) {
  hudEls.hint.textContent = msg;
  hudEls.hint.classList.add("show");
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => hudEls.hint.classList.remove("show"), 1800);
}

/* ------------------------------------------------------------------ *
 * Win + game control
 * ------------------------------------------------------------------ */

function win() {
  boardEl.innerHTML =
    '<div class="win">' +
    "<h2>Wall cleared! 🎉</h2>" +
    "<p>Score: <strong>" + state.score + "</strong></p>" +
    "<p>Wrong clicks: " + state.wrong + "</p>" +
    "</div>";
  revealHunt();
}

function newGame() {
  const count = parseInt(hudEls.level.value, 10) || 8;
  state.score = 0;
  state.wrong = 0;
  state.groupsCleared = 0;
  state.activeGroup = null;
  state.selected.clear();
  state.busy = false;

  const built = buildTiles(count);
  state.tiles = built.tiles;
  state.groupsTotal = built.groupsTotal;
  state.rows = layout(state.tiles);

  render();
  revealHunt();
  updateHUD();
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  boardEl = document.getElementById("board");
  hudEls = {
    score: document.getElementById("score"),
    wrong: document.getElementById("wrong"),
    left: document.getElementById("left"),
    target: document.getElementById("target"),
    hint: document.getElementById("hint"),
    level: document.getElementById("level"),
    newGame: document.getElementById("newGame")
  };

  hudEls.newGame.addEventListener("click", newGame);
  hudEls.level.addEventListener("change", newGame);

  newGame();
});
