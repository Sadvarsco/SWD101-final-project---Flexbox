/*
 * KANJI DATA — JLPT N5 starter set.
 *
 * Each entry drives the game AND the collection cards:
 *   kanji : the character itself
 *   pic   : a meaning-image (emoji) shown behind the kanji in easy mode
 *   on    : On-yomi readings (Chinese-derived), katakana. [0] is primary.
 *   kun   : Kun-yomi readings (native Japanese), hiragana. [0] is primary.
 *   en    : English meanings. [0] is primary.
 *   onEx  : an example using an ON reading  { jp, word, read, en }
 *   kunEx : an example using a KUN reading  { jp, word, read, en }
 *           each example may carry ruby: { word: reading } — furigana for
 *           the OTHER kanji words in the sentence (the matched word keeps
 *           its parenthesized reading untouched)
 *   etym  : a short history / etymology blurb
 *   rel   : related kanji worth exploring next
 *   strokes/grade/jlpt : stats for the Kanji-of-the-Day popup
 *   trivia: a fun fact  |  spot: where you'll see it in the wild
 *
 * Easy/Normal boards use only the primary ([0]) reading of each list.
 * Hard boards may show ANY reading/meaning from the lists.
 *
 * IMPORTANT: keep every string in on/kun/en unique across the whole file —
 * no two kanji may share a brick face. (The test suite validates this.)
 */
