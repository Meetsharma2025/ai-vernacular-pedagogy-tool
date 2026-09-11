// ─────────────────────────────────────────────────────────────────────────────
// GyanSetu AI ORCHESTRATOR — the single server-side entry point for every
// online AI feature. Flow: real DB/curriculum context → Nemotron 3 Ultra →
// schema validation → script-purity validation (anti language-mixing) →
// validated result. Nemotron NEVER invents lesson IDs or student records.
// ─────────────────────────────────────────────────────────────────────────────
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { aiGenerations, lessons, progress } from "@/db/schema";
import { computeInputHash, type GenerationKind } from "@/lib/cache-key";
import { getNemotronConfig, callNemotron, extractJson, NemotronUnavailableError } from "./nemotron-client";
import {
  tutorPrompt,
  translatePrompt,
  searchPrompt,
  worksheetPrompt,
  quizPrompt,
  recommendPrompt,
  dictionaryPrompt,
  flashcardsPrompt,
  localizePrompt,
  studioPrompt,
  statusPrompt,
} from "./prompts";
import {
  AskSchema,
  TranslateSchema,
  SearchSchema,
  WorksheetSchema,
  QuizSchema,
  RecommendSchema,
  DictionarySchema,
  FlashcardSchema,
  LocalizeSchema,
  StudioSchema,
} from "./schemas";
import type {
  AiMeta,
  AskPayload,
  AskResult,
  CandidateLesson,
  DictionaryPayload,
  DictionaryResult,
  FlashcardsPayload,
  FlashcardsResult,
  LessonContext,
  LocalizePayload,
  LocalizeResult,
  QuizPayload,
  QuizResult,
  RecommendPayload,
  RecommendResult,
  SearchPayload,
  SearchResult,
  StatusPayload,
  StatusResult,
  StudioPayload,
  StudioResult,
  TranslatePayload,
  TranslateResult,
  WorksheetPayload,
  WorksheetResult,
} from "./types";
import { getLanguage, scriptPurity, type LanguageCode } from "@/lib/languages";
import { DICTIONARY, type DictionaryEntry } from "@/lib/curriculum";
import { OLCHIKI_DICTIONARY } from "@/lib/olchiki";
import { HO_DICTIONARY } from "@/lib/holanguage";
import { MUNDARI_DICTIONARY } from "@/lib/mundarilanguage";
import { ensureSeeded } from "@/db/seed";

// ── Helpers ──────────────────────────────────────────────────────────────────

type DbLesson = typeof lessons.$inferSelect;

function toCandidate(l: DbLesson): CandidateLesson {
  return {
    slug: l.slug,
    class: l.class,
    subject: l.subject,
    titleHi: l.titleHi,
    titleEn: l.titleEn,
    concept: l.concept,
    objective: l.objective,
    keywords: l.keywords,
  };
}

function meta(provider: "openrouter" | "nvidia", model: string, latencyMs: number): AiMeta {
  return {
    engine: "nemotron",
    provider,
    model,
    latencyMs,
    mode: "online",
  };
}

/**
 * Persists every Nemotron generation to PostgreSQL so it can later be
 * re-downloaded to devices for offline research/usage. Never blocks the
 * response; failures are logged, not shown to the user.
 */
function persistGeneration(
  kind: GenerationKind,
  input: string,
  language: string,
  payload: Record<string, unknown>,
  lessonSlug?: string | null,
): void {
  void (async () => {
    try {
      await db.insert(aiGenerations).values({
        kind,
        inputHash: computeInputHash(kind, input),
        language,
        lessonSlug: lessonSlug ?? null,
        payload,
      });
    } catch (e) {
      console.error(`[gyansetu:persist] ${kind} generation could not be stored:`, e);
    }
  })();
}

const STOPWORDS = new Set([
  "क्या", "कैसे", "क्यों", "कौन", "है", "हैं", "का", "की", "के", "में", "से",
  "और", "को", "the", "a", "an", "what", "how", "why", "is", "are", "of", "to",
  "in", "for",
]);

/** Deterministic candidate retrieval (fast, no LLM) — gives Nemotron a small,
 *  relevant curriculum subset instead of the whole database. */
