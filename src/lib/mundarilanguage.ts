// ─────────────────────────────────────────────────────────────────────────────
// Mundari-English Dictionary — curated from
// "Mundari-English Dictionary", Enike Amina Wani, Martin Lomu Goke with
// Tim Stirtz, 2013, Mundari Translation and Literacy Project / SIL-South Sudan.
//
// Entries ground Nemotron with authentic Mundari words (Teacher → Nemotron →
// Student pipeline) and power the offline Mundari reference tab in the
// Dictionary. (Note: SIL Mundari is a sister variety of Jharkhand Mundari;
// our school pack continues to use its own Devanagari forms.)
// ─────────────────────────────────────────────────────────────────────────────

export interface MundariEntry {
  en: string;
  mu: string;
  pos: string;
  hi: string;
  kind: string;
}

export const MUNDARI_DICTIONARY: MundariEntry[] = [
  // ── school ──
  { en: "book", mu: "bük", pos: "n", hi: "किताब", kind: "school" },
  { en: "paper", mu: "waraga", pos: "n", hi: "कागज़", kind: "school" },
  { en: "word", mu: "jame", pos: "n", hi: "शब्द", kind: "school" },
  { en: "talk, say, tell", mu: "jam", pos: "v", hi: "बोलना, कहना", kind: "school" },
  { en: "know, think", mu: "den", pos: "v", hi: "जानना, सोचना", kind: "school" },
  { en: "understand, know", mu: "kür", pos: "v", hi: "समझना, जानना", kind: "school" },
  { en: "study", mu: "jujumbu", pos: "v", hi: "पढ़ाई करना", kind: "school" },
  { en: "learn", mu: "todïnö", pos: "v", hi: "सीखना", kind: "school" },
  { en: "teach", mu: "todïn", pos: "v", hi: "पढ़ाना", kind: "school" },
  { en: "teacher", mu: "katodïnönït", pos: "vn.actr", hi: "शिक्षक", kind: "school" },
  { en: "student, disciple", mu: "kajujumanit", pos: "vn.actr", hi: "विद्यार्थी", kind: "school" },
  { en: "see, look", mu: "met", pos: "v", hi: "देखना", kind: "school" },
  { en: "hear, listen", mu: "yïŋ", pos: "v", hi: "सुनना", kind: "school" },
  { en: "ask", mu: "pi", pos: "v", hi: "पूछना", kind: "school" },
  { en: "reply, answer", mu: "nyop", pos: "v", hi: "उत्तर देना", kind: "school" },
  { en: "count, read", mu: "ken", pos: "v", hi: "गिनना, पढ़ना", kind: "school" },
  { en: "draw, write", mu: "wür", pos: "v", hi: "लिखना, खींचना", kind: "school" },
  { en: "story", mu: "doꞌde", pos: "n", hi: "कहानी", kind: "school" },
  { en: "song", mu: "koŋe", pos: "n", hi: "गीत", kind: "school" },
  { en: "sing", mu: "yo", pos: "v", hi: "गाना", kind: "school" },
  { en: "news", mu: "loŋe", pos: "n", hi: "समाचार", kind: "school" },
  { en: "thought, mind", mu: "yöwün", pos: "n", hi: "विचार", kind: "school" },
  { en: "letter (alphabet)", mu: "manini", pos: "n", hi: "अक्षर", kind: "school" },
  { en: "meaning, explanation", mu: "nyökët", pos: "vn", hi: "अर्थ, समझ", kind: "school" },

  // ── nature ──
  { en: "water", mu: "coŋ", pos: "n.pl", hi: "पानी", kind: "nature" },
  { en: "rain", mu: "küdü", pos: "n", hi: "बारिश", kind: "nature" },
  { en: "cloud, sky", mu: "düꞌdë", pos: "n", hi: "बादल, आकाश", kind: "nature" },
  { en: "sun", mu: "koloŋ", pos: "n", hi: "सूरज", kind: "nature" },
  { en: "moon, month", mu: "yapa", pos: "n", hi: "चाँद, महीना", kind: "nature" },
  { en: "star", mu: "ceranco", pos: "n", hi: "तारा", kind: "nature" },
  { en: "fire", mu: "kimaŋ", pos: "n", hi: "आग", kind: "nature" },
  { en: "earth, land", mu: "kak", pos: "n", hi: "धरती, ज़मीन", kind: "nature" },
  { en: "river", mu: "kare", pos: "n", hi: "नदी", kind: "nature" },
  { en: "forest", mu: "waka", pos: "n", hi: "जंगल", kind: "nature" },
  { en: "mountain", mu: "mere", pos: "n", hi: "पहाड़", kind: "nature" },
  { en: "field, garden", mu: "manta", pos: "n", hi: "खेत, बगीचा", kind: "nature" },
  { en: "field", mu: "tokot", pos: "n", hi: "खेत", kind: "nature" },
  { en: "soil", mu: "lïpö", pos: "n", hi: "मिट्टी", kind: "nature" },
  { en: "sand", mu: "kürök", pos: "n.pl", hi: "रेत", kind: "nature" },
  { en: "stone", mu: "ŋürüpï", pos: "n", hi: "पत्थर", kind: "nature" },
  { en: "tree", mu: "dïnï", pos: "n", hi: "पेड़", kind: "nature" },
  { en: "leaf", mu: "koropoco", pos: "n", hi: "पत्ता", kind: "nature" },
  { en: "flower", mu: "kötürönco", pos: "n", hi: "फूल", kind: "nature" },
  { en: "seed", mu: "nyomotco", pos: "n", hi: "बीज", kind: "nature" },
  { en: "root", mu: "mürülöco", pos: "n", hi: "जड़", kind: "nature" },
  { en: "day", mu: "aparan", pos: "n", hi: "दिन", kind: "nature" },
  { en: "night", mu: "atiaŋ", pos: "n", hi: "रात", kind: "nature" },
  { en: "year", mu: "kiŋa", pos: "n", hi: "साल", kind: "nature" },
  { en: "time, season", mu: "diŋit", pos: "n", hi: "समय, मौसम", kind: "nature" },
  { en: "rainy season", mu: "jaꞌe", pos: "n", hi: "बरसात", kind: "nature" },
  { en: "dry season", mu: "meliŋ", pos: "n", hi: "सूखा मौसम", kind: "nature" },
  { en: "wind", mu: "gümöt", pos: "n", hi: "हवा", kind: "nature" },
  { en: "rain (verb)", mu: "jön", pos: "v", hi: "बारिश होना", kind: "nature" },
  { en: "rainbow", mu: "görïgörï", pos: "n", hi: "इंद्रधनुष", kind: "nature" },
  { en: "today", mu: "loloŋ", pos: "mod", hi: "आज", kind: "nature" },
  { en: "tomorrow", mu: "kuwaran", pos: "mod", hi: "कल (आने वाला)", kind: "nature" },
  { en: "yesterday", mu: "kara", pos: "mod", hi: "कल (बीता)", kind: "nature" },
  { en: "evening", mu: "kuriri", pos: "mod", hi: "शाम", kind: "nature" },

  // ── food ──
  { en: "eat", mu: "nyö", pos: "v", hi: "खाना", kind: "food" },
  { en: "drink", mu: "möt", pos: "v", hi: "पीना", kind: "food" },
  { en: "food, crops", mu: "nyürüt", pos: "n", hi: "भोजन", kind: "food" },
  { en: "meat, flesh", mu: "lokore", pos: "n", hi: "मांस", kind: "food" },
  { en: "milk", mu: "le", pos: "n.pl", hi: "दूध", kind: "food" },
  { en: "egg", mu: "tolokco", pos: "n", hi: "अंडा", kind: "food" },
  { en: "salt", mu: "alaŋ", pos: "n", hi: "नमक", kind: "food" },
  { en: "bread", mu: "kuꞌdat", pos: "n", hi: "रोटी", kind: "food" },
  { en: "grain", mu: "mïk", pos: "n.pl", hi: "अनाज", kind: "food" },
  { en: "be hungry", mu: "mogora", pos: "v", hi: "भूखा होना", kind: "food" },
  { en: "sweet", mu: "iꞌiny", pos: "mod", hi: "मीठा", kind: "food" },
  { en: "bitter", mu: "pacacaŋ", pos: "mod", hi: "कड़वा", kind: "food" },
  { en: "oil", mu: "welet", pos: "n", hi: "तेल", kind: "food" },
  { en: "fish", mu: "kömörï", pos: "n", hi: "मछली", kind: "food" },

  // ── people ──
  { en: "person", mu: "ŋuri", pos: "n", hi: "इंसान", kind: "people" },
  { en: "child", mu: "ŋiro", pos: "n", hi: "बच्चा", kind: "people" },
  { en: "baby", mu: "lure", pos: "n", hi: "शिशु", kind: "people" },
  { en: "woman", mu: "küöndïö", pos: "n", hi: "औरत", kind: "people" },
  { en: "wife", mu: "waria", pos: "n", hi: "पत्नी", kind: "people" },
  { en: "husband", mu: "lalet", pos: "n", hi: "पति", kind: "people" },
  { en: "father", mu: "aba", pos: "n", hi: "पिता", kind: "people" },
  { en: "mother", mu: "ŋore", pos: "n", hi: "माँ", kind: "people" },
  { en: "brother, sister", mu: "ŋer", pos: "n", hi: "भाई-बहन", kind: "people" },
  { en: "friend", mu: "ju", pos: "n", hi: "दोस्त", kind: "people" },
  { en: "enemy", mu: "merokco", pos: "n", hi: "दुश्मन", kind: "people" },
  { en: "chief, king, lord", mu: "mar", pos: "n", hi: "राजा", kind: "people" },
  { en: "priest", mu: "kowane", pos: "n", hi: "पुजारी", kind: "people" },
  { en: "doctor", mu: "katopotanit", pos: "vn.actr", hi: "डॉक्टर", kind: "people" },
  { en: "farmer", mu: "kakurunit", pos: "vn.actr", hi: "किसान", kind: "people" },
  { en: "God", mu: "Ŋün", pos: "n", hi: "भगवान", kind: "people" },

  // ── animals ──
  { en: "cow", mu: "kireŋ", pos: "n", hi: "गाय", kind: "animals" },
  { en: "goat", mu: "kine", pos: "n", hi: "बकरी", kind: "animals" },
  { en: "sheep", mu: "köbïlïco", pos: "n", hi: "भेड़", kind: "animals" },
  { en: "dog", mu: "ꞌdioŋ", pos: "n", hi: "कुत्ता", kind: "animals" },
  { en: "cat", mu: "gürëny", pos: "n", hi: "बिल्ली", kind: "animals" },
  { en: "elephant", mu: "tome", pos: "n", hi: "हाथी", kind: "animals" },
  { en: "lion", mu: "mïrü", pos: "n", hi: "शेर", kind: "animals" },
  { en: "fox", mu: "liŋgo", pos: "n", hi: "लोमड़ी", kind: "animals" },
  { en: "snake", mu: "münü", pos: "n", hi: "साँप", kind: "animals" },
  { en: "bird", mu: "kïnyjïrï", pos: "n", hi: "पक्षी", kind: "animals" },
  { en: "chicken", mu: "curi", pos: "n", hi: "मुर्गी", kind: "animals" },
  { en: "dove, pigeon", mu: "gürë", pos: "n", hi: "कबूतर", kind: "animals" },
  { en: "raven", mu: "gue", pos: "n", hi: "कौआ", kind: "animals" },
  { en: "mosquito", mu: "mürï", pos: "n", hi: "मच्छर", kind: "animals" },
  { en: "mouse", mu: "juju", pos: "n", hi: "चूहा", kind: "animals" },
  { en: "hare, rabbit", mu: "likiro", pos: "n", hi: "खरगोश", kind: "animals" },
  { en: "hyena", mu: "ŋöwüŋ", pos: "n", hi: "लकड़बग्घा", kind: "animals" },
  { en: "hippo", mu: "yaru", pos: "n", hi: "दरियाई घोड़ा", kind: "animals" },
  { en: "warthog, pig", mu: "würï", pos: "n", hi: "सूअर", kind: "animals" },

  // ── body ──
  { en: "head", mu: "küë", pos: "n", hi: "सिर", kind: "body" },
  { en: "hair", mu: "pïrï", pos: "n", hi: "बाल", kind: "body" },
  { en: "eye", mu: "kue", pos: "n", hi: "आँख", kind: "body" },
  { en: "ear", mu: "cüöt", pos: "n", hi: "कान", kind: "body" },
  { en: "nose", mu: "kümë", pos: "n", hi: "नाक", kind: "body" },
  { en: "mouth", mu: "kuruk", pos: "n", hi: "मुँह", kind: "body" },
  { en: "tooth", mu: "kele", pos: "n", hi: "दाँत", kind: "body" },
  { en: "tongue", mu: "ŋeꞌdep", pos: "n", hi: "जीभ", kind: "body" },
  { en: "hand", mu: "köyïn", pos: "n", hi: "हाथ", kind: "body" },
  { en: "finger", mu: "morïnyco", pos: "n", hi: "उँगली", kind: "body" },
  { en: "foot", mu: "mot", pos: "n", hi: "पैर", kind: "body" },
  { en: "knee", mu: "kuŋu", pos: "n", hi: "घुटना", kind: "body" },
  { en: "bone", mu: "kuyuco", pos: "n", hi: "हड्डी", kind: "body" },
  { en: "blood", mu: "rima", pos: "n.pl", hi: "खून", kind: "body" },
  { en: "heart", mu: "yümü", pos: "n", hi: "दिल", kind: "body" },
  { en: "body, self", mu: "muny", pos: "n", hi: "शरीर", kind: "body" },
  { en: "neck", mu: "mürüt", pos: "n", hi: "गरदन", kind: "body" },

  // ── colors ──
  { en: "white", mu: "pe", pos: "mod", hi: "सफ़ेद", kind: "colors" },
  { en: "red, brown", mu: "lutok", pos: "mod.m", hi: "लाल", kind: "colors" },
  { en: "green", mu: "ludon", pos: "adj.m", hi: "हरा", kind: "colors" },
  { en: "black", mu: "lürüö", pos: "adj.m", hi: "काला", kind: "colors" },

  // ── numbers ──
  { en: "one", mu: "gerok", pos: "num", hi: "एक", kind: "numbers" },
  { en: "two", mu: "marek", pos: "num", hi: "दो", kind: "numbers" },
  { en: "three", mu: "mucala", pos: "num", hi: "तीन", kind: "numbers" },
  { en: "four", mu: "umon", pos: "num", hi: "चार", kind: "numbers" },
  { en: "five", mu: "monat", pos: "num", hi: "पाँच", kind: "numbers" },
  { en: "six", mu: "buker", pos: "num", hi: "छह", kind: "numbers" },
  { en: "seven", mu: "burio", pos: "num", hi: "सात", kind: "numbers" },
  { en: "eight", mu: "büdök", pos: "num", hi: "आठ", kind: "numbers" },
  { en: "nine", mu: "gïrïpük", pos: "num", hi: "नौ", kind: "numbers" },
  { en: "ten", mu: "pök", pos: "num", hi: "दस", kind: "numbers" },
  { en: "hundred", mu: "gine", pos: "num", hi: "सौ", kind: "numbers" },
  { en: "thousand", mu: "pukino", pos: "num", hi: "हज़ार", kind: "numbers" },

  // ── verbs ──
  { en: "sit, stay", mu: "caka", pos: "v", hi: "बैठना", kind: "verbs" },
  { en: "stand", mu: "jün", pos: "v", hi: "खड़ा होना", kind: "verbs" },
  { en: "sleep", mu: "doꞌoro", pos: "v", hi: "सोना", kind: "verbs" },
  { en: "run", mu: "dök", pos: "v", hi: "दौड़ना", kind: "verbs" },
  { en: "go", mu: "giti, guan", pos: "v", hi: "जाना", kind: "verbs" },
  { en: "come", mu: "po", pos: "v", hi: "आना", kind: "verbs" },
  { en: "arrive", mu: "wok", pos: "v", hi: "पहुँचना", kind: "verbs" },
  { en: "give", mu: "gony", pos: "v", hi: "देना", kind: "verbs" },
  { en: "bring", mu: "ŋany", pos: "v", hi: "लाना", kind: "verbs" },
  { en: "buy", mu: "bör", pos: "v", hi: "खरीदना", kind: "verbs" },
  { en: "sell", mu: "döjü", pos: "v", hi: "बेचना", kind: "verbs" },
  { en: "work", mu: "kit", pos: "v", hi: "काम करना", kind: "verbs" },
  { en: "make, create", mu: "be", pos: "v", hi: "बनाना", kind: "verbs" },
  { en: "do", mu: "kon", pos: "v", hi: "करना", kind: "verbs" },
  { en: "laugh", mu: "kueni", pos: "v", hi: "हँसना", kind: "verbs" },
  { en: "be happy", mu: "nyala", pos: "v", hi: "खुश होना", kind: "verbs" },
  { en: "love, want", mu: "nyar", pos: "v", hi: "चाहना, प्यार", kind: "verbs" },
  { en: "open", mu: "ŋa", pos: "v", hi: "खोलना", kind: "verbs" },
  { en: "close, lock", mu: "kin", pos: "v", hi: "बंद करना", kind: "verbs" },
  { en: "jump, dance", mu: "boja", pos: "v", hi: "कूदना, नाचना", kind: "verbs" },
  { en: "wash, bathe, swim", mu: "küö", pos: "v", hi: "नहाना", kind: "verbs" },
  { en: "help, lend, give", mu: "ŋara", pos: "v", hi: "मदद करना", kind: "verbs" },
  { en: "answer, respond", mu: "wac", pos: "v", hi: "जवाब देना", kind: "verbs" },

  // ── adjectives ──
  { en: "good", mu: "luke", pos: "mod", hi: "अच्छा", kind: "adjectives" },
  { en: "bad", mu: "luron", pos: "adj.m", hi: "बुरा", kind: "adjectives" },
  { en: "big, old", mu: "ïjö", pos: "adj", hi: "बड़ा", kind: "adjectives" },
  { en: "small, thin", mu: "naꞌdit", pos: "adj.f", hi: "छोटा", kind: "adjectives" },
  { en: "far, long, tall", mu: "jo", pos: "mod", hi: "दूर, लंबा", kind: "adjectives" },
  { en: "new", mu: "lupec", pos: "mod", hi: "नया", kind: "adjectives" },
  { en: "old", mu: "luꞌeron", pos: "adj.m", hi: "पुराना", kind: "adjectives" },
  { en: "cold", mu: "likun", pos: "mod", hi: "ठंडा", kind: "adjectives" },
  { en: "hot", mu: "tape", pos: "v", hi: "गरम", kind: "adjectives" },
  { en: "beautiful", mu: "kuekuelen", pos: "mod", hi: "सुंदर", kind: "adjectives" },
  { en: "dirty", mu: "lut", pos: "mod", hi: "गंदा", kind: "adjectives" },
  { en: "dry", mu: "lukorok", pos: "adj.m", hi: "सूखा", kind: "adjectives" },
  { en: "deep", mu: "gulu", pos: "mod", hi: "गहरा", kind: "adjectives" },
  { en: "wise", mu: "lukoŋ", pos: "mod.m", hi: "बुद्धिमान", kind: "adjectives" },

  // ── home & village ──
  { en: "house", mu: "kadi", pos: "n", hi: "घर", kind: "home" },
  { en: "door", mu: "kakat", pos: "n", hi: "दरवाज़ा", kind: "home" },
  { en: "window", mu: "kulupit", pos: "n", hi: "खिड़की", kind: "home" },
  { en: "road, way", mu: "koyi", pos: "n", hi: "रास्ता", kind: "home" },
  { en: "village", mu: "jür", pos: "n", hi: "गाँव", kind: "home" },
  { en: "town", mu: "köjï", pos: "n", hi: "शहर", kind: "home" },
  { en: "money", mu: "gürütco", pos: "n", hi: "पैसा", kind: "home" },
  { en: "bed", mu: "pörï", pos: "n", hi: "बिस्तर", kind: "home" },
  { en: "lamp", mu: "lamba", pos: "n", hi: "दीया", kind: "home" },
  { en: "medicine", mu: "yini", pos: "n", hi: "दवा", kind: "home" },
  { en: "knife", mu: "wale", pos: "n", hi: "चाकू", kind: "home" },
  { en: "stick, staff", mu: "ture", pos: "n", hi: "लाठी", kind: "home" },
];

export const MUNDARI_KINDS: Array<{ value: string; label: string }> = [
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

export function searchMundari(q: string, kind: string): MundariEntry[] {
  const query = q.trim().toLowerCase();
  return MUNDARI_DICTIONARY.filter((e) => {
    if (kind !== "all" && e.kind !== kind) return false;
    if (!query) return true;
    return (
      e.en.toLowerCase().includes(query) ||
      e.mu.toLowerCase().includes(query) ||
      e.hi.includes(query)
    );
  });
}
