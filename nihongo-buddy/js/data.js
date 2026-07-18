/* Nihongo Buddy — lesson data.
   Each lesson is a list of items shown as "watch" slides and reused for
   pass-checks, study sets and quizzes. Keep jp strings unique per lesson
   so quiz distractors never collide with the right answer.

   Lessons follow a textbook-style chapter shape (dialogue → grammar →
   vocabulary → check). Both extra sections are optional:
   - dialogue: [{ speaker, jp, romaji, en }]  — one opening scene slide
   - grammar:  [{ title, explain, examples: [{ jp, romaji, en }] }]
     — one slide per grammar point, shown before the vocabulary */

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
    id: "intro",
    emoji: "🙋",
    title: "Introduce Yourself",
    level: "N5",
    blurb: "Say who you are — the classic first chapter of any course.",
    dialogue: [
      { speaker: "メイ", jp: "はじめまして。メイです。", romaji: "hajimemashite. Mei desu.", en: "Nice to meet you. I'm Mei." },
      { speaker: "ケン", jp: "はじめまして。ケンです。学生ですか。", romaji: "hajimemashite. Ken desu. gakusei desu ka.", en: "Nice to meet you, I'm Ken. Are you a student?" },
      { speaker: "メイ", jp: "はい、学生です。よろしくおねがいします。", romaji: "hai, gakusei desu. yoroshiku onegaishimasu.", en: "Yes, I'm a student. Please treat me well." }
    ],
    grammar: [
      {
        title: "X は Y です",
        explain: "\"X wa Y desu\" means \"X is Y\". The topic particle は is written “ha” but pronounced “wa”. です makes the sentence polite.",
        examples: [
          { jp: "わたしはメイです。", romaji: "watashi wa Mei desu.", en: "I am Mei." },
          { jp: "わたしは学生です。", romaji: "watashi wa gakusei desu.", en: "I am a student." }
        ]
      },
      {
        title: "Questions with か",
        explain: "Add か to the end of a polite sentence to turn it into a question — no word-order change needed.",
        examples: [
          { jp: "学生ですか。", romaji: "gakusei desu ka.", en: "Are you a student?" },
          { jp: "はい、学生です。", romaji: "hai, gakusei desu.", en: "Yes, I'm a student." }
        ]
      }
    ],
    items: [
      { jp: "わたし", romaji: "watashi", en: "I / me" },
      { jp: "名前 (なまえ)", romaji: "namae", en: "name" },
      { jp: "学生 (がくせい)", romaji: "gakusei", en: "student" },
      { jp: "先生 (せんせい)", romaji: "sensei", en: "teacher" },
      { jp: "友だち (ともだち)", romaji: "tomodachi", en: "friend" },
      { jp: "〜さん", romaji: "-san", en: "Mr. / Ms. (polite name suffix)" },
      { jp: "はい", romaji: "hai", en: "yes" },
      { jp: "いいえ", romaji: "iie", en: "no" }
    ]
  },
  {
    id: "shopping",
    emoji: "🛍️",
    title: "Shopping",
    level: "N5",
    blurb: "Point at things, ask the price, and buy them politely.",
    dialogue: [
      { speaker: "メイ", jp: "すみません。これはいくらですか。", romaji: "sumimasen. kore wa ikura desu ka.", en: "Excuse me. How much is this?" },
      { speaker: "店の人", jp: "それは五百円です。", romaji: "sore wa gohyaku-en desu.", en: "That one is 500 yen." },
      { speaker: "メイ", jp: "じゃあ、これをください。", romaji: "jaa, kore o kudasai.", en: "Then I'll take this one, please." }
    ],
    grammar: [
      {
        title: "これ・それ・あれ",
        explain: "Three words for \"this/that\": これ = this (near me), それ = that (near you), あれ = that (far from both of us).",
        examples: [
          { jp: "これはいくらですか。", romaji: "kore wa ikura desu ka.", en: "How much is this?" },
          { jp: "あれは高いです。", romaji: "are wa takai desu.", en: "That one over there is expensive." }
        ]
      },
      {
        title: "〜をください",
        explain: "\"~ o kudasai\" politely asks for something — \"please give me ~\". を marks the thing you're asking for.",
        examples: [
          { jp: "これをください。", romaji: "kore o kudasai.", en: "This one, please." },
          { jp: "お茶をください。", romaji: "ocha o kudasai.", en: "Tea, please." }
        ]
      }
    ],
    items: [
      { jp: "これ", romaji: "kore", en: "this one (near me)" },
      { jp: "それ", romaji: "sore", en: "that one (near you)" },
      { jp: "あれ", romaji: "are", en: "that one (over there)" },
      { jp: "いくら", romaji: "ikura", en: "how much?" },
      { jp: "円 (えん)", romaji: "en", en: "yen" },
      { jp: "高い (たかい)", romaji: "takai", en: "expensive / tall" },
      { jp: "安い (やすい)", romaji: "yasui", en: "cheap" },
      { jp: "お店 (おみせ)", romaji: "omise", en: "shop / store" },
      { jp: "ください", romaji: "kudasai", en: "please give me" }
    ]
  },
  {
    id: "myday",
    emoji: "🌅",
    title: "My Day",
    level: "N5",
    blurb: "Your first verbs — eat, drink, go, sleep — in polite form.",
    dialogue: [
      { speaker: "ケン", jp: "朝ご飯を食べますか。", romaji: "asagohan o tabemasu ka.", en: "Do you eat breakfast?" },
      { speaker: "メイ", jp: "はい。パンを食べます。コーヒーを飲みます。", romaji: "hai. pan o tabemasu. koohii o nomimasu.", en: "Yes. I eat bread and drink coffee." },
      { speaker: "ケン", jp: "わたしは食べません。", romaji: "watashi wa tabemasen.", en: "I don't eat breakfast." }
    ],
    grammar: [
      {
        title: "〜ます・〜ません",
        explain: "Polite verbs end in 〜ます. Swap it for 〜ません to say \"don't / won't\". The same form covers present and future.",
        examples: [
          { jp: "毎日勉強します。", romaji: "mainichi benkyou shimasu.", en: "I study every day." },
          { jp: "テレビを見ません。", romaji: "terebi o mimasen.", en: "I don't watch TV." }
        ]
      },
      {
        title: "The を particle",
        explain: "を marks the object of a verb — the thing being eaten, drunk, watched. It's written “wo” but pronounced “o”.",
        examples: [
          { jp: "水を飲みます。", romaji: "mizu o nomimasu.", en: "I drink water." },
          { jp: "ご飯を食べます。", romaji: "gohan o tabemasu.", en: "I eat a meal." }
        ]
      }
    ],
    items: [
      { jp: "起きます (おきます)", romaji: "okimasu", en: "to wake up" },
      { jp: "食べます (たべます)", romaji: "tabemasu", en: "to eat" },
      { jp: "飲みます (のみます)", romaji: "nomimasu", en: "to drink" },
      { jp: "行きます (いきます)", romaji: "ikimasu", en: "to go" },
      { jp: "見ます (みます)", romaji: "mimasu", en: "to see / watch" },
      { jp: "寝ます (ねます)", romaji: "nemasu", en: "to sleep" },
      { jp: "勉強します (べんきょうします)", romaji: "benkyou shimasu", en: "to study" },
      { jp: "朝ご飯 (あさごはん)", romaji: "asagohan", en: "breakfast" }
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
