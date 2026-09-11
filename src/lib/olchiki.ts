// ─────────────────────────────────────────────────────────────────────────────
// Ol Chiki (Santali script) — alphabet, typing conventions and a curated
// Santali-English lexicon.
//
// Source: "A Concise Santali-English Dictionary" by R. C. Hansdah &
// N. C. Murmu, Indian Institute of Science / NAL, Bangalore (2003).
// Ol Chiki was created by Pandit Raghunath Murmu in the 1930s. It is the
// official script for Santali and is bundled here so the reference works
// 100% offline. Entries are used to ground Nemotron with authentic Santali
// vocabulary (Teacher → Nemotron → Student pipeline).
// ─────────────────────────────────────────────────────────────────────────────

// ── The 30 letters of the Ol Chiki alphabet (user-provided order) ───────────

export interface OlChikiLetter {
  ol: string; // Ol Chiki glyph
  latin: string; // Latin transliteration
  name: string; // traditional letter name
}

export const OLCHIKI_ALPHABET: OlChikiLetter[] = [
  { ol: "ᱚ", latin: "a", name: "la" },
  { ol: "ᱛ", latin: "t", name: "at" },
  { ol: "ᱜ", latin: "g", name: "ag" },
  { ol: "ᱝ", latin: "ṃ", name: "ang" },
  { ol: "ᱞ", latin: "l", name: "al" },
  { ol: "ᱟ", latin: "ā", name: "laa" },
  { ol: "ᱠ", latin: "k", name: "aak" },
  { ol: "ᱡ", latin: "j", name: "aaj" },
  { ol: "ᱢ", latin: "m", name: "aam" },
  { ol: "ᱣ", latin: "w", name: "aaw" },
  { ol: "ᱤ", latin: "i", name: "li" },
  { ol: "ᱥ", latin: "s", name: "is" },
  { ol: "ᱦ", latin: "ẖ", name: "ih" },
  { ol: "ᱧ", latin: "ñ", name: "iny" },
  { ol: "ᱨ", latin: "r", name: "ir" },
  { ol: "ᱩ", latin: "u", name: "lu" },
  { ol: "ᱪ", latin: "c", name: "uc" },
  { ol: "ᱫ", latin: "d", name: "ud" },
  { ol: "ᱬ", latin: "ṇ", name: "unn" },
  { ol: "ᱭ", latin: "y", name: "uy" },
  { ol: "ᱮ", latin: "e", name: "le" },
  { ol: "ᱯ", latin: "p", name: "up" },
  { ol: "ᱰ", latin: "ḍ", name: "udd" },
  { ol: "ᱱ", latin: "n", name: "un" },
  { ol: "ᱲ", latin: "ṛ", name: "urr" },
  { ol: "ᱳ", latin: "o", name: "lo" },
  { ol: "ᱴ", latin: "ṭ", name: "utt" },
  { ol: "ᱵ", latin: "b", name: "ub" },
  { ol: "ᱸ", latin: "ṅ", name: "mu-ṭuḍăg (nasal mark)" },
  { ol: "ᱷ", latin: "h", name: "uh" },
];

// ── Keyboard typing conventions (user-provided) ─────────────────────────────

export interface OlChikiTyping {
  keys: string;
  result: string;
  note: string;
}

export const OLCHIKI_TYPING: OlChikiTyping[] = [
  { keys: "aa / A", result: "ā", note: "Type aa (or A) for ā" },
  { keys: "M T D N R", result: "ṁ ṭ ḍ ṇ ṛ", note: "Uppercase for the letters with a dot" },
  { keys: "G / ng", result: "ṅ", note: "Type G or ng for ṅ" },
  { keys: "J", result: "ñ", note: "Type J for ñ" },
  { keys: "=", result: "diacritics", note: "Type = for the Latin letters with diacritics" },
  { keys: "+", result: "ᱸ", note: "+ for the nasalization mark (mũ ṭuḍăg)" },
  { keys: "++", result: "ᱹ", note: "++ for the vowel modifier (găhlă ṭuḍăg)" },
  { keys: "+++", result: "ᱺ", note: "+++ for the nasalized vowel modifier (mũ găhlă ṭuḍăg)" },
  { keys: "_", result: "ᱻ", note: "_ for the vowel prolongator (relā)" },
  { keys: "-", result: "ᱼ", note: "- for the separator (phārkā)" },
  { keys: "'", result: "ᱽ", note: "' for the aspiration (ohad)" },
  { keys: ".", result: "᱾", note: ". for end of sentence (mucăd); .. for section end (double mucăd) ᱿" },
];

// ── Curated Santali-English lexicon (Hansdah & Murmu, 2003) ─────────────────
// word: exactly as transliterated in the dictionary; en: English meaning;
// hi: Hindi meaning; dev: Devanagari Santali form from our school packs
// (empty when not part of the pack); kind: category for filtering.

