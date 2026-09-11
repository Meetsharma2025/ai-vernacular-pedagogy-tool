// ─────────────────────────────────────────────────────────────────────────────
// GyanSetu — centralized language registry.
// Every language is a module: script, TTS voice, native name. New languages
// are added here without touching the core platform (modular architecture).
// ─────────────────────────────────────────────────────────────────────────────

export type LanguageCode = "hi" | "en" | "sat" | "hoc" | "mai" | "unr";

export type ScriptKind = "devanagari" | "latin";

export interface LanguageDef {
  code: LanguageCode;
  name: string; // English name
  nativeName: string; // native label shown in the UI
  script: ScriptKind;
  ttsLang: string; // BCP-47 tag used for browser speechSynthesis
  ttsNote?: string;
  family: string; // language family / region
}

export const LANGUAGES: Record<LanguageCode, LanguageDef> = {
  hi: {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    script: "devanagari",
    ttsLang: "hi-IN",
    family: "Indo-Aryan",
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    script: "latin",
    ttsLang: "en-IN",
    family: "Indo-European",
  },
  sat: {
    code: "sat",
    name: "Santhali",
    nativeName: "संथाली / ᱥᱟᱱᱛᱟᱲ",
    script: "devanagari",
    ttsLang: "hi-IN", // browsers lack sat voices; nearest available voice used
    ttsNote: "TTS uses the nearest available voice (hi-IN) • Ol Chiki script supported",
    family: "Austroasiatic (Munda)",
  },
  hoc: {
    code: "hoc",
    name: "Ho",
    nativeName: "𑢹𑣉𑣉 𑣎𑣋𑣜",
    script: "devanagari",
    ttsLang: "hi-IN",
    ttsNote: "TTS uses the nearest available voice (hi-IN)",
    family: "Austroasiatic (Munda)",
  },
  mai: {
    code: "mai",
    name: "Maithili",
    nativeName: "मैथिली",
    script: "devanagari",
    ttsLang: "hi-IN",
    ttsNote: "TTS uses the nearest available voice (hi-IN)",
    family: "Indo-Aryan (Bihari)",
  },
  unr: {
    code: "unr",
    name: "Mundari",
    nativeName: "मुण्डारी",
    script: "devanagari",
    ttsLang: "hi-IN",
    ttsNote: "TTS uses the nearest available voice (hi-IN)",
    family: "Austroasiatic (Munda)",
  },
};

export const LANGUAGE_LIST: LanguageDef[] = Object.values(LANGUAGES);

export function isLanguageCode(code: unknown): code is LanguageCode {
  return typeof code === "string" && code in LANGUAGES;
}

export function getLanguage(code: unknown): LanguageDef {
  return isLanguageCode(code) ? LANGUAGES[code] : LANGUAGES.hi;
}

/**
 * Strict language instruction used inside every Nemotron prompt.
 * This is the fix for "mixed Hindi + target language" output: the model is
 * told exactly which language, which script, and that mixing is forbidden.
 */
export function languageRule(lang: LanguageCode): string {
  const def = getLanguage(lang);
  if (def.script === "devanagari") {
    return [
      `LANGUAGE RULE (highest priority):`,
      `- Write 100% of your answer in ${def.name} (${def.nativeName}).`,
      `- Use the Devanagari script for ${def.name}, which is the standard school script for this language in Jharkhand.`,
      `- Do NOT mix Hindi words into the ${def.name} text.`,
      `- Do NOT write any English words or phrases unless the curriculum requires an English proper noun.`,
      `- If a ${def.name} term does not exist, use the natural ${def.name} phrasing used in schools rather than inserting Hindi.`,
    ].join("\n");
  }
  return [
    `LANGUAGE RULE (highest priority):`,
    `- Write 100% of your answer in English.`,
    `- Do NOT mix Hindi (Devanagari) words or sentences into the English text.`,
    `- Simple, short sentences appropriate for primary-school children.`,
  ].join("\n");
}

/** Script purity analysis used by the server-side output validator. */
export function analyzeScript(text: string): {
  devanagari: number;
  latin: number;
  other: number;
  total: number;
} {
  let devanagari = 0;
  let latin = 0;
  let other = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp >= 0x0900 && cp <= 0x097f) devanagari++;
    else if (
      (cp >= 0x0041 && cp <= 0x005a) ||
      (cp >= 0x0061 && cp <= 0x007a)
    )
      latin++;
    else if (!/\s/.test(ch)) other++;
  }
  return { devanagari, latin, other, total: text.length };
}

/**
 * Returns how "pure" the text is for the desired script (0..1).
 * A purity below 0.75 triggers a server-side repair retry.
 */
export function scriptPurity(text: string, script: ScriptKind): number {
  const counts = analyzeScript(text);
  const letters = counts.devanagari + counts.latin;
  if (letters === 0) return 1;
  return script === "devanagari"
    ? counts.devanagari / letters
    : counts.latin / letters;
}

/** Simple Devanagari → Latin transliteration used by the offline fallback. */
const TRANSLIT: Array<[string, string]> = [
  ["ज्ञ", "gya"], ["क्ष", "ksh"], ["श्र", "shra"], ["त्र", "tra"],
  ["क्र", "kra"], ["प्र", "pra"],
  ["ा", "aa"], ["ि", "i"], ["ी", "ee"], ["ु", "u"], ["ू", "oo"],
  ["े", "e"], ["ै", "ai"], ["ो", "o"], ["ौ", "au"], ["ृ", "ri"],
  ["ं", "n"], ["ँ", "n"], ["ः", "h"], ["्", ""],
  ["अ", "a"], ["आ", "aa"], ["इ", "i"], ["ई", "ee"], ["उ", "u"],
  ["ऊ", "oo"], ["ऋ", "ri"], ["ए", "e"], ["ऐ", "ai"], ["ओ", "o"], ["औ", "au"],
  ["क", "k"], ["ख", "kh"], ["ग", "g"], ["घ", "gh"], ["ङ", "ng"],
  ["च", "ch"], ["छ", "chh"], ["ज", "j"], ["झ", "jh"], ["ञ", "ny"],
  ["ट", "t"], ["ठ", "th"], ["ड", "d"], ["ढ", "dh"], ["ण", "n"],
  ["त", "t"], ["थ", "th"], ["द", "d"], ["ध", "dh"], ["न", "n"],
  ["प", "p"], ["फ", "ph"], ["ब", "b"], ["भ", "bh"], ["म", "m"],
  ["य", "y"], ["र", "r"], ["ल", "l"], ["व", "v"], ["श", "sh"],
  ["ष", "sh"], ["स", "s"], ["ह", "h"],
];

export function transliterate(devText: string): string {
  let out = devText;
  for (const [from, to] of TRANSLIT) out = out.split(from).join(to);
  return out.replace(/\s+/g, " ").trim();
}

export const SUPPORTED_LANGUAGE_COUNT = 26; // modular packs: 6 demonstrated + 20 roadmap
