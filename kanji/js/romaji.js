/*
 * romaji.js — transliterate Japanese kana (hiragana or katakana) into a
 * phonetic Latin reading, e.g. こ -> "ko", ジョウ -> "jou", おんな -> "onna".
 *
 * This is the English/Hepburn-ish phonetic. The collection cards call
 * phonetic(kana, lang) so other UI languages can plug in their own scheme
 * later (e.g. Spanish would spell じ closer to "yi"); today only "en" is
 * implemented and it's the default.
 */
const Phonetic = (function () {
  // Base moras (hiragana). Katakana is normalized to hiragana first.
  const BASE = {
    "あ":"a","い":"i","う":"u","え":"e","お":"o",
    "か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
    "が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go",
    "さ":"sa","し":"shi","す":"su","せ":"se","そ":"so",
    "ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo",
    "た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
    "だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do",
    "な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no",
    "は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho",
    "ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo",
    "ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po",
    "ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
    "や":"ya","ゆ":"yu","よ":"yo",
    "ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro",
    "わ":"wa","ゐ":"wi","ゑ":"we","を":"wo","ん":"n",
    "ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o"
  };
  const SMALL_Y = { "ゃ":"a", "ゅ":"u", "ょ":"o" };
  const VOWELS = { a:1, i:1, u:1, e:1, o:1 };

  // Katakana (U+30A1–U+30F6) -> hiragana (shift down 0x60).
  function toHira(str) {
    let out = "";
    for (const ch of str) {
      const c = ch.codePointAt(0);
      out += (c >= 0x30a1 && c <= 0x30f6) ? String.fromCodePoint(c - 0x60) : ch;
    }
    return out;
  }

  function hep(kana) {
    const s = toHira(kana);
    let out = "";
    let geminate = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      const next = s[i + 1];

      if (ch === "っ") { geminate = true; continue; }

      // prolonged sound mark: repeat the last vowel
      if (ch === "ー" || ch === "―") {
        const last = out[out.length - 1];
        if (VOWELS[last]) out += last;
        continue;
      }

      let mora = BASE[ch];
      if (mora === undefined) { out += ch; continue; }

      // consonant + small ya/yu/yo (きゃ -> kya, しょ -> sho, じょ -> jo)
      if (SMALL_Y[next] !== undefined && mora.endsWith("i") && mora !== "i") {
        const stem = mora.slice(0, -1); // ki->k, shi->sh, chi->ch, ji->j
        mora = (stem === "sh" || stem === "ch" || stem === "j")
          ? stem + SMALL_Y[next]         // sho, cha, ju ...
          : stem + "y" + SMALL_Y[next];  // kya, nyu ...
        i++; // consumed the small kana
      }

      if (geminate) {
        // double the leading consonant (っち -> tchi, else double first letter)
        mora = (mora.startsWith("ch") ? "t" : mora[0]) + mora;
        geminate = false;
      }
      out += mora;
    }
    return out;
  }

  return {
    // lang reserved for future non-English phonetics; defaults to Hepburn.
    to(kana, lang) { return hep(kana); }
  };
})();

function phonetic(kana, lang) { return Phonetic.to(kana, lang || "en"); }