async function retrieveCandidates(query: string, classFilter?: number): Promise<CandidateLesson[]> {
  await ensureSeeded();
  const rows = await db.select().from(lessons).orderBy(asc(lessons.id));
  const tokens = query
    .toLowerCase()
    .replace(/[?,।.!"']/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));

  const scored = rows
    .filter((l) => !classFilter || l.class === classFilter)
    .map((l) => {
      const hay = [l.titleHi, l.titleEn, l.concept, ...l.keywords]
        .join(" ")
        .toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (hay.includes(t)) score += 2;
        else if (l.keywords.some((k) => k.toLowerCase().includes(t) && t.length >= 3)) score += 1;
      }
      return { l, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((x) => toCandidate(x.l));
}

async function getLessonRow(slug: string): Promise<DbLesson | null> {
  await ensureSeeded();
  const rows = await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1);
  return rows[0] ?? null;
}

function lessonContextFromRow(l: DbLesson): LessonContext {
  return {
    grade: l.class,
    subject: l.subject,
    lessonTitle: `${l.titleHi} (${l.titleEn})`,
    concept: l.concept,
    objective: l.objective,
    nipunOutcome: l.nipunOutcome,
  };
}

/**
 * Authentic-vocabulary anchoring for tribal languages (sat/hoc/unr): finds
 * dictionary entries whose Hindi headword appears in the input text or the
 * retrieved lesson keywords, and hands the model the genuine tribal words so
 * it stops substituting Hindi when writing Santhali/Ho/Mundari.
 */
function buildGlossary(
  text: string,
  lang: LanguageCode,
  candidates?: CandidateLesson[],
): Array<{ hi: string; to: string }> {
  if (lang === "hi" || lang === "en") return [];
  const tokens = text
    .toLowerCase()
    .replace(/[?,।.!"'()]/g, " ")
    .split(/\s+/)
    .filter((tok) => tok.length >= 2);
  const keywordPool = (candidates ?? []).flatMap((c) => c.keywords).map((k) => k.toLowerCase());

  const out: Array<{ hi: string; to: string }> = [];
  for (const entry of DICTIONARY) {
    const to = entry[lang as keyof DictionaryEntry] as string | undefined;
    if (typeof to !== "string" || !to) continue;
    const hi = entry.hi.toLowerCase();
    const matched =
      tokens.some((tok) => hi.includes(tok) || tok.includes(hi)) ||
      keywordPool.some((k) => hi.includes(k) || k.includes(hi));
    if (matched) out.push({ hi: entry.hi, to });
    if (out.length >= 12) break;
  }

  // Santhali gets extra authentic grounding from the Ol Chiki lexicon
  // (Hansdah & Murmu, 2003) — Devanagari school form + official Ol Chiki word.
  if (lang === "sat" && out.length < 14) {
    for (const e of OLCHIKI_DICTIONARY) {
      const hi = e.hi.toLowerCase();
      const matched =
        tokens.some((tok) => hi.includes(tok) || tok.includes(hi) || e.word.toLowerCase().includes(tok)) ||
        keywordPool.some((k) => hi.includes(k) || k.includes(hi));
      if (matched) {
        const to = e.dev
          ? `${e.dev} (Ol Chiki: ${e.word})`
          : e.word;
        if (!out.some((o) => o.hi === e.hi)) out.push({ hi: e.hi, to });
      }
      if (out.length >= 14) break;
    }
  }

  // Ho gets authentic grounding from the English–Ho Vocabulary
  // (J. Deeney S.J., 1975, Xavier Ho Publications, Chaibasa).
  if (lang === "hoc" && out.length < 14) {
    for (const e of HO_DICTIONARY) {
      const en = e.en.toLowerCase();
      const hi = e.hi.toLowerCase();
      const matched =
        tokens.some((tok) => en.includes(tok) || tok.includes(en) || hi.includes(tok) || tok.includes(hi)) ||
        keywordPool.some((k) => en.includes(k) || k.includes(en) || hi.includes(k) || k.includes(hi));
      if (matched) {
        if (!out.some((o) => o.hi === e.hi)) out.push({ hi: e.hi, to: e.ho });
      }
      if (out.length >= 14) break;
    }
  }

  // Mundari gets authentic grounding from the Mundari-English Dictionary
  // (Wani & Goke with Stirtz, 2013, SIL-South Sudan).
  if (lang === "unr" && out.length < 14) {
    for (const e of MUNDARI_DICTIONARY) {
      const en = e.en.toLowerCase();
      const hi = e.hi.toLowerCase();
      const matched =
        tokens.some((tok) => en.includes(tok) || tok.includes(en) || hi.includes(tok) || tok.includes(hi)) ||
        keywordPool.some((k) => en.includes(k) || k.includes(en) || hi.includes(k) || k.includes(hi));
      if (matched) {
        if (!out.some((o) => o.hi === e.hi)) out.push({ hi: e.hi, to: e.mu });
      }
      if (out.length >= 14) break;
    }
  }
  return out;
}

/**
 * Script-purity validation — the anti language-mixing guard. If Nemotron
 * returned mixed scripts (e.g. Hindi text for an English answer), we retry
 * once with an explicit repair instruction.
 */
async function enforceLanguage(
  text: string,
  lang: LanguageCode,
  opts: Parameters<typeof callNemotron>[0],
): Promise<{ text: string; repaired: boolean }> {
  const script = getLanguage(lang).script;
  const purity = scriptPurity(text, script);
  if (purity >= 0.8 || text.trim().length < 40) return { text, repaired: false };

  // One repair pass with a strict instruction.
  try {
    const repaired = await callNemotron({
      ...opts,
      temperature: 0.2,
      messages: [
        ...opts.messages,
        {
          role: "assistant",
          content: text,
        },
        {
          role: "user",
          content: `REPAIR: Your previous answer mixed languages. Rewrite the ENTIRE answer in ${getLanguage(lang).name} ONLY (${script} script). Keep the same JSON structure. No Hindi, no English mixing.`,
        },
      ],
    });
    const purity2 = scriptPurity(repaired.text, script);
    if (purity2 > purity) return { text: repaired.text, repaired: true };
    return { text, repaired: false };
  } catch {
    return { text, repaired: false };
  }
}

// ── Status ───────────────────────────────────────────────────────────────────

let statusCache: { at: number; value: StatusResult; ttl: number } | null = null;
const STATUS_TTL = 30_000;

export async function getAiStatus(_p: StatusPayload): Promise<StatusResult> {
  if (statusCache && Date.now() - statusCache.at < statusCache.ttl) {
    return statusCache.value;
  }
  const cfg = getNemotronConfig();
  const base: StatusResult = {
    engine: "nemotron",
    provider: cfg.provider,
    model: cfg.model,
    latencyMs: 0,
    mode: "online",
    configured: cfg.configured,
    verified: false,
  };
  if (!cfg.configured) {
    base.engine = "local";
    statusCache = { at: Date.now(), value: base, ttl: STATUS_TTL };
    return base;
  }
  try {
    const res = await callNemotron({
      messages: [{ role: "system", content: statusPrompt().system }, { role: "user", content: statusPrompt().user }],
      maxTokens: 8,
      temperature: 0,
      timeoutMs: 25_000,
    });
    base.verified = true;
    base.latencyMs = res.latencyMs;
    base.provider = res.provider;
    base.model = res.model;
  } catch {
    base.verified = false;
  }
  // Failed status re-checks sooner (10s) so a transient provider burst does
  // not keep the UI saying "verification pending" for long.
  statusCache = {
    at: Date.now(),
    value: base,
    ttl: base.verified ? STATUS_TTL : 10_000,
  };
  return base;
}

// ── Ask AI (student tutor) ───────────────────────────────────────────────────

export async function runAsk(p: AskPayload): Promise<AskResult> {
  const question = p.question.trim();
  if (!question) throw new Error("Empty question");
  if (question.length > 1500) throw new Error("Question too long");

  let lessonCtx: LessonContext | undefined;
  if (p.lessonId) {
    const row = await getLessonRow(p.lessonId);
    if (row) lessonCtx = lessonContextFromRow(row);
  }
  const candidates = await retrieveCandidates(question, p.grade);

  const { system, user } = tutorPrompt({
    question,
    studentLanguage: p.studentLanguage,
    teacherLanguage: p.teacherLanguage,
    grade: p.grade,
    subject: p.subject,
    lesson: lessonCtx,
    candidates,
    glossary: buildGlossary(question, p.studentLanguage, candidates),
  });

  const opts: Parameters<typeof callNemotron>[0] = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    json: true,
    maxTokens: 900,
    temperature: 0.4,
  };

  const res = await callNemotron(opts);
  let parsed = extractJson<Record<string, unknown>>(res.text);
  if (!parsed) {
    parsed = extractJson<Record<string, unknown>>(
      (await callNemotron({
        ...opts,
        temperature: 0.2,
        messages: [
          ...opts.messages,
          { role: "user", content: "You did not return JSON. Reply with ONLY the requested JSON object now." },
        ],
      })).text,
    );
  }
  if (!parsed) throw new NemotronUnavailableError("Invalid structured response from Nemotron");

  const validated = AskSchema.parse(parsed);
  const langDef = getLanguage(p.studentLanguage);
  const cleaned = await enforceLanguage(
    [validated.answer, validated.explanation, validated.localExample, validated.takeaway, validated.followUp].join(" "),
    p.studentLanguage,
    opts,
  );
  const m = meta(res.provider, res.model, res.latencyMs);
  const result: AskResult = {
    ...m,
    quality: cleaned.repaired ? "ok" : "ok",
    note: cleaned.repaired
      ? `Language repair applied (${langDef.name} purity enforced).`
      : undefined,
    intent: validated.intent,
    concept: validated.concept,
    answer: validated.answer,
    explanation: validated.explanation,
    steps: validated.steps,
    localExample: validated.localExample,
    takeaway: validated.takeaway,
    followUp: validated.followUp,
    confidence: validated.confidence,
  };
  persistGeneration("ask", question, p.studentLanguage, { question, result }, p.lessonId);
  return result;
}

// ── Classroom translation ────────────────────────────────────────────────────

export async function runTranslate(p: TranslatePayload): Promise<TranslateResult> {
  const text = p.text.trim();
  if (!text) throw new Error("Empty text");
  if (text.length > 2000) throw new Error("Text too long");

  const lessonCtx: LessonContext | undefined = p.lessonContext;

  const { system, user } = translatePrompt({
    text,
    teacherLanguage: p.teacherLanguage,
    studentLanguage: p.studentLanguage,
    grade: p.grade,
    lesson: lessonCtx,
    glossary: buildGlossary(text, p.studentLanguage),
  });

  const opts: Parameters<typeof callNemotron>[0] = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    json: true,
    maxTokens: 600,
    temperature: 0.3,
    timeoutMs: 25_000,
  };

  const res = await callNemotron(opts);
  const parsed = extractJson<Record<string, unknown>>(res.text);
  if (!parsed) throw new NemotronUnavailableError("Invalid structured translation response");
  const validated = TranslateSchema.parse(parsed);

  const target = p.studentLanguage;
  const cleaned = await enforceLanguage(
    [validated.translation, validated.adaptation, validated.example].join(" "),
    target,
    opts,
  );

  const result: TranslateResult = {
    ...meta(res.provider, res.model, res.latencyMs),
    quality: cleaned.repaired ? "mixed" : "ok",
    note: cleaned.repaired
      ? `Language-mix detected and repaired (${getLanguage(target).name} only).`
      : undefined,
    translation: validated.translation,
    adaptation: validated.adaptation || validated.translation,
    example: validated.example,
  };
  persistGeneration("translate", text, target, {
    text,
    teacherLanguage: p.teacherLanguage,
    result,
  });
  return result;
}

// ── Semantic lesson search ───────────────────────────────────────────────────

export async function runSearch(p: SearchPayload): Promise<SearchResult> {
  const query = p.query.trim();
  if (!query) throw new Error("Empty query");
  const candidates = await retrieveCandidates(query, p.class);
  if (!candidates.length) throw new Error("No lessons available");

  const { system, user } = searchPrompt({
    query,
    studentLanguage: p.studentLanguage,
    candidates,
  });

  const opts: Parameters<typeof callNemotron>[0] = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    json: true,
    maxTokens: 300,
    temperature: 0.2,
    timeoutMs: 20_000,
  };

  const res = await callNemotron(opts);
  const parsed = extractJson<Record<string, unknown>>(res.text);
  let validated = parsed ? SearchSchema.parse(parsed) : null;

  // CRITICAL VALIDATION: the lesson must actually exist in the candidate set.
  if (!validated || !candidates.some((c) => c.slug === validated!.selectedLessonId)) {
    validated = {
      queryMeaning: "",
      selectedLessonId: candidates[0].slug,
      reason: "Closest curriculum match.",
      confidence: 0.5,
    };
  }

  const result: SearchResult = {
    ...meta(res.provider, res.model, res.latencyMs),
    queryMeaning: validated.queryMeaning,
    selectedLessonId: validated.selectedLessonId,
    reason: validated.reason,
    confidence: validated.confidence,
  };
  persistGeneration("search", query, p.studentLanguage, { query, result });
  return result;
}

// ── Worksheet generation ─────────────────────────────────────────────────────

export async function runWorksheet(p: WorksheetPayload): Promise<WorksheetResult> {
  const row = await getLessonRow(p.lessonId);
  if (!row) throw new Error("Unknown lesson");
  const countQ = Math.min(Math.max(p.questionCount ?? 6, 2), 10);

  const { system, user } = worksheetPrompt({
    lesson: { ...lessonContextFromRow(row), slug: row.slug, keywords: row.keywords },
    language: p.language,
    difficulty: p.difficulty,
    count: countQ,
  });

  const opts: Parameters<typeof callNemotron>[0] = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    json: true,
    maxTokens: 1800,
    temperature: 0.5,
    timeoutMs: 45_000,
  };

  const res = await callNemotron(opts);
  const parsed = extractJson<Record<string, unknown>>(res.text);
  if (!parsed) throw new NemotronUnavailableError("Invalid worksheet structure");
  const validated = WorksheetSchema.parse(parsed);

  const result: WorksheetResult = {
    ...meta(res.provider, res.model, res.latencyMs),
    title: validated.title,
    language: validated.language || getLanguage(p.language).name,
    learningObjective: validated.learningObjective,
    instructions: validated.instructions,
    questions: validated.questions,
  };
  persistGeneration("worksheet", p.lessonId, p.language, { lessonId: p.lessonId, result }, p.lessonId);
  return result;
}

// ── Quiz generation ──────────────────────────────────────────────────────────

export async function runQuiz(p: QuizPayload): Promise<QuizResult> {
  const row = await getLessonRow(p.lessonId);
  if (!row) throw new Error("Unknown lesson");
  const countQ = Math.min(Math.max(p.count ?? 5, 2), 8);

  const { system, user } = quizPrompt({
    lesson: { ...lessonContextFromRow(row), slug: row.slug, keywords: row.keywords },
    language: p.language,
    count: countQ,
    previousScore: p.performance?.previousScore,
    wrongConcepts: p.performance?.wrongConcepts,
  });

  const opts: Parameters<typeof callNemotron>[0] = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    json: true,
    maxTokens: 1600,
    temperature: 0.5,
    timeoutMs: 40_000,
  };

  const res = await callNemotron(opts);
  const parsed = extractJson<Record<string, unknown>>(res.text);
  if (!parsed) throw new NemotronUnavailableError("Invalid quiz structure");
  const validated = QuizSchema.parse(parsed);

  const result: QuizResult = {
    ...meta(res.provider, res.model, res.latencyMs),
    title: validated.title,
    questions: validated.questions,
  };
  persistGeneration("quiz", p.lessonId, p.language, { lessonId: p.lessonId, result }, p.lessonId);
  return result;
}

