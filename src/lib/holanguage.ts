// ─────────────────────────────────────────────────────────────────────────────
// English–Ho Vocabulary — curated from
// "ENGLISH – HO VOCABULARY", J. Deeney, S.J., 1975,
// Xavier Ho Publications, St. Xavier's High School, Chaibasa.
//
// The entries ground Nemotron with authentic Ho words (Teacher → Nemotron →
// Student pipeline) and power the offline Ho reference tab in the Dictionary.
// ─────────────────────────────────────────────────────────────────────────────

export interface HoEntry {
  en: string; // English headword (as in the source)
  ho: string; // Ho word (as in the source)
  hi: string; // Hindi meaning for the school pack
  kind: string; // category
}

export const HO_DICTIONARY: HoEntry[] = [
  // ── school & study ──
  { en: "school", ho: "iskul", hi: "स्कूल", kind: "school" },
  { en: "teacher", ho: "guru, matasor", hi: "शिक्षक", kind: "school" },
  { en: "book", ho: "kitab", hi: "किताब", kind: "school" },
  { en: "paper", ho: "ol sakam", hi: "कागज़", kind: "school" },
  { en: "letter", ho: "chiti", hi: "चिट्ठी", kind: "school" },
  { en: "page", ho: "sakam", hi: "पन्ना", kind: "school" },
  { en: "slate", ho: "selati", hi: "स्लेट", kind: "school" },
  { en: "write", ho: "ol", hi: "लिखना", kind: "school" },
  { en: "read", ho: "paraw", hi: "पढ़ना", kind: "school" },
  { en: "learn", ho: "eton", hi: "सीखना", kind: "school" },
  { en: "teach", ho: "eto", hi: "पढ़ाना", kind: "school" },
  { en: "word", ho: "ā-kaji, ā-jagar", hi: "शब्द", kind: "school" },
  { en: "language", ho: "kaji", hi: "भाषा", kind: "school" },
  { en: "meaning", ho: "mundi", hi: "अर्थ", kind: "school" },
  { en: "say, tell", ho: "kaji, men", hi: "कहना", kind: "school" },
  { en: "speak", ho: "jagar", hi: "बोलना", kind: "school" },
  { en: "ask", ho: "kuli", hi: "पूछना", kind: "school" },
  { en: "answer", ho: "kaji-ura, kaji-hal", hi: "उत्तर", kind: "school" },
  { en: "question", ho: "kuli", hi: "प्रश्न", kind: "school" },
  { en: "count", ho: "leka", hi: "गिनना", kind: "school" },
  { en: "study", ho: "paraw", hi: "पढ़ाई", kind: "school" },
  { en: "student", ho: "chela", hi: "विद्यार्थी", kind: "school" },
  { en: "song", ho: "durań", hi: "गीत", kind: "school" },
  { en: "dance", ho: "susun, sun", hi: "नाचना", kind: "school" },
  { en: "play", ho: "inuń", hi: "खेलना", kind: "school" },

  // ── nature ──
  { en: "water", ho: "da:", hi: "पानी", kind: "nature" },
  { en: "rain", ho: "gama", hi: "बारिश", kind: "nature" },
  { en: "cloud", ho: "rimil", hi: "बादल", kind: "nature" },
  { en: "wind, air", ho: "hoyo", hi: "हवा", kind: "nature" },
  { en: "sun", ho: "singi", hi: "सूरज", kind: "nature" },
  { en: "moon", ho: "chandu:", hi: "चाँद", kind: "nature" },
  { en: "star", ho: "ipil", hi: "तारा", kind: "nature" },
  { en: "earth, soil", ho: "hasa", hi: "मिट्टी", kind: "nature" },
  { en: "ground", ho: "ote", hi: "ज़मीन", kind: "nature" },
  { en: "mountain, hill", ho: "buru", hi: "पहाड़", kind: "nature" },
  { en: "river", ho: "gara", hi: "नदी", kind: "nature" },
  { en: "forest", ho: "bir", hi: "जंगल", kind: "nature" },
  { en: "fire", ho: "sengel", hi: "आग", kind: "nature" },
  { en: "tree", ho: "daru", hi: "पेड़", kind: "nature" },
  { en: "flower", ho: "bā", hi: "फूल", kind: "nature" },
  { en: "fruit", ho: "jō", hi: "फल", kind: "nature" },
  { en: "leaf", ho: "sakam, patā", hi: "पत्ता", kind: "nature" },
  { en: "root", ho: "rētn", hi: "जड़", kind: "nature" },
  { en: "seed", ho: "hita, jań biti", hi: "बीज", kind: "nature" },
  { en: "day", ho: "din, singi", hi: "दिन", kind: "nature" },
  { en: "night", ho: "nida", hi: "रात", kind: "nature" },
  { en: "morning", ho: "seta:", hi: "सुबह", kind: "nature" },
  { en: "evening", ho: "ayub", hi: "शाम", kind: "nature" },
  { en: "today", ho: "tisiń", hi: "आज", kind: "nature" },
  { en: "tomorrow", ho: "gapa", hi: "कल (आने वाला)", kind: "nature" },
  { en: "yesterday", ho: "hola", hi: "कल (बीता)", kind: "nature" },
  { en: "year", ho: "sirma", hi: "साल", kind: "nature" },
  { en: "time", ho: "dipli, somay", hi: "समय", kind: "nature" },
  { en: "rainbow", ho: "rulbiń oń", hi: "इंद्रधनुष", kind: "nature" },
  { en: "pond", ho: "damuka, dakud", hi: "तालाब", kind: "nature" },

  // ── food ──
  { en: "eat", ho: "jom", hi: "खाना", kind: "food" },
  { en: "drink", ho: "nū", hi: "पीना", kind: "food" },
  { en: "food", ho: "jomeya:", hi: "भोजन", kind: "food" },
  { en: "rice (cooked)", ho: "mandi", hi: "चावल (पका)", kind: "food" },
  { en: "milk", ho: "towa", hi: "दूध", kind: "food" },
  { en: "meat", ho: "jilu", hi: "मांस", kind: "food" },
  { en: "egg", ho: "jarom, sim-jarom", hi: "अंडा", kind: "food" },
  { en: "vegetable", ho: "ā:, ā:-sakam", hi: "सब्ज़ी", kind: "food" },
  { en: "salt", ho: "buluń", hi: "नमक", kind: "food" },
  { en: "sweet", ho: "sibil", hi: "मीठा", kind: "food" },
  { en: "tea", ho: "chã", hi: "चाय", kind: "food" },
  { en: "honey", ho: "nili rasi", hi: "शहद", kind: "food" },
  { en: "fish", ho: "haku", hi: "मछली", kind: "food" },
  { en: "mango", ho: "uli", hi: "आम", kind: "food" },

  // ── people & family ──
  { en: "child", ho: "hon", hi: "बच्चा", kind: "people" },
  { en: "boy", ho: "kowahon", hi: "लड़का", kind: "people" },
  { en: "girl", ho: "kui-hon", hi: "लड़की", kind: "people" },
  { en: "man", ho: "hō, kowa", hi: "आदमी", kind: "people" },
  { en: "woman", ho: "kui, era", hi: "औरत", kind: "people" },
  { en: "father", ho: "apu", hi: "पिता", kind: "people" },
  { en: "mother", ho: "enga", hi: "माँ", kind: "people" },
  { en: "old man", ho: "hām", hi: "बूढ़ा", kind: "people" },
  { en: "old woman", ho: "buri", hi: "बूढ़ी", kind: "people" },
  { en: "friend", ho: "juri", hi: "दोस्त", kind: "people" },
  { en: "doctor", ho: "kubiraj, dakador", hi: "डॉक्टर", kind: "people" },
  { en: "king", ho: "raja", hi: "राजा", kind: "people" },
  { en: "baby", ho: "bale: hon", hi: "शिशु", kind: "people" },
  { en: "people", ho: "manwa", hi: "लोग", kind: "people" },

  // ── animals ──
  { en: "tiger", ho: "kula", hi: "बाघ", kind: "animals" },
  { en: "dog", ho: "seta", hi: "कुत्ता", kind: "animals" },
  { en: "cat", ho: "bilae, pusi", hi: "बिल्ली", kind: "animals" },
  { en: "cow", ho: "gundi", hi: "गाय", kind: "animals" },
  { en: "buffalo", ho: "kera", hi: "भैंस", kind: "animals" },
  { en: "goat", ho: "merom", hi: "बकरी", kind: "animals" },
  { en: "sheep", ho: "mindi", hi: "भेड़", kind: "animals" },
  { en: "horse", ho: "sadom", hi: "घोड़ा", kind: "animals" },
  { en: "elephant", ho: "hati", hi: "हाथी", kind: "animals" },
  { en: "monkey", ho: "gai, sara:", hi: "बंदर", kind: "animals" },
  { en: "bear", ho: "balu, bana", hi: "भालू", kind: "animals" },
  { en: "fox", ho: "karamcha:", hi: "लोमड़ी", kind: "animals" },
  { en: "jackal", ho: "tuyu", hi: "गीदड़", kind: "animals" },
  { en: "rabbit", ho: "kulae", hi: "खरगोश", kind: "animals" },
  { en: "snake", ho: "biń", hi: "साँप", kind: "animals" },
  { en: "bird", ho: "oe", hi: "पक्षी", kind: "animals" },
  { en: "chicken", ho: "sim", hi: "मुर्गी", kind: "animals" },
  { en: "hen", ho: "enga sim", hi: "मुर्गी", kind: "animals" },
  { en: "cock", ho: "sandi sim", hi: "मुर्गा", kind: "animals" },
  { en: "parrot", ho: "kereyadn", hi: "तोता", kind: "animals" },
  { en: "peacock", ho: "mara:", hi: "मोर", kind: "animals" },
  { en: "crow", ho: "kā:", hi: "कौआ", kind: "animals" },
  { en: "pigeon", ho: "dudulum", hi: "कबूतर", kind: "animals" },
  { en: "duck", ho: "kõro", hi: "बत्तख", kind: "animals" },
  { en: "frog", ho: "choke", hi: "मेंढक", kind: "animals" },
  { en: "crab", ho: "katkom", hi: "केकड़ा", kind: "animals" },
  { en: "ant", ho: "mui:", hi: "चींटी", kind: "animals" },
  { en: "mosquito", ho: "sikī", hi: "मच्छर", kind: "animals" },
  { en: "fly", ho: "roko", hi: "मक्खी", kind: "animals" },
  { en: "butterfly", ho: "pampal", hi: "तितली", kind: "animals" },
  { en: "bee", ho: "dumur", hi: "मधुमक्खी", kind: "animals" },

  // ── body ──
  { en: "head", ho: "bō:", hi: "सिर", kind: "body" },
  { en: "hair", ho: "bale, bō: bale", hi: "बाल", kind: "body" },
  { en: "eye", ho: "med", hi: "आँख", kind: "body" },
  { en: "ear", ho: "lutur", hi: "कान", kind: "body" },
  { en: "nose", ho: "muwa, muta", hi: "नाक", kind: "body" },
  { en: "mouth", ho: "ā, mocha", hi: "मुँह", kind: "body" },
  { en: "tooth", ho: "data", hi: "दाँत", kind: "body" },
  { en: "tongue", ho: "le:", hi: "जीभ", kind: "body" },
  { en: "hand", ho: "tī", hi: "हाथ", kind: "body" },
  { en: "finger", ho: "ganda", hi: "उँगली", kind: "body" },
  { en: "leg, foot", ho: "kata", hi: "पैर", kind: "body" },
  { en: "heart", ho: "su:r", hi: "दिल", kind: "body" },
  { en: "blood", ho: "mayom", hi: "खून", kind: "body" },
  { en: "bone", ho: "jań", hi: "हड्डी", kind: "body" },
  { en: "body", ho: "homō", hi: "शरीर", kind: "body" },

  // ── colors ──
  { en: "red", ho: "jenga", hi: "लाल", kind: "colors" },
  { en: "black", ho: "hende", hi: "काला", kind: "colors" },
  { en: "white", ho: "pundi", hi: "सफ़ेद", kind: "colors" },
  { en: "green (unripe)", ho: "beret", hi: "हरा/कच्चा", kind: "colors" },
  { en: "yellow", ho: "sasań", hi: "पीला", kind: "colors" },

  // ── numbers ──
  { en: "one", ho: "miyad, mid", hi: "एक", kind: "numbers" },
  { en: "two", ho: "bar", hi: "दो", kind: "numbers" },
  { en: "three", ho: "apē, apiya", hi: "तीन", kind: "numbers" },
  { en: "four", ho: "upun", hi: "चार", kind: "numbers" },
  { en: "five", ho: "moe", hi: "पाँच", kind: "numbers" },
  { en: "six", ho: "turui", hi: "छह", kind: "numbers" },
  { en: "seven", ho: "ai", hi: "सात", kind: "numbers" },
  { en: "eight", ho: "iril", hi: "आठ", kind: "numbers" },
  { en: "nine", ho: "arē", hi: "नौ", kind: "numbers" },
  { en: "ten", ho: "gel", hi: "दस", kind: "numbers" },
  { en: "hundred", ho: "misisiri", hi: "सौ", kind: "numbers" },

  // ── verbs ──
  { en: "go", ho: "seno:", hi: "जाना", kind: "verbs" },
  { en: "come", ho: "huju:", hi: "आना", kind: "verbs" },
  { en: "sit", ho: "dub", hi: "बैठना", kind: "verbs" },
  { en: "stand", ho: "tingu", hi: "खड़ा होना", kind: "verbs" },
  { en: "sleep", ho: "dūm", hi: "सोना", kind: "verbs" },
  { en: "get up", ho: "uta", hi: "उठना", kind: "verbs" },
  { en: "see", ho: "nel", hi: "देखना", kind: "verbs" },
  { en: "hear", ho: "ayum", hi: "सुनना", kind: "verbs" },
  { en: "give", ho: "em", hi: "देना", kind: "verbs" },
  { en: "take", ho: "id", hi: "लेना", kind: "verbs" },
  { en: "bring", ho: "agu, au", hi: "लाना", kind: "verbs" },
  { en: "buy", ho: "kiriń", hi: "खरीदना", kind: "verbs" },
  { en: "sell", ho: "akariń", hi: "बेचना", kind: "verbs" },
  { en: "run", ho: "nir", hi: "दौड़ना", kind: "verbs" },
  { en: "walk", ho: "sen", hi: "चलना", kind: "verbs" },
  { en: "laugh", ho: "landa", hi: "हँसना", kind: "verbs" },
  { en: "cry", ho: "ra:", hi: "रोना", kind: "verbs" },
  { en: "like, love", ho: "rãsa, suku", hi: "पसंद करना", kind: "verbs" },
  { en: "want", ho: "nam, sanań", hi: "चाहना", kind: "verbs" },
  { en: "know", ho: "ada, atkar", hi: "जानना", kind: "verbs" },
  { en: "understand", ho: "somjaw", hi: "समझना", kind: "verbs" },
  { en: "open", ho: "ota:", hi: "खोलना", kind: "verbs" },
  { en: "close", ho: "handed", hi: "बंद करना", kind: "verbs" },
  { en: "help", ho: "denga", hi: "मदद करना", kind: "verbs" },
  { en: "work", ho: "paiti:", hi: "काम करना", kind: "verbs" },
  { en: "do", ho: "rika, chika", hi: "करना", kind: "verbs" },
  { en: "make", ho: "bai", hi: "बनाना", kind: "verbs" },
  { en: "come in", ho: "bolo", hi: "अंदर आना", kind: "verbs" },
  { en: "go out", ho: "ō:l", hi: "बाहर जाना", kind: "verbs" },
  { en: "jump", ho: "ui:", hi: "कूदना", kind: "verbs" },
  { en: "wash, bathe", ho: "ora", hi: "नहाना/धोना", kind: "verbs" },

  // ── adjectives ──
  { en: "good", ho: "bugi, bugin", hi: "अच्छा", kind: "adjectives" },
  { en: "bad", ho: "edka", hi: "बुरा", kind: "adjectives" },
  { en: "big", ho: "marań", hi: "बड़ा", kind: "adjectives" },
  { en: "small", ho: "huriń", hi: "छोटा", kind: "adjectives" },
  { en: "long", ho: "jiliń", hi: "लंबा", kind: "adjectives" },
  { en: "new", ho: "nama", hi: "नया", kind: "adjectives" },
  { en: "old", ho: "papari", hi: "पुराना", kind: "adjectives" },
  { en: "hot", ho: "lolo, jete", hi: "गरम", kind: "adjectives" },
  { en: "cold", ho: "rabań", hi: "ठंडा", kind: "adjectives" },
  { en: "wet", ho: "lum", hi: "गीला", kind: "adjectives" },
  { en: "dry", ho: "hayed, rō", hi: "सूखा", kind: "adjectives" },
  { en: "bitter", ho: "heben", hi: "कड़वा", kind: "adjectives" },
  { en: "beautiful", ho: "chēra, moe:", hi: "सुंदर", kind: "adjectives" },
  { en: "sick", ho: "hasu", hi: "बीमार", kind: "adjectives" },
  { en: "tall, high", ho: "salangi, chetan", hi: "ऊँचा", kind: "adjectives" },

  // ── home & village ──
  { en: "village", ho: "hatu", hi: "गाँव", kind: "home" },
  { en: "house", ho: "owa:", hi: "घर", kind: "home" },
  { en: "door", ho: "silpiń, duwar", hi: "दरवाज़ा", kind: "home" },
  { en: "window", ho: "kiriki", hi: "खिड़की", kind: "home" },
  { en: "road", ho: "hora", hi: "रास्ता", kind: "home" },
  { en: "market", ho: "hāt, hāto", hi: "बाज़ार", kind: "home" },
  { en: "garden", ho: "bakai, bagan", hi: "बगीचा", kind: "home" },
  { en: "field", ho: "pī, ote", hi: "खेत", kind: "home" },
  { en: "well", ho: "sūd, kuwã", hi: "कुआँ", kind: "home" },
  { en: "money", ho: "poysa, taka", hi: "पैसा", kind: "home" },
  { en: "mat", ho: "jati", hi: "चटाई", kind: "home" },
  { en: "bell", ho: "ganta", hi: "घंटी", kind: "home" },
];

export const HO_KINDS: Array<{ value: string; label: string }> = [
  { value: "all", label: "सभी (all)" },
  { value: "school", label: "स्कूल (school)" },
  { value: "nature", label: "प्रकृति (nature)" },
  { value: "food", label: "खाना (food)" },
  { value: "people", label: "लोग (people)" },
  { value: "animals", label: "जानवर (animals)" },
  { value: "body", label: "शरीर (body)" },
  { value: "colors", label: "रंग (colors)" },
  { value: "numbers", label: "संख्या (numbers)" },
  { value: "verbs", label: "क्रिया (verbs)" },
  { value: "adjectives", label: "गुण (adjectives)" },
  { value: "home", label: "घर-गाँव (home)" },
];

export function searchHo(q: string, kind: string): HoEntry[] {
  const query = q.trim().toLowerCase();
  return HO_DICTIONARY.filter((e) => {
    if (kind !== "all" && e.kind !== kind) return false;
    if (!query) return true;
    return (
      e.en.toLowerCase().includes(query) ||
      e.ho.toLowerCase().includes(query) ||
      e.hi.includes(query)
    );
  });
}
