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
  - *Easy (guided)* — after the kanji you find its readings **in sequence**:
    on-yomi → kun-yomi → English, one step at a time (everything else grays
    out). Wrong picks just mark that brick; after **3 wrongs or 30 seconds**
    stuck on a step, the game gives an **automatic hint** (free, but it
    forfeits the first-try star). Meaning-image behind each kanji.
  - *Normal* — a wrong pick marks that brick (no reset); once you match a
    category, the rest of that category grays out. Meaning-image behind each
    kanji. Manual hint available.
  - *Hard* — **pick tiles in any order** (no kanji-first rule), reset on wrong,
    no gray-out guidance, **no hint button**, no meaning-images, and bricks may
    show **any** of a kanji's readings/meanings (月 might appear as ガツ or
    “month”).
- **Review tray** — picked bricks gather and line up before floating away.
- **Collection** — every cleared word becomes a review card: readings, an
  example sentence for the **on-yomi** usage and one for the **kun-yomi**
  usage (kanji highlighted), expandable to show **etymology** and
  **related kanji**, with Jisho / Wiktionary links.
- **Hint button** (easy & normal) — highlights a correct brick for −5 points
  (and forfeits the first-try star for that word).
- **Sound** — synthesized xylophone dings on the lift-up, and a randomly
  composed **station-departure-style jingle** when you clear the wall
  (inspired by Japanese hassha melodies, generated fresh each win — nothing
  copyrighted). Mutable in settings.
- **Label toggles** — show/hide the type label on bricks, all at once or per type.
- **Anki-style learning (SRS)** — each kanji has a “how well you know it” score
  saved on your device. A clean first-try clear bumps it up; a wrong pick bumps
  it down. Weaker words appear more often; stronger ones appear rarely (but
  never disappear entirely). Track it in the **Progress** panel.
- **Collapsible panels** — Settings, Progress and Brick faces fold away.
- **Furigana toggle** — example sentences show small hiragana above the
  *other* kanji words (the matched word keeps its parenthesized reading);
  turn it off in Settings when you want to test yourself.
- **Win-screen shortcuts** — Play again, bump the difficulty, or add more
  kanji with one tap.
- **Tap the review tray to reset** — clicking a brick you've placed in the
  tray cancels the current word so you can start a different kanji.
- **Reading hints on hover** — hovering On-yomi / Kun-yomi in “Now matching”
  explains “the Chinese-derived reading” / “the native Japanese reading”.
- **Phonetic (romaji) readings** — collection cards show each on-yomi and
  kun-yomi with its Latin pronunciation in italics (こ *(ko)*). The
  `phonetic()` helper is language-pluggable for future non-English UIs.
- **Chord finish** — the completed word's bricks lift one at a time with an
  ascending xylophone run (ding·ding·ding·ding…), then a bright major chord
  caps it off as they vanish.
- **“Want it easier?” nudge** — after several misses on a board, a gentle
  prompt offers an easier difficulty or fewer kanji (once per board).
- **🐾 Kanji of the Day** — a kawaii, cat-themed popup with a kanji's readings
  (+romaji), meaning, stroke count / grade / JLPT level, history, example
  sentences, and a fun “did you know?” tidbit. Auto-shows once a day; the
  header button opens it anytime (with a 🎲 shuffle).

## Files

- `index.html` — page markup and layout
- `css/style.css` — kawaii styling, brick faces, animations
- `js/data.js` — the kanji dataset (readings, examples, etymology, trivia,
  stroke counts) — edit to add your own
- `js/romaji.js` — kana → phonetic (Hepburn romaji) transliteration
- `js/srs.js` — spaced-repetition scoring + weighted sampling (localStorage)
- `js/audio.js` — Web Audio xylophone / click / win sounds
- `js/game.js` — game logic: board build, matching, review tray, gravity, HUD

## Editing the kanji list

Add entries to `js/data.js`. Readings/meanings are arrays — the first item is
the primary (used in Easy/Normal); extras only appear in Hard mode:

```js
{
  kanji: "火",
  on: ["カ"], kun: ["ほのお"], en: ["fire"],
  onEx:  { jp: "火曜日に会いましょう。", word: "火曜日", read: "かようび", en: "Let's meet on Tuesday." },
  kunEx: { jp: "火がもえています。", word: "火", read: "ひ", en: "The fire is burning." },
  etym: "A pictograph of rising flames.",
  rel: ["水", "灯", "炎"]
}
```

Keep every reading/meaning string unique across the whole file so no two kanji
share an identical brick face (the test suite checks this).

## Ideas for later

- Alternative meanings / other languages on the English face
- Per-category gray-out (lock each reading type once matched)
- Real recorded audio and cuter mascot animations