// ── Adaptive learning recommendation ─────────────────────────────────────────

export async function runRecommend(p: RecommendPayload): Promise<RecommendResult> {
  await ensureSeeded();
  // REAL student progress from the database — Nemotron never invents it.
  const progressRows = await db
    .select()
    .from(progress)
    .where(eq(progress.studentKey, p.studentKey))
    .orderBy(desc(progress.createdAt))
    .limit(40);

  const lessonRows = await db.select().from(lessons).orderBy(asc(lessons.id));
  const titleOf = new Map(lessonRows.map((l) => [l.slug, `${l.titleHi} (${l.titleEn})`]));
  const bySlug = new Map<string, typeof progressRows[number][]>();
  for (const pr of progressRows) {
    const list = bySlug.get(pr.lessonSlug) ?? [];
    list.push(pr);
    bySlug.set(pr.lessonSlug, list);
  }

  const progressSummary = Array.from(bySlug.entries()).map(([slug, list]) => ({
    lessonSlug: slug,
    title: titleOf.get(slug) ?? slug,
    score: Math.max(...list.map((x) => x.score)),
    total: list[0].total,
    attempts: list.length,
    lastAttempt: list[0].createdAt.toISOString(),
  }));

  const candidates = lessonRows.map(toCandidate);
  const { system, user } = recommendPrompt({
    language: p.language,
    progress: progressSummary,
    candidates,
  });

  const opts: Parameters<typeof callNemotron>[0] = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    json: true,
    maxTokens: 500,
    temperature: 0.3,
  };

  const res = await callNemotron(opts);
  const parsed = extractJson<Record<string, unknown>>(res.text);
  let validated = parsed ? RecommendSchema.parse(parsed) : null;

  // Validate: the recommended lesson must really exist.
  if (!validated || !candidates.some((c) => c.slug === validated!.lessonId)) {
    const weakest = [...progressSummary].sort(
      (a, b) => a.score / Math.max(a.total, 1) - b.score / Math.max(b.total, 1),
    )[0];
    validated = {
      action: "remedial_practice",
      lessonId: weakest?.lessonSlug ?? candidates[0].slug,
      reason: "अभ्यास से समझ और मज़बूत होती है।",
      difficulty: "easy",
      message: "धीरे-धीरे अभ्यास करो, सब आ जाएगा!",
    };
  }

  return {
    ...meta(res.provider, res.model, res.latencyMs),
    action: validated.action,
    lessonId: validated.lessonId,
    reason: validated.reason,
    difficulty: validated.difficulty,
    message: validated.message,
  };
}

