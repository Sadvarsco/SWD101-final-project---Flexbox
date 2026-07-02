# Kanji Collapse 🐱

A **kawaii kanji matching game**. Part of the SWD101 final project. Runs
entirely in the browser — no build step, no dependencies.

**Play it:** open `kanji/index.html`, or visit the deployed page at
`/<repo>/kanji/`.

## How to play

The wall is built from bricks. Each brick shows **one face** of a kanji:

| Face | Meaning |
| --- | --- |
| 🟥 Kanji | the character itself |
| 🟦 On-yomi | the Chinese-derived reading, in カタカナ |
| 🟩 Kun-yomi | the native Japanese reading, in ひらがな |
| 🟨 English | the meaning |

1. **Pick a Kanji brick first** (the others are grayed until you do).
2. **Pick its matching readings & meaning.** Each pick glides down into the
   **review tray** and lines up so you can read the whole word together.
3. When the set is complete it **lifts away one brick at a time** with an
   ascending xylophone run, and the wall **collapses** to fill the gaps.
4. **Clear the whole wall to win.**

## Features

- **Difficulty modes**
  - *Easy* — a wrong pick just marks that brick; your progress is kept.
  - *Normal* — a wrong pick resets the current selection (gentle penalty).
  - *Hard* — like normal, plus the gray-out guidance is turned off.
- **Review tray** — completed words gather and line up before floating away.
- **Sound** — synthesized xylophone dings on the lift-up (mutable in settings).
- **Label toggles** — show/hide the type label on bricks, all at once or per type.
- **Reference links** — every kanji links to **Jisho** and **Wiktionary** for
  readings, examples and history.
- **Anki-style learning (SRS)** — each kanji has a “how well you know it” score
  saved on your device. A clean first-try clear bumps it up; a wrong pick bumps
  it down. Weaker words appear more often; stronger ones appear rarely (but
  never disappear entirely). Track it in the **Progress** panel.

## Files

- `index.html` — page markup and layout
- `css/style.css` — kawaii styling, brick faces, animations
- `js/data.js` — the kanji dataset (JLPT N5 starter set) — edit to add your own
- `js/srs.js` — spaced-repetition scoring + weighted sampling (localStorage)
- `js/audio.js` — Web Audio xylophone / click / win sounds
- `js/game.js` — game logic: board build, matching, review tray, gravity, HUD

## Editing the kanji list

Add entries to `js/data.js`:

```js
{ kanji: "火", on: "カ", kun: "ひ", en: "fire" }
```

Keep reading strings unique across the set so no two different kanji share an
identical brick face. Leave a field empty (`""`) to omit that brick for a kanji.

## Ideas for later

- Alternative meanings / other languages on the English face
- Per-category gray-out (lock each reading type once matched)
- Real recorded audio and cuter mascot animations
