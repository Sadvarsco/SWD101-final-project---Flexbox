# Handoff — Nihongo Buddy 🦊

Context doc for the next session continuing work on this app.
Delete this file once the work is picked up.

## Current state

- **Branch:** `claude/nihongo-buddy-practice-more-h3dyuz` (all work is here)
- **PR:** [#11](https://github.com/Sadvarsco/SWD101-final-project---Flexbox/pull/11) — draft, open, no CI on PRs in this repo (Pages deploy runs on master only)
- **App location:** `nihongo-buddy/` — vanilla HTML/CSS/JS, no build step, hash-routed SPA, state in `localStorage` (`nb.progress`, `nb.sets`)

## What's built

1. **Lessons** (`js/data.js`, 8 lessons) — watched as slides, ending in a
   5-question multiple-choice **pass check**; 80%+ marks the lesson passed.
2. **Textbook chapter shape** — lessons may have optional `dialogue`
   (one slide, Mei & Ken characters) and `grammar` (one slide per point:
   title / explanation / examples) sections that play before the vocab
   slides. Three lessons use it: `intro`, `shopping`, `myday`.
   The other five are vocab-only, which still works.
3. **✨ Practice more** — passed lessons show the button (lesson card +
   pass screen); each tap creates a numbered, shuffled **study set**.
4. **Study sets** — flashcards + *optional* quiz; quiz results have a
   **🔁 More questions** button (fresh shuffled round); best score saved;
   sets deletable.
5. **Settings** — links to sibling apps (`APPS` array in `js/app.js`:
   Kanji Collapse at `../kanji/`, projects page at `../`) + full reset.
   **Pending:** user wants a "KanjiGrove" link — no such repo/app found
   anywhere; waiting on a URL from the user before adding it.

## Next task (why this handoff exists)

The user has **Genki I (3rd ed.) as a PDF on their local machine**
(`C:\fleet\genki-textbook-1-3rd-edition-3.pdf`) and wants the app improved
using it as **inspiration**. This session couldn't access the file (remote
container; not in Drive). The user will start a fresh session and provide it.

**Copyright guardrail (important):** Genki is a commercial copyrighted
textbook. Use it only as a *structural* reference — chapter ordering, topic
progression, what grammar appears when. Do **not** copy its dialogues,
exercises, example sentences, or vocabulary lists into the app. All app
content must stay original (the current dialogues/examples are).

Ideas already floated with the user:
- Align lesson order/topics with the book's chapter progression
- A hiragana/katakana learning section (the book fronts kana before ch. 3)
- More chapters in the dialogue → grammar → vocab shape (counters, time,
  adjectives, て-form…)

## How to work on it

- Data format for lessons (incl. optional `dialogue`/`grammar`) is
  documented in `nihongo-buddy/README.md`. Keep `jp`/`en` strings unique
  *within a lesson* — quiz distractors come from the same pool.
- Gotcha: quiz views render without changing the URL hash; use the
  `goto()` helper in `app.js` for back-navigation (handles same-hash).
- Verify with headless Chromium (Playwright, executablePath
  `/opt/pw-browsers/chromium`): load
  `file://…/nihongo-buddy/index.html`, click through watch → pass check →
  Practice more → set → quiz → More questions, watch for page/console
  errors. Prior sessions kept smoke scripts in the scratchpad (ephemeral,
  not committed).
- Push to this same branch; PR #11 tracks it. Don't open a new PR unless
  #11 has been merged/closed.