// ── Contextual dictionary ────────────────────────────────────────────────────

export async function runDictionary(p: DictionaryPayload): Promise<DictionaryResult> {
  const query = p.query.trim();
  if (!query) throw new Error("Empty query");

  // EXACT local lookup first — no LLM call for known words.
  const exact = DICTIONARY.find(
    (d) =>
      d.hi === query ||
      d.en.toLowerCase() === query.toLowerCase() ||
      [d.sat, d.hoc, d.unr].some((v) => v && v === query),
  );
  if (exact) {
    const lang = p.language;
    const tribal = exact[lang as keyof typeof exact];
    const word =
      typeof tribal === "string" && tribal.length > 0
        ? tribal
        : lang === "en"
          ? exact.en
          : exact.hi;
    const def = getLanguage(lang);
    return {
      engine: "local",
      provider: "none",
      model: "local-dictionary",
      latencyMs: 1,
      mode: "online",
      word,
      meaning:
        lang === "en"
          ? `"${exact.hi}" means ${exact.en}.`
          : lang === "hi"
            ? `"${exact.hi}" का अर्थ है — ${exact.en}।`
            : `"${exact.hi}" (${exact.en}) को ${def.name} में "${word}" कहते हैं।`,
      translation: word,
      example: "",
      source: "exact",
      contextual: false,
    };
  }

  // Ambiguous / misspelled / conceptual → Nemotron contextual understanding.
  const entries = DICTIONARY.slice(0, 40).map((d) => ({ hi: d.hi, en: d.en }));
  const { system, user } = dictionaryPrompt({ query, language: p.language, entries });

  const opts: Parameters<typeof callNemotron>[0] = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    json: true,
    maxTokens: 500,
    temperature: 0.4,
    timeoutMs: 25_000,
  };

  const res = await callNemotron(opts);
  const parsed = extractJson<Record<string, unknown>>(res.text);
  if (!parsed) throw new NemotronUnavailableError("Invalid dictionary response");
  const validated = DictionarySchema.parse(parsed);

  const result: DictionaryResult = {
    ...meta(res.provider, res.model, res.latencyMs),
    word: validated.word || query,
    meaning: validated.meaning,
    translation: validated.translation,
    example: validated.example,
    source: "ai",
    contextual: validated.contextual,
  };
  persistGeneration("dictionary", query, p.language, { query, result });
  return result;
}

