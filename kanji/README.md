# Kanji Collapse

A brick-wall matching game for learning **kanji**. Part of the SWD101 final
project. Runs entirely in the browser — no build step, no dependencies.

**Play it:** open `kanji/index.html`, or visit the deployed page at
`/<repo>/kanji/` (published by the repo's GitHub Pages workflow).

## How to play

The wall is built from bricks. Each brick shows **one face** of a kanji:

| Face | Meaning |
| --- | --- |
| 🟥 Kanji | the character itself |
| 🟦 On-yomi | the Chinese-derived reading, in カタカナ |
| 🟩 Kun-yomi | the native Japanese reading, in ひらがな |
| 🟨 English | the translation |

1. **Click a Kanji brick** to make it the current target. The side panel shows
   which faces you still need to find.
2. **Click every brick that belongs to it** — its on-yomi, kun-yomi and English.
   Once you've collected all of that kanji's bricks still on the wall, the group
   crumbles and the bricks above **collapse** down to fill the gap.
3. A **wrong click** (a brick from a different kanji) gently resets your
   selection and costs a few points.
4. **Clear the whole wall to win.**

Click the active kanji again to cancel a selection. Use **New wall** and the
difficulty dropdown (6 / 8 / 12 / 16 kanji) to start over.

## Files

- `index.html` — page markup and layout
- `css/style.css` — styling, brick faces, animations
- `js/data.js` — the kanji dataset (JLPT N5 starter set) — edit to add your own
- `js/game.js` — game logic: board build, matching, gravity, scoring

## Editing the kanji list

Add entries to `js/data.js`:

```js
{ kanji: "火", on: "カ", kun: "ひ", en: "fire" }
```

Keep reading strings unique across the set so no two different kanji share an
identical brick face. Leave a field empty (`""`) to omit that brick for a kanji.
