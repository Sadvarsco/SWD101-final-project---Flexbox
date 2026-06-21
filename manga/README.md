# PodViz · Manga Motion-Comic Layer — look prototype

A self-contained, no-build browser prototype for the **manga / motion-comic** style
that sits *on top of* PodViz: a comic panel with a character talking, and the spoken
words appearing **word-by-word in a speech bubble**, synced to the audio.

> This is the **look lab**. Nail the visual + bubble-sync here, then port the proven
> recipe into PodViz's renderer (ffmpeg + ASS) as `render_manga.py`. Nothing here
> touches the fleet engine yet.

## Run it
Open `manga/index.html` in any modern browser (no server, no build step).
Optionally pick an `episode.mp3` via the **Audio** control to drive timing from real audio;
otherwise it plays on an internal clock.

## What you can toggle (live)
- **Bubble** — `Auto (per-beat)` or force one style: vector round / cloud / shout, or **PNG burst art**.
  "Auto" uses each beat's own `bubble` field, so the look changes shot-to-shot.
- **Reveal** — `typeon` (typewriter pop-in) or `karaoke` (whole line, spoken words lit) — same
  word-timing source as PodViz's `\k` captions.
- **FX** — halftone, screentone, speed lines (per-beat opt-in via `fx`).

## Data model (identical to PodViz, so it ports cleanly)
`data/episode.json`:
```jsonc
{
  "meta":     { "title": "IMMERSIVE XP", "fps": 30, "size": [1920,1080], "audio": "data/episode.mp3" },
  "speakers": { "Taylor": { "name": "Taylor Spore", "accent": "#F5C518" } },
  "beats": [
    { "t_in": 0.0, "t_out": 2.92, "panel": "host", "speaker": "Taylor",
      "mouth": [665,505],          // bubble-tail anchor (canvas px) — points at the mouth
      "bubble": "vector-round",     // default bubble style for this shot
      "caption": "typeon",          // default reveal mode
      "motion": "pop",              // panel entry: pop | drift | shake
      "fx": ["halftone"],
      "src": "assets/panel_00.png"  // OPTIONAL real art; omit -> procedural placeholder host
    }
  ],
  "words": [ { "t": 0.0, "e": 0.42, "w": "Stepping" }, ... ]   // == out/<ep>/words.json
}
```
The seed data is the **real LARP episode intro** (`out/LARP/words.json`, rebased to 0,
with the project's `corrections.json` fixes applied: XB→XP, diverse, a).

## Placeholder vs. real art
The host is **drawn procedurally** (`drawHost()`) purely as a stand-in with an animated
mouth flap. Drop a real manga panel per beat via `beat.src` and the renderer uses it
instead — that's where your template/reference art lands.

## Port path → `render_manga.py` (the ffmpeg engine)
Each prototype piece maps to an engine seam already identified in `PodViz/src`:

| Prototype (here)                    | Engine target (PodViz)                                   |
|-------------------------------------|----------------------------------------------------------|
| `drawBubble()` word reveal          | new `caption_style:"speech_bubble"` in `build_ass()` (`\k` + `\pos`, vector `\p1` for round/cloud/shout) |
| PNG bubble + safe-area text         | transparent bubble overlay + ASS text inside (the "PNG" path) |
| `beat.mouth` anchor                 | new per-beat `bubble.mouth:[x,y]` in `storyboard.json`   |
| `beat.src` panel                    | already supported by `render_ai.py` (`"src"`)            |
| halftone / screentone / speed lines | ffmpeg overlays / Adobe `image_apply_halftone`           |
| `motion: pop/drift/shake`           | replaces `zoompan` Ken Burns for manga beats             |

## Files
```
manga/
  index.html            player shell + controls
  css/manga.css
  js/manga.js           canvas engine (clock, panel, FX, host, bubbles)
  data/episode.json     timeline (real LARP intro timings)
  assets/bubble-burst.svg   PNG-style bubble art (swap freely; keep viewBox + data-safe)
```
