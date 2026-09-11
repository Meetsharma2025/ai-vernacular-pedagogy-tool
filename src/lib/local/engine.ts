// ─────────────────────────────────────────────────────────────────────────────
// GyanSetu OFFLINE engine — deterministic local pedagogy used when the user
// selects 📴 OFFLINE mode (or when the server/Nemotron is unreachable).
//
// Layered fallback chain (per SIH design): glossary translation → word-bank →
// transliteration. Outputs are ALWAYS labeled as local/offline — the app
// never pretends this is Nemotron.
// ─────────────────────────────────────────────────────────────────────────────
import {
  CURRICULUM,
  DICTIONARY,
  getLesson,
  type DictionaryEntry,
  type LessonSeed,
} from "@/lib/curriculum";
import {
  getLanguage,
  transliterate,
  type LanguageCode,
} from "@/lib/languages";
import type {
  AiMeta,
  AskResult,
  DictionaryResult,
  FlashcardsResult,
  RecommendResult,
  SearchResult,
  TranslateResult,
  WorksheetQuestion,
  WorksheetResult,
  QuizResult,
} from "@/lib/ai/types";

const localMeta = (latencyMs = 5, note?: string): AiMeta => ({
  engine: "local",
  provider: "none",
  model: "local-pedagogy-engine",
  latencyMs,
  mode: "offline",
  note,
});

// ── Tokenization + keyword matching (offline search intelligence) ───────────