const KANJI = [
  {
    kanji: "日", pic: "☀️",
    on: ["ニチ", "ジツ"], kun: ["ひ", "か"], en: ["sun", "day"],
    onEx:  { jp: "日曜日は休みです。", word: "日曜日", read: "にちようび", en: "Sunday is a day off." , ruby: { "休": "やす" } },
    kunEx: { jp: "日の出がきれいです。", word: "日の出", read: "ひので", en: "The sunrise is beautiful." },
    etym: "A pictograph of the sun — originally a circle with a dot in the center that squared off over centuries of writing.",
    rel: ["月", "本", "明"],
    strokes: 4, grade: 1, jlpt: "N5",
    trivia: "Also the ‘nichi’ in 日本 (Nihon): Japan’s own name means ‘sun-origin’ — the Land of the Rising Sun!",
    spot: "On every calendar, and the red circle on the flag 🇯🇵 is this very sun."
  },
  {
    kanji: "人", pic: "🧍",
    on: ["ジン", "ニン"], kun: ["ひと"], en: ["person"],
    onEx:  { jp: "日本人の友だちがいます。", word: "日本人", read: "にほんじん", en: "I have a Japanese friend." , ruby: { "友": "とも" } },
    kunEx: { jp: "あの人は先生です。", word: "人", read: "ひと", en: "That person is a teacher." , ruby: { "先生": "せんせい" } },
    etym: "A pictograph of a person seen from the side, mid-stride — just the legs and leaning body remain.",
    rel: ["大", "女", "男"],
    strokes: 2, grade: 1, jlpt: "N5",
    trivia: "Only two strokes! Used to count people: 一人 (one person), 二人 (two people).",
    spot: "On restroom signs and 求人 (help-wanted) ads."
  },
  {
    kanji: "大", pic: "🐘",
    on: ["ダイ", "タイ"], kun: ["おお"], en: ["big", "great"],
    onEx:  { jp: "大学で日本語を勉強します。", word: "大学", read: "だいがく", en: "I study Japanese at university." , ruby: { "日本語": "にほんご", "勉強": "べんきょう" } },
    kunEx: { jp: "大きい犬がいます。", word: "大きい", read: "おおきい", en: "There is a big dog." , ruby: { "犬": "いぬ" } },
    etym: "A person standing with arms and legs stretched wide — as big as a body can make itself.",
    rel: ["人", "小", "太"],
    strokes: 3, grade: 1, jlpt: "N5",
    trivia: "Add one dot and it becomes 犬 (dog) or 太 (fat) — a tiny stroke changes everything!",
    spot: "On sizes — 大 means ‘large’ (big ramen bowl 🍜)."
  },
  {
    kanji: "学", pic: "🎒",
    on: ["ガク"], kun: ["まなぶ"], en: ["learn"],
    onEx:  { jp: "学校へ行きます。", word: "学校", read: "がっこう", en: "I go to school." , ruby: { "行": "い" } },
    kunEx: { jp: "日本語を学ぶのは楽しい。", word: "学ぶ", read: "まなぶ", en: "Learning Japanese is fun." , ruby: { "日本語": "にほんご", "楽": "たの" } },
    etym: "A child (子) under a roof, with hands passing knowledge down from above — a schoolhouse in one character.",
    rel: ["子", "校", "字"],
    strokes: 8, grade: 1, jlpt: "N5",
    trivia: "It hides 子 (child) at the bottom — fitting for a character that means ‘to learn’.",
    spot: "On every 学校 (school) and 大学 (university)."
  },
  {
    kanji: "水", pic: "💧",
    on: ["スイ"], kun: ["みず"], en: ["water"],
    onEx:  { jp: "水曜日に会いましょう。", word: "水曜日", read: "すいようび", en: "Let's meet on Wednesday." , ruby: { "会": "あ" } },
    kunEx: { jp: "冷たい水を飲みます。", word: "水", read: "みず", en: "I drink cold water." , ruby: { "冷": "つめ", "飲": "の" } },
    etym: "A pictograph of a flowing stream — a central current with drops splashing off both sides.",
    rel: ["川", "海", "氷"],
    strokes: 4, grade: 1, jlpt: "N5",
    trivia: "The ‘sui’ in 水曜日 = Wednesday, literally ‘water day’.",
    spot: "On taps, bottles, and pools 🏊."
  },
  {
    kanji: "木", pic: "🌳",
    on: ["モク", "ボク"], kun: ["き"], en: ["tree", "wood"],
    onEx:  { jp: "木曜日はいそがしいです。", word: "木曜日", read: "もくようび", en: "Thursday is busy." },
    kunEx: { jp: "大きい木の下で休みます。", word: "木", read: "き", en: "I rest under a big tree." , ruby: { "大": "おお", "下": "した", "休": "やす" } },
    etym: "A pictograph of a tree: trunk in the middle, branches above, roots spreading below.",
    rel: ["本", "林", "森"],
    strokes: 4, grade: 1, jlpt: "N5",
    trivia: "Stack three (森) = forest; two (林) = grove. A whole woodland from one tree!",
    spot: "木曜日 = Thursday, and on wooden signboards 🌳."
  },
  {
    kanji: "山", pic: "🗻",
    on: ["サン"], kun: ["やま"], en: ["mountain"],
    onEx:  { jp: "富士山にのぼりたいです。", word: "富士山", read: "ふじさん", en: "I want to climb Mt. Fuji." },
    kunEx: { jp: "山の上はさむいです。", word: "山", read: "やま", en: "It's cold on top of the mountain." , ruby: { "上": "うえ" } },
    etym: "Three peaks rising from a baseline — one of the clearest surviving pictographs.",
    rel: ["川", "岩", "島"],
    strokes: 3, grade: 1, jlpt: "N5",
    trivia: "Mt. Fuji is 富士山 (Fuji-san). Also a super-common surname: 山田 (Yamada).",
    spot: "On maps, shrines, and hiking trails ⛰️."
  },
  {
    kanji: "川", pic: "🏞️",
    on: ["セン"], kun: ["かわ"], en: ["river"],
    onEx:  { jp: "河川のちずを見ます。", word: "河川", read: "かせん", en: "I look at a map of the rivers." , ruby: { "見": "み" } },
    kunEx: { jp: "川でおよぎます。", word: "川", read: "かわ", en: "I swim in the river." },
    etym: "Three flowing lines — water running between two banks.",
    rel: ["山", "水", "州"],
    strokes: 3, grade: 1, jlpt: "N5",
    trivia: "Three flowing lines = a river. Lives in surnames like 石川 and 川口.",
    spot: "On bridges and place names all over Japan."
  },
  {
    kanji: "月", pic: "🌙",
    on: ["ゲツ", "ガツ"], kun: ["つき"], en: ["moon", "month"],
    onEx:  { jp: "一月はとてもさむいです。", word: "一月", read: "いちがつ", en: "January is very cold." },
    kunEx: { jp: "今夜は月がきれいですね。", word: "月", read: "つき", en: "The moon is beautiful tonight, isn't it." , ruby: { "今夜": "こんや" } },
    etym: "A crescent moon with a shadow line inside. Because months follow the moon, it also means “month.”",
    rel: ["日", "明", "曜"],
    strokes: 4, grade: 1, jlpt: "N5",
    trivia: "Doubles as ‘month’ (一月 = January) and hides inside 明 (bright = sun+moon).",
    spot: "月曜日 = Monday 🌙."
  },
  {
    kanji: "金", pic: "💰",
    on: ["キン", "コン"], kun: ["かね"], en: ["gold", "money"],
    onEx:  { jp: "金曜日が好きです。", word: "金曜日", read: "きんようび", en: "I like Fridays." , ruby: { "好": "す" } },
    kunEx: { jp: "お金がたりません。", word: "お金", read: "おかね", en: "I don't have enough money." },
    etym: "Nuggets of metal buried under the earth, capped by a roof — treasure in the ground.",
    rel: ["土", "銀", "鉄"],
    strokes: 8, grade: 1, jlpt: "N5",
    trivia: "Means gold AND money. 金曜日 = Friday — payday energy 💰.",
    spot: "On price tags, medals 🥇, and the element gold."
  },
  {
    kanji: "土", pic: "🌱",
    on: ["ド", "ト"], kun: ["つち"], en: ["soil", "earth"],
    onEx:  { jp: "土曜日に出かけます。", word: "土曜日", read: "どようび", en: "I go out on Saturday." , ruby: { "出": "で" } },
    kunEx: { jp: "土にたねをまきます。", word: "土", read: "つち", en: "I sow seeds in the soil." },
    etym: "A mound of earth sitting on the ground line — a little pile of soil.",
    rel: ["金", "地", "場"],
    strokes: 3, grade: 1, jlpt: "N5",
    trivia: "One stroke away from 士 (samurai/scholar). 土曜日 = Saturday.",
    spot: "In gardening 🌱 and pottery studios."
  },
  {
    kanji: "子", pic: "👶",
    on: ["シ", "ス"], kun: ["こ"], en: ["child"],
    onEx:  { jp: "女子チームがかちました。", word: "女子", read: "じょし", en: "The girls' team won." },
    kunEx: { jp: "子どもがあそんでいます。", word: "子ども", read: "こども", en: "The children are playing." },
    etym: "A swaddled baby with outstretched arms and a big head — the legs are wrapped up.",
    rel: ["学", "女", "好"],
    strokes: 3, grade: 1, jlpt: "N5",
    trivia: "A little swaddled baby. The ‘-ko’ ending in classic girls’ names like 花子 (Hanako).",
    spot: "On 子ども (children) signs everywhere 👶."
  },
  {
    kanji: "女", pic: "👧",
    on: ["ジョ", "ニョ"], kun: ["おんな"], en: ["woman"],
    onEx:  { jp: "この店は女性に人気です。", word: "女性", read: "じょせい", en: "This shop is popular with women." , ruby: { "店": "みせ", "人気": "にんき" } },
    kunEx: { jp: "女の人がうたっています。", word: "女", read: "おんな", en: "A woman is singing." , ruby: { "人": "ひと" } },
    etym: "A pictograph of a kneeling figure with folded arms — the ancient posture of a seated woman.",
    rel: ["男", "子", "好"],
    strokes: 3, grade: 1, jlpt: "N5",
    trivia: "Put a child (子) beside it and you get 好 — ‘to like / love’ 💕.",
    spot: "On restroom doors 🚺."
  },
  {
    kanji: "男", pic: "👦",
    on: ["ダン", "ナン"], kun: ["おとこ"], en: ["man", "male"],
    onEx:  { jp: "男性用のトイレはあちらです。", word: "男性", read: "だんせい", en: "The men's restroom is over there." , ruby: { "用": "よう" } },
    kunEx: { jp: "男の子がはしっています。", word: "男", read: "おとこ", en: "A boy is running." , ruby: { "子": "こ" } },
    etym: "Strength (力) applied in the rice field (田) — the one doing heavy field work.",
    rel: ["女", "田", "力"],
    strokes: 7, grade: 1, jlpt: "N5",
    trivia: "Rice field (田) + strength (力) = the one who works the field.",
    spot: "On restroom doors 🚹."
  },
  {
    kanji: "本", pic: "📕",
    on: ["ホン"], kun: ["もと"], en: ["book", "origin"],
    onEx:  { jp: "としょかんで本を読みます。", word: "本", read: "ほん", en: "I read a book at the library." , ruby: { "読": "よ" } },
    kunEx: { jp: "木の本で待っています。", word: "本", read: "もと", en: "I'm waiting at the foot of the tree." , ruby: { "木": "き", "待": "ま" } },
    etym: "A tree (木) with a stroke marking its base — the root, the origin. Books came later, as “the source” of knowledge.",
    rel: ["木", "日", "体"],
    strokes: 5, grade: 1, jlpt: "N5",
    trivia: "A tree with a line at its root = ‘origin’. Also the counter for long thin things (本 of pens, bottles).",
    spot: "On books 📕 and in 日本 (Japan) itself."
  },
  {
    kanji: "上", pic: "🎈",
    on: ["ジョウ"], kun: ["うえ", "あがる"], en: ["up", "above"],
    onEx:  { jp: "屋上から海が見えます。", word: "屋上", read: "おくじょう", en: "You can see the ocean from the rooftop." , ruby: { "海": "うみ", "見": "み" } },
    kunEx: { jp: "つくえの上にねこがいます。", word: "上", read: "うえ", en: "There's a cat on the desk." },
    etym: "A short stroke above a baseline — literally the idea of “above.” Its twin, 下, points below.",
    rel: ["下", "中", "山"],
    strokes: 3, grade: 1, jlpt: "N5",
    trivia: "Its mirror-twin 下 means ‘down’. Also means ‘to board / go up’.",
    spot: "On elevators ⬆️ and up-escalators."
  }
];