// ── Visual flashcards ────────────────────────────────────────────────────────

export async function runFlashcards(p: FlashcardsPayload): Promise<FlashcardsResult> {
  const row = await getLessonRow(p.lessonId);
  if (!row) throw new Error("Unknown lesson");
  const countC = Math.min(Math.max(p.count ?? 6, 3), 10);

  const { system, user } = flashcardsPrompt({
    lesson: { ...lessonContextFromRow(row), slug: row.slug, keywords: row.keywords },
    language: p.language,
    count: countC,
  });

  const opts: Parameters<typeof callNemotron>[0] = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    json: true,
    maxTokens: 1600,
    temperature: 0.5,
    timeoutMs: 45_000,
  };

  const res = await callNemotron(opts);
  const parsed = extractJson<Record<string, unknown>>(res.text);
  if (!parsed) throw new NemotronUnavailableError("Invalid flashcard structure");
  const validated = FlashcardSchema.parse(parsed);

  const result: FlashcardsResult = {
    ...meta(res.provider, res.model, res.latencyMs),
    title: validated.title,
    cards: validated.cards,
  };
  persistGeneration("flashcards", p.lessonId, p.language, { lessonId: p.lessonId, result }, p.lessonId);
  return result;
}

// ── Whole-page localization (Nemotron translates UI text on language switch) ─

