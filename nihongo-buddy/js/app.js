/* Nihongo Buddy — hash-routed mini app.
   Views: lesson list, lesson watch (slides + pass check),
   study-set list, study set (flashcards + optional quiz). */

(function () {
  "use strict";

  var app = document.getElementById("app");

  /* ---------- persistence ---------- */

  var PROGRESS_KEY = "nb.progress"; // { [lessonId]: { watched, passed, best } }
  var SETS_KEY = "nb.sets";         // [ { id, lessonId, name, created, items, quizBest } ]

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  var progress = load(PROGRESS_KEY, {});
  var sets = load(SETS_KEY, []);

  function lessonProgress(id) {
    return progress[id] || { watched: false, passed: false, best: 0 };
  }

  /* ---------- helpers ---------- */

  function lessonById(id) {
    for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return LESSONS[i];
    return null;
  }
  function setById(id) {
    for (var i = 0; i < sets.length; i++) if (sets[i].id === id) return sets[i];
    return null;
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  /* Navigate to a hash; re-render even when the hash is unchanged
     (quizzes render in place without touching the hash). */
  function goto(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  /* Build one multiple-choice question from a pool of items. */
  function makeQuestion(item, pool) {
    var jpToEn = Math.random() < 0.5;
    var wrong = shuffle(pool.filter(function (o) { return o.jp !== item.jp; })).slice(0, 3);
    var options = shuffle(wrong.concat([item]));
    return {
      prompt: jpToEn ? item.jp : item.en,
      promptLang: jpToEn ? "jp" : "en",
      hint: jpToEn ? item.romaji : "",
      answers: options.map(function (o) { return jpToEn ? o.en : o.jp; }),
      correct: jpToEn ? item.en : item.jp
    };
  }
  function makeQuiz(pool, count) {
    return shuffle(pool).slice(0, Math.min(count, pool.length)).map(function (item) {
      return makeQuestion(item, pool);
    });
  }

  /* ---------- "Practice more" → new study set ---------- */

  function createStudySet(lesson) {
    var nth = sets.filter(function (s) { return s.lessonId === lesson.id; }).length + 1;
    var set = {
      id: lesson.id + "-" + Date.now().toString(36),
      lessonId: lesson.id,
      name: lesson.title + " · Practice set " + nth,
      created: new Date().toISOString(),
      items: shuffle(lesson.items),
      quizBest: null
    };
    sets.push(set);
    save(SETS_KEY, sets);
    return set;
  }

  /* ---------- views ---------- */

  function setNav(which) {
    var links = document.querySelectorAll("[data-nav]");
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle("active", links[i].getAttribute("data-nav") === which);
    }
  }

  function renderLessons() {
    setNav("lessons");
    var cards = LESSONS.map(function (lesson) {
      var p = lessonProgress(lesson.id);
      var badge = p.passed ? '<span class="badge passed">✔ passed</span>'
        : p.watched ? '<span class="badge watched">👀 watched</span>'
        : '<span class="badge fresh">new</span>';
      var practice = p.passed
        ? '<button class="btn practice" data-practice="' + lesson.id + '">✨ Practice more</button>'
        : "";
      return '<article class="card lesson">' +
        '<div class="emoji">' + lesson.emoji + '</div>' +
        '<div class="lesson-head"><h2>' + esc(lesson.title) + '</h2>' + badge + '</div>' +
        '<p class="blurb">' + esc(lesson.blurb) + '</p>' +
        '<p class="meta">' + lesson.items.length + " words · " + esc(lesson.level) +
        (p.best ? " · best check " + p.best + "%" : "") + '</p>' +
        '<div class="row">' +
        '<a class="btn watch" href="#/watch/' + lesson.id + '">' + (p.watched ? "▶ Watch again" : "▶ Watch lesson") + '</a>' +
        practice +
        '</div></article>';
    }).join("");

    app.innerHTML =
      '<h1>Lessons</h1>' +
      '<p class="sub">Watch a lesson, pass the quick check at the end, then hit ' +
      '<strong>✨ Practice more</strong> any time to spin it into a fresh study set.</p>' +
      '<div class="grid">' + cards + '</div>';

    var buttons = app.querySelectorAll("[data-practice]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (e) {
        var lesson = lessonById(e.currentTarget.getAttribute("data-practice"));
        var set = createStudySet(lesson);
        location.hash = "#/set/" + set.id;
      });
    }
  }

  function renderWatch(lessonId) {
    setNav("lessons");
    var lesson = lessonById(lessonId);
    if (!lesson) { location.hash = "#/"; return; }

    /* Chapter shape borrowed from classic textbooks:
       opening dialogue → grammar points → vocabulary → pass check. */
    var slides = [];
    if (lesson.dialogue) slides.push({ type: "dialogue" });
    (lesson.grammar || []).forEach(function (g) { slides.push({ type: "grammar", g: g }); });
    lesson.items.forEach(function (it) { slides.push({ type: "vocab", item: it }); });

    var index = 0;

    function exampleHTML(ex) {
      return '<div class="example">' +
        '<span class="ex-jp">' + esc(ex.jp) + '</span>' +
        '<span class="ex-romaji">' + esc(ex.romaji) + '</span>' +
        '<span class="ex-en">' + esc(ex.en) + '</span></div>';
    }

    function slideHTML(slide) {
      if (slide.type === "dialogue") {
        return '<div class="slide dialogue">' +
          '<div class="slide-label">💬 Dialogue</div>' +
          lesson.dialogue.map(function (line) {
            return '<div class="line"><span class="speaker">' + esc(line.speaker) + '</span>' +
              '<div class="line-body"><div class="ex-jp">' + esc(line.jp) + '</div>' +
              '<div class="ex-romaji">' + esc(line.romaji) + '</div>' +
              '<div class="ex-en">' + esc(line.en) + '</div></div></div>';
          }).join("") + '</div>';
      }
      if (slide.type === "grammar") {
        return '<div class="slide grammar">' +
          '<div class="slide-label">✏️ Grammar</div>' +
          '<div class="grammar-title">' + esc(slide.g.title) + '</div>' +
          '<p class="grammar-explain">' + esc(slide.g.explain) + '</p>' +
          slide.g.examples.map(exampleHTML).join("") + '</div>';
      }
      return '<div class="slide">' +
        '<div class="slide-jp">' + esc(slide.item.jp) + '</div>' +
        '<div class="slide-romaji">' + esc(slide.item.romaji) + '</div>' +
        '<div class="slide-en">' + esc(slide.item.en) + '</div>' +
        '</div>';
    }

    function paint() {
      var pct = Math.round(((index + 1) / slides.length) * 100);
      app.innerHTML =
        '<a class="crumb" href="#/">← Lessons</a>' +
        '<div class="player card">' +
        '<div class="player-head">' +
        '<h1>' + lesson.emoji + " " + esc(lesson.title) + '</h1>' +
        '<span class="meta">' + (index + 1) + " / " + slides.length + '</span></div>' +
        '<div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
        slideHTML(slides[index]) +
        '<div class="row spread">' +
        '<button class="btn ghost" id="prev"' + (index === 0 ? " disabled" : "") + '>← Back</button>' +
        (index < slides.length - 1
          ? '<button class="btn" id="next">Next →</button>'
          : '<button class="btn go" id="check">Take the pass check ✔</button>') +
        '</div></div>';

      document.getElementById("prev").addEventListener("click", function () {
        if (index > 0) { index--; paint(); }
      });
      var next = document.getElementById("next");
      if (next) next.addEventListener("click", function () { index++; paint(); });
      var check = document.getElementById("check");
      if (check) check.addEventListener("click", function () {
        var p = lessonProgress(lesson.id);
        p.watched = true;
        progress[lesson.id] = p;
        save(PROGRESS_KEY, progress);
        runQuiz({
          title: "Pass check · " + lesson.title,
          questions: makeQuiz(lesson.items, 5),
          backHash: "#/watch/" + lesson.id,
          onDone: function (scorePct) {
            var pr = lessonProgress(lesson.id);
            pr.watched = true;
            pr.best = Math.max(pr.best || 0, scorePct);
            if (scorePct >= 80) pr.passed = true;
            progress[lesson.id] = pr;
            save(PROGRESS_KEY, progress);
            return passResultActions(lesson, scorePct);
          }
        });
      });
    }
    paint();
  }

  /* Buttons shown on the pass-check result screen. */
  function passResultActions(lesson, scorePct) {
    var passed = scorePct >= 80;
    var box = el('<div class="row center"></div>');
    if (passed) {
      var practice = el('<button class="btn practice">✨ Practice more</button>');
      practice.addEventListener("click", function () {
        var set = createStudySet(lesson);
        location.hash = "#/set/" + set.id;
      });
      box.appendChild(practice);
    } else {
      var again = el('<button class="btn">▶ Watch again</button>');
      again.addEventListener("click", function () { renderWatch(lesson.id); });
      box.appendChild(again);
    }
    var home = el('<a class="btn ghost" href="#/">Lessons</a>');
    box.appendChild(home);
    return {
      heading: passed ? "🎉 Passed!" : "Almost there…",
      note: passed
        ? "This lesson is yours. Spin it into a study set whenever you want extra reps."
        : "You need 80% to pass — one more watch and you'll have it.",
      actions: box
    };
  }

  function renderSets() {
    setNav("sets");
    if (!sets.length) {
      app.innerHTML =
        '<h1>Study sets</h1>' +
        '<div class="card empty"><div class="emoji">🗂️</div>' +
        '<p>No study sets yet. Pass a lesson, then hit <strong>✨ Practice more</strong> to create one.</p>' +
        '<a class="btn" href="#/">Go to lessons</a></div>';
      return;
    }
    var cards = sets.slice().reverse().map(function (set) {
      var lesson = lessonById(set.lessonId);
      return '<article class="card lesson">' +
        '<div class="emoji">' + (lesson ? lesson.emoji : "🗂️") + '</div>' +
        '<div class="lesson-head"><h2>' + esc(set.name) + '</h2>' +
        (set.quizBest !== null ? '<span class="badge watched">quiz best ' + set.quizBest + '%</span>' : "") +
        '</div>' +
        '<p class="meta">' + set.items.length + ' cards · from “' + esc(lesson ? lesson.title : set.lessonId) + '”</p>' +
        '<div class="row">' +
        '<a class="btn" href="#/set/' + set.id + '">Study →</a>' +
        '<button class="btn ghost danger" data-delete="' + set.id + '">Delete</button>' +
        '</div></article>';
    }).join("");
    app.innerHTML = '<h1>Study sets</h1>' +
      '<p class="sub">Flip through the cards, and take the optional quiz when you feel ready.</p>' +
      '<div class="grid">' + cards + '</div>';

    var dels = app.querySelectorAll("[data-delete]");
    for (var i = 0; i < dels.length; i++) {
      dels[i].addEventListener("click", function (e) {
        var id = e.currentTarget.getAttribute("data-delete");
        sets = sets.filter(function (s) { return s.id !== id; });
        save(SETS_KEY, sets);
        renderSets();
      });
    }
  }

  function renderSet(setId) {
    setNav("sets");
    var set = setById(setId);
    if (!set) { location.hash = "#/sets"; return; }

    var index = 0;
    var flipped = false;

    function paint() {
      var item = set.items[index];
      app.innerHTML =
        '<a class="crumb" href="#/sets">← Study sets</a>' +
        '<div class="player card">' +
        '<div class="player-head"><h1>🗂️ ' + esc(set.name) + '</h1>' +
        '<span class="meta">card ' + (index + 1) + " / " + set.items.length + '</span></div>' +
        '<button class="flashcard' + (flipped ? " flipped" : "") + '" id="flash" aria-label="flip card">' +
        (flipped
          ? '<div class="slide-romaji">' + esc(item.romaji) + '</div><div class="slide-en">' + esc(item.en) + '</div>'
          : '<div class="slide-jp">' + esc(item.jp) + '</div><div class="tap-hint">tap to flip</div>') +
        '</button>' +
        '<div class="row spread">' +
        '<button class="btn ghost" id="prev"' + (index === 0 ? " disabled" : "") + '>← Back</button>' +
        '<button class="btn ghost" id="next"' + (index === set.items.length - 1 ? " disabled" : "") + '>Next →</button>' +
        '</div>' +
        '<div class="quiz-offer">' +
        '<p class="meta">Feeling confident? The quiz is optional — no pressure.' +
        (set.quizBest !== null ? " Best so far: <strong>" + set.quizBest + "%</strong>." : "") + '</p>' +
        '<button class="btn go" id="quiz">📝 Quiz me</button>' +
        '</div></div>';

      document.getElementById("flash").addEventListener("click", function () {
        flipped = !flipped; paint();
      });
      document.getElementById("prev").addEventListener("click", function () {
        if (index > 0) { index--; flipped = false; paint(); }
      });
      document.getElementById("next").addEventListener("click", function () {
        if (index < set.items.length - 1) { index++; flipped = false; paint(); }
      });
      document.getElementById("quiz").addEventListener("click", function () { startSetQuiz(set); });
    }
    paint();
  }

  function startSetQuiz(set) {
    runQuiz({
      title: "Quiz · " + set.name,
      questions: makeQuiz(set.items, 6),
      backHash: "#/set/" + set.id,
      onDone: function (scorePct) {
        set.quizBest = Math.max(set.quizBest || 0, scorePct);
        save(SETS_KEY, sets);
        var box = el('<div class="row center"></div>');
        var more = el('<button class="btn go">🔁 More questions</button>');
        more.addEventListener("click", function () { startSetQuiz(set); });
        box.appendChild(more);
        var back = el('<button class="btn ghost">Back to cards</button>');
        back.addEventListener("click", function () { goto("#/set/" + set.id); });
        box.appendChild(back);
        return {
          heading: scorePct >= 80 ? "🌟 " + scorePct + "% — nice!" : scorePct + "% — keep going!",
          note: "Want another round? Every quiz shuffles fresh questions.",
          actions: box
        };
      }
    });
  }

  /* ---------- settings ---------- */

  /* Sibling Japanese apps linked from Settings. Add entries here as more
     apps get deployed (e.g. KanjiGrove once it has a home). */
  var APPS = [
    {
      emoji: "🐱",
      name: "Kanji Collapse",
      blurb: "A kawaii brick-matching game for learning JLPT N5 kanji.",
      href: "../kanji/"
    },
    {
      emoji: "🏠",
      name: "All projects",
      blurb: "The landing page with everything built in this repo.",
      href: "../"
    }
  ];

  function renderSettings() {
    setNav("settings");
    var links = APPS.map(function (a) {
      return '<a class="card lesson applink" href="' + esc(a.href) + '">' +
        '<div class="emoji">' + a.emoji + '</div>' +
        '<h2>' + esc(a.name) + '</h2>' +
        '<p class="blurb">' + esc(a.blurb) + '</p></a>';
    }).join("");

    app.innerHTML =
      '<h1>Settings</h1>' +
      '<h2 class="section">🇯🇵 More Japanese apps</h2>' +
      '<p class="sub">Other study tools that pair well with Nihongo Buddy.</p>' +
      '<div class="grid">' + links + '</div>' +
      '<h2 class="section">🧹 Reset</h2>' +
      '<p class="sub">Clears saved lesson progress and deletes every study set on this device.</p>' +
      '<button class="btn ghost danger" id="reset">Reset all progress</button>';

    document.getElementById("reset").addEventListener("click", function () {
      if (!confirm("Reset lesson progress and delete all study sets?")) return;
      progress = {};
      sets = [];
      save(PROGRESS_KEY, progress);
      save(SETS_KEY, sets);
      goto("#/");
    });
  }

  /* ---------- shared quiz runner ---------- */

  function runQuiz(opts) {
    var questions = opts.questions;
    var index = 0;
    var score = 0;

    function paintQuestion() {
      var q = questions[index];
      app.innerHTML =
        '<a class="crumb" href="' + opts.backHash + '" id="quiz-exit">← Exit quiz</a>' +
        '<div class="player card">' +
        '<div class="player-head"><h1>' + esc(opts.title) + '</h1>' +
        '<span class="meta">' + (index + 1) + " / " + questions.length + '</span></div>' +
        '<div class="bar"><div class="bar-fill" style="width:' + Math.round((index / questions.length) * 100) + '%"></div></div>' +
        '<div class="quiz-prompt ' + q.promptLang + '">' + esc(q.prompt) + '</div>' +
        '<div class="choices">' +
        q.answers.map(function (a, i) {
          return '<button class="choice" data-i="' + i + '">' + esc(a) + '</button>';
        }).join("") +
        '</div></div>';

      document.getElementById("quiz-exit").addEventListener("click", function (e) {
        e.preventDefault();
        goto(opts.backHash);
      });

      var choices = app.querySelectorAll(".choice");
      var answered = false;
      for (var i = 0; i < choices.length; i++) {
        choices[i].addEventListener("click", function (e) {
          if (answered) return;
          answered = true;
          var picked = e.currentTarget;
          var right = picked.textContent === q.correct;
          if (right) score++;
          picked.classList.add(right ? "right" : "wrong");
          for (var j = 0; j < choices.length; j++) {
            if (choices[j].textContent === q.correct) choices[j].classList.add("right");
            choices[j].disabled = true;
          }
          setTimeout(function () {
            index++;
            if (index < questions.length) paintQuestion();
            else paintResult();
          }, right ? 550 : 1100);
        });
      }
    }

    function paintResult() {
      var pct = Math.round((score / questions.length) * 100);
      var result = opts.onDone(pct);
      app.innerHTML =
        '<div class="player card result">' +
        '<h1>' + result.heading + '</h1>' +
        '<p class="score">' + score + " / " + questions.length + ' correct</p>' +
        '<p class="sub">' + result.note + '</p>' +
        '</div>';
      app.querySelector(".result").appendChild(result.actions);
    }

    paintQuestion();
  }

  /* ---------- router ---------- */

  function route() {
    var hash = location.hash || "#/";
    var parts = hash.replace(/^#\//, "").split("/");
    if (parts[0] === "watch" && parts[1]) renderWatch(parts[1]);
    else if (parts[0] === "settings") renderSettings();
    else if (parts[0] === "sets") renderSets();
    else if (parts[0] === "set" && parts[1]) renderSet(parts[1]);
    else renderLessons();
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);
  route();
})();