export interface OlChikiEntry {
  word: string;
  pos: string;
  en: string;
  hi: string;
  dev: string;
  kind: string;
}

export const OLCHIKI_DICTIONARY: OlChikiEntry[] = [
  // ── basic words ──
  { word: "DAG", pos: "n.", en: "water; to rain", hi: "पानी; बारिश होना", dev: "दक्", kind: "basic" },
  { word: "hoPon", pos: "n.", en: "child; small", hi: "बच्चा; छोटा", dev: "होन", kind: "basic" },
  { word: "GIDX_RA.", pos: "n.", en: "child", hi: "बच्चा", dev: "", kind: "basic" },
  { word: "hUdIQ", pos: "adj.", en: "small", hi: "छोटा", dev: "हुड़िङ्", kind: "basic" },
  { word: "mARAF", pos: "adj.", en: "big, great, elder", hi: "बड़ा", dev: "मरङ्", kind: "basic" },
  { word: "SE:MA", pos: "adj.", en: "big, great", hi: "बड़ा, महान", dev: "", kind: "basic" },
  { word: "BES", pos: "adj.", en: "good", hi: "अच्छा", dev: "भाला", kind: "basic" },
  { word: "BAfthIK", pos: "adj.", en: "bad", hi: "बुरा", dev: "", kind: "basic" },
  { word: "mEn", pos: "vt.", en: "to speak; to tell", hi: "बोलना; बताना", dev: "", kind: "basic" },
  { word: "SEn", pos: "vi.", en: "to go", hi: "जाना", dev: "", kind: "basic" },
  { word: "Em", pos: "vt.", en: "to give", hi: "देना", dev: "", kind: "basic" },
  { word: "IDI", pos: "vt.", en: "to take", hi: "लेना", dev: "", kind: "basic" },
  { word: "A.GU", pos: "vt.", en: "to bring", hi: "लाना", dev: "", kind: "basic" },
  { word: "QEL", pos: "vt.", en: "to see", hi: "देखना", dev: "नेल", kind: "basic" },
  { word: "UDUG", pos: "vt.", en: "to show; to point", hi: "दिखाना", dev: "", kind: "basic" },
  { word: "BUJHA.W", pos: "vt.", en: "to understand", hi: "समझना", dev: "", kind: "basic" },
  { word: "QU~", pos: "vt.", en: "to drink", hi: "पीना", dev: "", kind: "basic" },
  { word: "Jom", pos: "n., vt.", en: "food; to eat", hi: "खाना", dev: "जोम", kind: "basic" },
  { word: "JA.PID", pos: "n., vi.", en: "sleep; to sleep", hi: "नींद; सोना", dev: "निन्द्रा", kind: "basic" },
  { word: "Doho", pos: "vt.", en: "to keep", hi: "रखना", dev: "", kind: "basic" },
  { word: "DUZUB", pos: "vi.", en: "to sit", hi: "बैठना", dev: "", kind: "basic" },
  { word: "RAG", pos: "vi.", en: "to cry; to weep", hi: "रोना", dev: "", kind: "basic" },
  { word: "LANDA", pos: "vi.", en: "to smile; to laugh", hi: "हँसना", dev: "", kind: "basic" },
  { word: "EnEJ", pos: "vi.", en: "to dance; to play", hi: "नाचना; खेलना", dev: "", kind: "basic" },
  { word: "TANhEn", pos: "vi.", en: "to live", hi: "जीना", dev: "", kind: "basic" },
  { word: "QAPAm", pos: "vi.", en: "to meet", hi: "मिलना", dev: "", kind: "basic" },
  { word: "KA.mI", pos: "n.", en: "work", hi: "काम", dev: "", kind: "basic" },
  { word: "KHoBoR", pos: "n.", en: "news", hi: "समाचार", dev: "", kind: "basic" },
  { word: "CHoBI", pos: "n.", en: "picture; figure", hi: "चित्र", dev: "", kind: "basic" },
  { word: "SAdE", pos: "n.", en: "sound", hi: "आवाज़", dev: "", kind: "basic" },
  { word: "JAYGA", pos: "n.", en: "space; place", hi: "जगह", dev: "", kind: "basic" },
  { word: "RAn", pos: "n.", en: "medicine", hi: "दवा", dev: "", kind: "basic" },
  { word: "EhoB", pos: "n.", en: "beginning; to begin", hi: "शुरुआत", dev: "", kind: "basic" },
  { word: "mIDUn", pos: "n.", en: "meeting", hi: "सभा", dev: "", kind: "basic" },
  { word: "UPURUm", pos: "n.", en: "recognition", hi: "पहचान", dev: "", kind: "basic" },
  { word: "SAVTA", pos: "n.", en: "society", hi: "समाज", dev: "", kind: "basic" },
  { word: "BAPLA", pos: "n.", en: "marriage; to marry", hi: "शादी", dev: "", kind: "relations" },
  { word: "SA.GA.Y", pos: "n.", en: "relation", hi: "रिश्ता", dev: "", kind: "relations" },
  { word: "BHoRSA", pos: "n.", en: "trust; faith", hi: "भरोसा", dev: "", kind: "basic" },

  // ── school ──
  { word: "ASnA", pos: "n.", en: "school", hi: "स्कूल", dev: "स्कूल", kind: "school" },
  { word: "mACET", pos: "n.", en: "teacher", hi: "अध्यापक", dev: "गुरु", kind: "school" },
  { word: "CETETIYA", pos: "n.", en: "student", hi: "विद्यार्थी", dev: "", kind: "school" },
  { word: "PUTHI", pos: "n.", en: "book", hi: "किताब", dev: "पोथी", kind: "school" },
  { word: "PoToB", pos: "n.", en: "book", hi: "किताब", dev: "पोथी", kind: "school" },
  { word: "oL", pos: "n., vt.", en: "writing; to write", hi: "लिखना", dev: "", kind: "school" },
  { word: "PAZhAW", pos: "adj., vt.", en: "educated; to teach; to read", hi: "पढ़ाना; पढ़ना", dev: "", kind: "school" },
  { word: "ELKHA", pos: "n.", en: "mathematics", hi: "गणित", dev: "", kind: "school" },
  { word: "SELED", pos: "n., vt.", en: "addition; to add", hi: "जोड़", dev: "जोड़", kind: "school" },
  { word: "BHEGED", pos: "n., vt.", en: "subtraction; to subtract", hi: "घटाव", dev: "घटाव", kind: "school" },
  { word: "LEKHA", pos: "n., vt.", en: "number; to count", hi: "संख्या; गिनना", dev: "लेखा", kind: "school" },
  { word: "QECEL", pos: "n.", en: "example", hi: "उदाहरण", dev: "", kind: "school" },
  { word: "A.ZA.", pos: "n.", en: "word", hi: "शब्द", dev: "", kind: "school" },
  { word: "A.YA.T", pos: "n.", en: "sentence", hi: "वाक्य", dev: "", kind: "school" },
  { word: "SAhtA", pos: "n.", en: "page", hi: "पन्ना", dev: "", kind: "school" },
  { word: "QUTUm", pos: "n., vt.", en: "name; to name", hi: "नाम", dev: "ञुतम्", kind: "school" },
  { word: "SANMES", pos: "n.", en: "science", hi: "विज्ञान", dev: "", kind: "school" },
  { word: "RoZ", pos: "n., vt.", en: "language; to speak", hi: "भाषा; बोलना", dev: "", kind: "school" },
  { word: "RonoZ", pos: "n.", en: "grammar", hi: "व्याकरण", dev: "", kind: "grammar" },
  { word: "KAnWA", pos: "n.", en: "verb", hi: "क्रिया", dev: "", kind: "grammar" },
  { word: "QUnUm", pos: "n.", en: "noun", hi: "संज्ञा", dev: "", kind: "grammar" },
  { word: "UQUm", pos: "n.", en: "pronoun", hi: "सर्वनाम", dev: "", kind: "grammar" },
  { word: "GUnUn", pos: "n.", en: "adjective", hi: "विशेषण", dev: "", kind: "grammar" },
  { word: "TonoZ", pos: "n.", en: "adverb", hi: "क्रिया-विशेषण", dev: "", kind: "grammar" },
  { word: "TonoF", pos: "n.", en: "conjunction", hi: "समुच्चयबोधक", dev: "", kind: "grammar" },

  // ── numbers ──
  { word: "mID", pos: "n., adj.", en: "one", hi: "एक", dev: "मिट्", kind: "numbers" },
  { word: "BAR", pos: "n., adj.", en: "two", hi: "दो", dev: "बार", kind: "numbers" },
  { word: "PE", pos: "n., adj.", en: "three", hi: "तीन", dev: "पे", kind: "numbers" },
  { word: "PUn", pos: "n., adj.", en: "four", hi: "चार", dev: "पोन", kind: "numbers" },
  { word: "moME", pos: "n., adj.", en: "five", hi: "पाँच", dev: "मोँये", kind: "numbers" },
  { word: "TURUY", pos: "n., adj.", en: "six", hi: "छह", dev: "तुरुय", kind: "numbers" },
  { word: "EYAY", pos: "n., adj.", en: "seven", hi: "सात", dev: "एयाय", kind: "numbers" },
  { word: "IRA.L", pos: "n., adj.", en: "eight", hi: "आठ", dev: "इराल्", kind: "numbers" },
  { word: "ARE", pos: "n., adj.", en: "nine", hi: "नौ", dev: "अरे", kind: "numbers" },
  { word: "GEL", pos: "n., adj.", en: "ten", hi: "दस", dev: "गेल", kind: "numbers" },
  { word: "EL", pos: "n.", en: "digit", hi: "अंक", dev: "", kind: "numbers" },

  // ── colors ──
  { word: "LIL", pos: "adj.", en: "blue", hi: "नीला", dev: "", kind: "colors" },
  { word: "ARAG", pos: "adj.", en: "red", hi: "लाल", dev: "", kind: "colors" },
  { word: "PUNM", pos: "adj.", en: "white", hi: "सफ़ेद", dev: "", kind: "colors" },
  { word: "hE:DE.", pos: "adj.", en: "black", hi: "काला", dev: "", kind: "colors" },

  // ── nature ──
  { word: "A.TU", pos: "n.", en: "village", hi: "गाँव", dev: "आतो", kind: "nature" },
  { word: "hASA", pos: "n.", en: "soil; to become dirty", hi: "मिट्टी", dev: "हासा", kind: "nature" },
  { word: "BURU", pos: "n.", en: "mountain; hill", hi: "पहाड़", dev: "", kind: "nature" },
  { word: "dUNGX_RI", pos: "n.", en: "hill", hi: "पहाड़ी", dev: "", kind: "nature" },
  { word: "DISom", pos: "n.", en: "country", hi: "देश", dev: "", kind: "nature" },
  { word: "BAGAn", pos: "n.", en: "garden", hi: "बगीचा", dev: "", kind: "nature" },
  { word: "SE:GE.L", pos: "n.", en: "fire", hi: "आग", dev: "सेनेल", kind: "nature" },
  { word: "SomoY", pos: "n.", en: "time", hi: "समय", dev: "समय", kind: "nature" },
  { word: "tHoP", pos: "n.", en: "a drop", hi: "बूँद", dev: "", kind: "nature" },
  { word: "DISA.", pos: "n., vt.", en: "direction; good sense; to understand", hi: "दिशा; समझ", dev: "", kind: "nature" },

  // ── animals & people ──
  { word: "hA.KU", pos: "n.", en: "fish", hi: "मछली", dev: "हाकु", kind: "animals" },
  { word: "TA.RUB", pos: "n.", en: "tiger", hi: "बाघ", dev: "कुला", kind: "animals" },
  { word: "TUYU", pos: "n.", en: "fox", hi: "लोमड़ी", dev: "", kind: "animals" },
  { word: "PUSI", pos: "n.", en: "cat", hi: "बिल्ली", dev: "", kind: "animals" },
  { word: "BIQ", pos: "n.", en: "snake", hi: "साँप", dev: "", kind: "animals" },
  { word: "RotE", pos: "n.", en: "frog", hi: "मेंढक", dev: "", kind: "animals" },
  { word: "JAnWoR", pos: "n.", en: "animal", hi: "जानवर", dev: "", kind: "animals" },
  { word: "CE:ME.", pos: "n.", en: "bird", hi: "पक्षी", dev: "", kind: "animals" },
  { word: "KoZA", pos: "n., adj.", en: "man; young; boy", hi: "लड़का", dev: "", kind: "people" },
  { word: "KUZI~", pos: "n., adj.", en: "woman; young; girl", hi: "लड़की", dev: "", kind: "people" },
  { word: "hoZ", pos: "n.", en: "human being; person", hi: "इंसान", dev: "", kind: "people" },
  { word: "BA.BU", pos: "n.", en: "boy (BA.BU GIDX_RA.)", hi: "लड़का", dev: "", kind: "people" },
  { word: "mA.Y", pos: "n.", en: "girl (mA.Y GIDX_RA.)", hi: "लड़की", dev: "", kind: "people" },
];

export const OLCHIKI_KINDS: Array<{ value: string; label: string }> = [
  { value: "all", label: "सभी (all)" },
  { value: "basic", label: "रोज़ के शब्द (everyday)" },
  { value: "school", label: "स्कूल (school)" },
  { value: "numbers", label: "संख्या (numbers)" },
  { value: "colors", label: "रंग (colors)" },
  { value: "nature", label: "प्रकृति (nature)" },
  { value: "animals", label: "जानवर (animals)" },
  { value: "people", label: "लोग (people)" },
  { value: "grammar", label: "व्याकरण (grammar)" },
  { value: "relations", label: "रिश्ते (relations)" },
];

export function searchOlChiki(q: string, kind: string): OlChikiEntry[] {
  const query = q.trim().toLowerCase();
  return OLCHIKI_DICTIONARY.filter((e) => {
    if (kind !== "all" && e.kind !== kind) return false;
    if (!query) return true;
    return (
      e.word.toLowerCase().includes(query) ||
      e.en.toLowerCase().includes(query) ||
      e.hi.includes(query) ||
      (e.dev && e.dev.includes(query))
    );
  });
}
