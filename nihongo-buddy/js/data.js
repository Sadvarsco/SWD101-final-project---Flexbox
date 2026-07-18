/* Nihongo Buddy — lesson data.
   Each lesson is a list of items shown as "watch" slides and reused for
   pass-checks, study sets and quizzes. Keep jp strings unique per lesson
   so quiz distractors never collide with the right answer. */

const LESSONS = [
  {
    id: "greetings",
    emoji: "👋",
    title: "Greetings",
    level: "N5",
    blurb: "The hellos, goodbyes and thank-yous you'll use every single day.",
    items: [
      { jp: "こんにちは", romaji: "konnichiwa", en: "hello / good afternoon" },
      { jp: "おはよう", romaji: "ohayou", en: "good morning" },
      { jp: "こんばんは", romaji: "konbanwa", en: "good evening" },
      { jp: "さようなら", romaji: "sayounara", en: "goodbye" },
      { jp: "ありがとう", romaji: "arigatou", en: "thank you" },
      { jp: "すみません", romaji: "sumimasen", en: "excuse me / sorry" },
      { jp: "はじめまして", romaji: "hajimemashite", en: "nice to meet you" },
      { jp: "おやすみなさい", romaji: "oyasuminasai", en: "good night" }
    ]
  },
  {
    id: "numbers",
    emoji: "🔢",
    title: "Numbers 1–10",
    level: "N5",
    blurb: "Count to ten — the base for prices, time and everything else.",
    items: [
      { jp: "一 (いち)", romaji: "ichi", en: "one" },
      { jp: "二 (に)", romaji: "ni", en: "two" },
      { jp: "三 (さん)", romaji: "san", en: "three" },
      { jp: "四 (よん)", romaji: "yon", en: "four" },
      { jp: "五 (ご)", romaji: "go", en: "five" },
      { jp: "六 (ろく)", romaji: "roku", en: "six" },
      { jp: "七 (なな)", romaji: "nana", en: "seven" },
      { jp: "八 (はち)", romaji: "hachi", en: "eight" },
      { jp: "九 (きゅう)", romaji: "kyuu", en: "nine" },
      { jp: "十 (じゅう)", romaji: "juu", en: "ten" }
    ]
  },
  {
    id: "food",
    emoji: "🍣",
    title: "Food & Drink",
    level: "N5",
    blurb: "Order like a local — core food words and the phrases around them.",
    items: [
      { jp: "水 (みず)", romaji: "mizu", en: "water" },
      { jp: "お茶 (おちゃ)", romaji: "ocha", en: "tea" },
      { jp: "ご飯 (ごはん)", romaji: "gohan", en: "rice / a meal" },
      { jp: "魚 (さかな)", romaji: "sakana", en: "fish" },
      { jp: "肉 (にく)", romaji: "niku", en: "meat" },
      { jp: "おいしい", romaji: "oishii", en: "delicious" },
      { jp: "いただきます", romaji: "itadakimasu", en: "said before eating" },
      { jp: "ごちそうさま", romaji: "gochisousama", en: "said after eating" }
    ]
  },
  {
    id: "time",
    emoji: "⏰",
    title: "Time & Days",
    level: "N5",
    blurb: "Today, tomorrow and the days of the week.",
    items: [
      { jp: "今日 (きょう)", romaji: "kyou", en: "today" },
      { jp: "明日 (あした)", romaji: "ashita", en: "tomorrow" },
      { jp: "昨日 (きのう)", romaji: "kinou", en: "yesterday" },
      { jp: "今 (いま)", romaji: "ima", en: "now" },
      { jp: "月曜日 (げつようび)", romaji: "getsuyoubi", en: "Monday" },
      { jp: "土曜日 (どようび)", romaji: "doyoubi", en: "Saturday" },
      { jp: "日曜日 (にちようび)", romaji: "nichiyoubi", en: "Sunday" },
      { jp: "毎日 (まいにち)", romaji: "mainichi", en: "every day" }
    ]
  },
  {
    id: "phrases",
    emoji: "💬",
    title: "Everyday Phrases",
    level: "N5",
    blurb: "Small sentences that carry whole conversations.",
    items: [
      { jp: "わかりました", romaji: "wakarimashita", en: "understood / got it" },
      { jp: "わかりません", romaji: "wakarimasen", en: "I don't understand" },
      { jp: "もう一度 (もういちど)", romaji: "mou ichido", en: "one more time" },
      { jp: "お願いします (おねがいします)", romaji: "onegaishimasu", en: "please" },
      { jp: "大丈夫 (だいじょうぶ)", romaji: "daijoubu", en: "it's okay / I'm fine" },
      { jp: "頑張って (がんばって)", romaji: "ganbatte", en: "good luck / do your best" },
      { jp: "ちょっと待って (ちょっとまって)", romaji: "chotto matte", en: "wait a moment" },
      { jp: "本当 (ほんとう)", romaji: "hontou", en: "really / truly" }
    ]
  }
];