const STOPWORDS = new Set([
  "क्या", "कैसे", "क्यों", "कौन", "है", "हैं", "था", "थी", "को", "का", "की",
  "के", "में", "से", "और", "यह", "वह", "मुझे", "हमें", "एक", "the", "a",
  "an", "what", "how", "why", "is", "are", "of", "to", "in", "for", "do",
  "does", "means", "mean", "matlab", "मतलब", "बारे", "पढ़ना", "पढ़",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[?,।.!"']/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

function lessonScore(lesson: LessonSeed, tokens: string[]): number {
  if (!tokens.length) return 0;
  let score = 0;
  const hay = [
    ...lesson.keywords.map((k) => k.toLowerCase()),
    lesson.titleHi.toLowerCase(),
    lesson.titleEn.toLowerCase(),
    lesson.concept.toLowerCase(),
  ].join(" ");
  for (const t of tokens) {
    if (hay.includes(t)) score += 2;
    else {
      for (const k of lesson.keywords) {
        if (k.toLowerCase().includes(t) && t.length >= 3) { score += 1; break; }
      }
    }
  }
  return score;
}

export function offlineSearch(
  query: string,
  classFilter?: number,
): { lesson: LessonSeed; score: number } | null {
  const tokens = tokenize(query);
  const pool = classFilter
    ? CURRICULUM.filter((l) => l.class === classFilter)
    : CURRICULUM;
  const scored = pool
    .map((lesson) => ({ lesson, score: lessonScore(lesson, tokens) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0] ?? null;
}

// ── Offline lesson Q&A (grounded in synced lesson content) ──────────────────

export function offlineAnswer(
  question: string,
  language: LanguageCode,
  grade?: number,
): AskResult {
  const start = Date.now();
  const match = offlineSearch(question, grade);
  const langDef = getLanguage(language);

  if (match) {
    const l = match.lesson;
    const inHindi = language === "hi";
    const body =
      language === "en" ? l.explanationEn : l.explanationHi;
    const example =
      language === "en" ? l.examplesEn[0] : l.examplesHi[0];
    const langLabel = inHindi ? "हिन्दी" : langDef.name;
    return {
      ...localMeta(
        Date.now() - start,
        `Offline answer from synced lesson "${l.titleHi}" — full ${langLabel} explanation needs online AI.`,
      ),
      intent: "concept_question",
      concept: l.concept,
      answer: body.split("।")[0] + "।",
      explanation: body,
      steps: [],
      localExample: example ?? "",
      takeaway: l.objective,
      followUp: l.sampleQuiz[0]?.question ?? "",
      confidence: 0.8,
    };
  }

  return {
    ...localMeta(
      Date.now() - start,
      "This question does not match any synced lesson — connect online for AI answers.",
    ),
    intent: "outside_scope",
    concept: "",
    answer:
      language === "en"
        ? "I could not find this question in my offline lesson pack. Switch to Online AI mode or choose a synced lesson."
        : "यह प्रश्न मेरे ऑफ़लाइन पाठ-पैक में नहीं मिला। ऑनलाइन AI मोड चुनें या कोई पाठ खोलें।",
    explanation: "",
    steps: [],
    localExample: "",
    takeaway: "",
    followUp: "",
    confidence: 0.1,
  };
}

// ── Offline translation: glossary → word-bank → transliteration ─────────────

function glossaryTranslate(text: string, toLang: LanguageCode): string {
  if (toLang === "hi") return text;
  if (toLang === "en") return "(offline: English translation unavailable — switch to Online AI)";
  let out = text;
  // Longest-match-first glossary replacement over the Devanagari text.
  const entries = DICTIONARY.filter((d) => {
    const val = d[toLang as keyof DictionaryEntry];
    return typeof val === "string" && val.length > 0;
  }).sort((a, b) => b.hi.length - a.hi.length);

  for (const e of entries) {
    const to = e[toLang as keyof DictionaryEntry] as string;
    out = out.split(e.hi).join(to);
  }
  return out;
}

export function offlineTranslate(
  text: string,
  fromLang: LanguageCode,
  toLang: LanguageCode,
): TranslateResult {
  const start = Date.now();
  if (fromLang === toLang) {
    return {
      ...localMeta(Date.now() - start),
      translation: text,
      adaptation: text,
      example: "",
      note: "Same language selected — no translation needed.",
    };
  }
  const langDef = getLanguage(toLang);
  const translation = glossaryTranslate(text, toLang);
  return {
    ...localMeta(
      Date.now() - start,
      `Offline word-bank translation to ${langDef.name} (glossary + Devanagari script). Online AI gives full pedagogical translation.`,
    ),
    translation,
    adaptation: translation,
    example: "",
    note: `📴 Offline engine: glossary/word-bank translation into ${langDef.name} — prototype quality, community validation pending.`,
  };
}

// ── Offline dictionary ───────────────────────────────────────────────────────

function findEntry(query: string): DictionaryEntry | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return DICTIONARY.find(
    (d) =>
      d.hi.toLowerCase() === q ||
      d.en.toLowerCase() === q ||
      [d.sat, d.hoc, d.unr].some((v) => v && v.toLowerCase() === q),
  );
}

function fuzzyEntry(query: string): DictionaryEntry | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return DICTIONARY.find((d) => d.hi.includes(q) || q.includes(d.hi));
}

export function offlineDictionary(query: string, language: LanguageCode): DictionaryResult | null {
  const start = Date.now();
  const exact = findEntry(query);
  const entry = exact ?? fuzzyEntry(query);
  if (!entry) return null;

  const langDef = getLanguage(language);
  const tribal = entry[language as keyof DictionaryEntry];
  const word =
    typeof tribal === "string" && tribal.length > 0
      ? tribal
      : language === "en"
        ? entry.en
        : entry.hi;

  const meaning =
    language === "en"
      ? `"${entry.hi}" means ${entry.en}.`
      : language === "hi"
        ? `"${entry.hi}" का अर्थ है — ${entry.en}।`
        : `"${entry.hi}" (${entry.en}) को ${langDef.name} में "${word}" कहते हैं।`;

  return {
    ...localMeta(
      Date.now() - start,
      exact
        ? "Exact offline dictionary entry."
        : "Fuzzy offline match — verify with online AI for contextual meaning.",
    ),
    word,
    meaning,
    translation: word,
    example: "",
    source: exact ? "exact" : "offline",
    contextual: !exact,
  };
}

// ── Offline worksheet / quiz (bundled sample content) ───────────────────────

export function offlineWorksheet(
  lesson: LessonSeed,
  language: LanguageCode,
  difficulty: "easy" | "medium" | "hard",
): WorksheetResult {
  const start = Date.now();
  const isEn = language === "en";
  const title = isEn ? `${lesson.titleEn} — Worksheet` : `${lesson.titleHi} — कार्यपत्रक`;
  const questions: WorksheetQuestion[] = lesson.sampleWorksheet.map((q) => ({
    type: q.options?.length ? "mcq" : "short",
    question: isEn ? `(from synced pack) ${q.question}` : q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation ?? "",
  }));
  return {
    ...localMeta(
      Date.now() - start,
      `Offline worksheet from the synced "${lesson.titleHi}" pack (difficulty: ${difficulty}). Online AI generates fresh, language-adapted worksheets.`,
    ),
    title,
    language: getLanguage(language).name,
    learningObjective: isEn ? "(synced pack)" : lesson.objective,
    instructions: isEn
      ? "Read each question carefully and write the answer."
      : "हर प्रश्न ध्यान से पढ़ो और उत्तर लिखो।",
    questions,
  };
}

// ── Offline flashcards (from the synced lesson pack + dictionary) ───────────

export function offlineFlashcards(
  lesson: LessonSeed,
  language: LanguageCode,
  count: number,
): FlashcardsResult {
  const start = Date.now();
  const langDef = getLanguage(language);
  const cards = lesson.keywords.slice(0, Math.max(count, 3)).map((k) => {
    const entry = DICTIONARY.find(
      (d) => d.hi === k || d.hi.includes(k) || k.includes(d.hi),
    );
    const tribal = entry ? (entry[language as keyof DictionaryEntry] as string | undefined) : undefined;
    const word =
      typeof tribal === "string" && tribal.length > 0
        ? tribal
        : language === "en"
          ? transliterate(k)
          : k;
    const meaning =
      language === "en"
        ? `${k} — a key word of the "${lesson.titleEn}" lesson.`
        : language === "hi"
          ? `"${k}" — "${lesson.titleHi}" पाठ का मुख्य शब्द।`
          : `"${k}" को ${langDef.name} में "${word}" कहते हैं। यह "${lesson.titleHi}" पाठ का मुख्य शब्द है।`;
    return {
      concept: lesson.concept,
      word,
      meaning,
      example:
        language === "en"
          ? `(from synced pack) ${lesson.examplesEn[0] ?? ""}`
          : lesson.examplesHi[0] ?? "",
      learningObjective: lesson.objective,
    };
  });

  return {
    ...localMeta(
      Date.now() - start,
      `Offline flashcards from the synced "${lesson.titleHi}" pack + prototype dictionary. Online AI generates richer cards.`,
    ),
    title:
      language === "en"
        ? `${lesson.titleEn} — Flashcards`
        : `${lesson.titleHi} — फ़्लैशकार्ड`,
    cards,
  };
}

export function offlineQuiz(
  lesson: LessonSeed,
  language: LanguageCode,
  count: number,
): QuizResult {
  const start = Date.now();
  const isEn = language === "en";
  const pool = lesson.sampleQuiz;
  const selected = count >= pool.length ? pool : pool.slice(0, count);
  return {
    ...localMeta(
      Date.now() - start,
      `Offline quiz from the synced "${lesson.titleHi}" pack. Online AI adapts difficulty to the child's performance.`,
    ),
    title: isEn ? `${lesson.titleEn} — Quiz` : `${lesson.titleHi} — क्विज़`,
    questions: selected.map((q) => ({
      question: isEn ? `(from synced pack) ${q.question}` : q.question,
      options: q.options ?? ["", "", "", ""],
      answer: q.answer,
      explanation: q.explanation ?? "",
      difficulty: "easy" as const,
    })),
  };
}

// ── Offline adaptive recommendation (deterministic heuristic) ───────────────

export function offlineRecommend(
  progress: Array<{ lessonSlug: string; score: number; total: number }>,
  language: LanguageCode,
): RecommendResult {
  const start = Date.now();
  const isEn = language === "en";
  const known = new Map(progress.map((p) => [p.lessonSlug, p]));
  let weakest: LessonSeed | undefined;
  let weakestRatio = 1;

  for (const lesson of CURRICULUM) {
    const rec = known.get(lesson.slug);
    if (!rec) {
      weakest = lesson;
      weakestRatio = 0;
      break;
    }
    const ratio = rec.total > 0 ? rec.score / rec.total : 0;
    if (ratio < weakestRatio) {
      weakestRatio = ratio;
      weakest = lesson;
    }
  }

  const lesson = weakest ?? CURRICULUM[0];
  return {
    ...localMeta(
      Date.now() - start,
      "Offline heuristic recommendation from saved progress. Online AI adds pedagogical reasoning.",
    ),
    action: weakestRatio < 0.6 ? "remedial_practice" : "targeted_practice",
    lessonId: lesson.slug,
    reason: isEn
      ? `Practice "${lesson.titleEn}" to get better.`
      : `"${lesson.titleHi}" का अभ्यास करो, इससे समझ और मज़बूत होगी।`,
    difficulty: weakestRatio < 0.6 ? "easy" : "medium",
    message: isEn
      ? "Little by little, you will master it!"
      : "धीरे-धीरे अभ्यास करोगे तो सब आ जाएगा!",
  };
}

// ── Offline semantic search (mirrors the online op) ─────────────────────────

export function offlineSearchResult(query: string, classFilter?: number): SearchResult | null {
  const start = Date.now();
  const match = offlineSearch(query, classFilter);
  if (!match) return null;
  return {
    ...localMeta(Date.now() - start, "Offline keyword search over synced lessons."),
    queryMeaning: "",
    selectedLessonId: match.lesson.slug,
    reason: `"${match.lesson.titleHi}" matches your search (offline keyword matching).`,
    confidence: 0.7,
  };
}

export const OFFLINE_LESSON_LIST = CURRICULUM;
export { getLesson, transliterate };