export async function runLocalize(p: LocalizePayload): Promise<LocalizeResult> {
  const texts = p.texts.map((s) => s.trim().slice(0, 300)).filter(Boolean);
  if (!texts.length) throw new Error("Nothing to localize");
  if (texts.length > 20) throw new Error("Too many strings in one batch");

  const { system, user } = localizePrompt({ texts, language: p.language });

  const opts: Parameters<typeof callNemotron>[0] = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    json: true,
    maxTokens: 2000,
    temperature: 0.3,
    timeoutMs: 45_000,
  };

  const res = await callNemotron(opts);
  const parsed = extractJson<Record<string, unknown>>(res.text);
  if (!parsed) throw new NemotronUnavailableError("Invalid localization structure");
  const validated = LocalizeSchema.parse(parsed);

  // Keep order + count consistent; ignore unknown indices.
  const items = validated.items
    .filter((it) => it.i >= 0 && it.i < texts.length)
    .map((it) => ({ i: it.i, text: it.text }));

  const result: LocalizeResult = {
    ...meta(res.provider, res.model, res.latencyMs),
    items,
  };
  persistGeneration("localize", texts.join("|").slice(0, 500), p.language, {
    language: p.language,
    result: { items },
  });
  return result;
}

// ── Upload Studio: teacher content → child-friendly lesson ──────────────────

export async function runStudio(p: StudioPayload): Promise<StudioResult> {
  const content = p.content.trim();
  if (!content) throw new Error("Empty material");

  const { system, user } = studioPrompt({
    title: p.title,
    content,
    kind: p.kind,
    language: p.language,
  });

  const opts: Parameters<typeof callNemotron>[0] = {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    json: true,
    maxTokens: 1200,
    temperature: 0.4,
    timeoutMs: 45_000,
  };

  const res = await callNemotron(opts);
  const parsed = extractJson<Record<string, unknown>>(res.text);
  if (!parsed) throw new NemotronUnavailableError("Invalid studio lesson structure");
  const validated = StudioSchema.parse(parsed);

  const result: StudioResult = {
    ...meta(res.provider, res.model, res.latencyMs),
    summary: validated.summary,
    steps: validated.steps,
    examples: validated.examples,
    takeaway: validated.takeaway,
    followUp: validated.followUp,
  };
  persistGeneration("studio", p.contentId, p.language, { contentId: p.contentId, result });
  return result;
}


