# Nihongo Buddy 🦊

A tiny lesson-and-practice app for beginner Japanese. Runs entirely in the
browser — no build step, no dependencies. Progress and study sets are saved
in `localStorage` on your device.

**Play it:** open `nihongo-buddy/index.html`, or visit the deployed page at
`/<repo>/nihongo-buddy/`.

## How it works

1. **Watch a lesson** — each lesson plays as word slides (Japanese → romaji →
   English) with a progress bar.
2. **Take the pass check** — a short multiple-choice quiz at the end of each
   watch. Score **80%+** and the lesson is marked **✔ passed**.
3. **✨ Practice more** — every passed lesson gets a *Practice more* button
   (on the lesson card and on the pass screen). Tapping it creates a **new
   study set** from that lesson — do it as many times as you like; each set
   is numbered (`Greetings · Practice set 2`) and shuffled fresh.
4. **Study sets** — flip through flashcards (Japanese on the front, romaji +
   meaning on the back). Each set also has an **optional quiz** — take it
   only when you feel like it. The quiz result screen has a
   **🔁 More questions** button that deals another shuffled round, and the set
   remembers your best score.

## Files

- `index.html` — app shell (top bar, footer, script tags)
- `css/style.css` — kawaii pastel styling
- `js/data.js` — the lessons (edit to add your own — see below)
- `js/app.js` — hash router, watch player, study sets, quiz runner

## Adding a lesson

Append to `LESSONS` in `js/data.js`:

```js
{
  id: "colors",             // unique, used in URLs and saved progress
  emoji: "🎨",
  title: "Colors",
  level: "N5",
  blurb: "One-line description shown on the card.",
  items: [
    { jp: "赤 (あか)", romaji: "aka", en: "red" },
    // 8+ items recommended so quiz choices stay interesting
  ]
}
```

Keep `jp` and `en` strings unique within a lesson — quiz distractors are drawn
from the same lesson, so duplicates would create two "correct" answers.

## Ideas for later

- Audio for each word (Web Speech API)
- Spaced repetition ordering inside study sets, like Kanji Collapse's SRS
- Typing-answer quiz mode as a harder option
