// ─────────────────────────────────────────────────────────────────────────────
// Centralized prompt management for GyanSetu's Nemotron integration.
// One specialized prompt per pedagogical task. Every prompt receives real
// educational context (grade, subject, lesson, objective, languages) and a
// strict single-language output rule that prevents Hindi/target mixing.
// Internal reasoning is never surfaced to students.
// ─────────────────────────────────────────────────────────────────────────────
import type { LanguageCode } from "@/lib/languages";
import { getLanguage, languageRule } from "@/lib/languages";
import type { CandidateLesson, LessonContext } from "@/lib/ai/types";
import { PHRASEBOOK, type Phrase } from "@/lib/curriculum";

const ROLE =
  "You are GyanSetu (ज्ञानसेतु), the AI pedagogy engine of a mother-tongue " +
  "primary education platform for the Jharkhand PALASH MTB-MLE programme " +
  "(SIH 26042). Teachers are Hindi-medium trained; children speak Santhali, " +
  "Ho, or Mundari. You teach Classes 1–3 (ages 6–9) using NIPUN Bharat " +
  "Foundational Literacy & Numeracy (FLN) principles.";

const RULES = [
  "Be factually correct. Never invent facts, lesson IDs, or scores.",
  "Use very simple words and short sentences appropriate for a primary-school child.",
  "Never expose internal reasoning, chain-of-thought, or analysis to the user — output only the final educational result.",
  "Never output markdown tables, code, or HTML.",
  "Keep every answer grounded in the curriculum context provided.",
  "Local examples must match the concept (water→pond/rain/wet clothes; math→fruits/seeds/pencils; plants→khet/garden; story→story characters). Do not force village examples where they do not fit.",
].join("\n");

const JSON_RULE =
  "Respond with a single valid JSON object and nothing else. No markdown fences, no commentary, no prose outside the JSON.";

function contextBlock(ctx: LessonContext): string {
  const parts: string[] = [];
  if (ctx.grade) parts.push(`Grade/Class: ${ctx.grade}`);
  if (ctx.subject) parts.push(`Subject: ${ctx.subject}`);
  if (ctx.lessonTitle) parts.push(`Current lesson: ${ctx.lessonTitle}`);
  if (ctx.concept) parts.push(`Lesson concept: ${ctx.concept}`);
  if (ctx.objective) parts.push(`Learning objective: ${ctx.objective}`);
  if (ctx.nipunOutcome) parts.push(`NIPUN Bharat outcome: ${ctx.nipunOutcome}`);
  return parts.length ? `EDUCATIONAL CONTEXT:\n${parts.join("\n")}` : "";
}

function candidatesBlock(candidates: CandidateLesson[]): string {
  if (!candidates.length) return "";
  const slim = candidates.map((c) => ({
    id: c.slug,
    title: `${c.titleHi} (${c.titleEn})`,
    concept: c.concept,
    objective: c.objective,
    keywords: c.keywords.slice(0, 10),
  }));
  return (
    "RELEVANT CURRICULUM CANDIDATES (grounding only — reason over these, do not invent new ones):\n" +
    JSON.stringify(slim)
  );
}

const langName = (code: LanguageCode | undefined, fallback: LanguageCode) =>
  getLanguage(code ?? fallback).name;

// ── Tutor (Ask AI / student questions) ───────────────────────────────────────

export interface GlossaryEntry {
  hi: string;
  to: string;
}

export function tutorPrompt(p: {
  question: string;
  studentLanguage: LanguageCode;
  teacherLanguage?: LanguageCode;
  grade?: number;
  subject?: string;
  lesson?: LessonContext;
  candidates: CandidateLesson[];
  glossary?: GlossaryEntry[];
}): { system: string; user: string } {
  const lang = p.studentLanguage;
  const schema = `{
  "intent": "concept_question | meaning_question | story_question | homework_help | outside_scope",
  "concept": "short concept name (e.g. water_cycle) or empty string",
  "answer": "the direct answer to the child's question, 1-2 sentences",
  "explanation": "simple child-level explanation (3-6 sentences) using the steps of the concept where relevant",
  "steps": ["optional ordered steps of the concept, max 6, empty if not applicable"],
  "localExample": "one everyday example that truly matches the concept",
  "takeaway": "one memorable takeaway sentence",
  "followUp": "one short learning-check question for the child",
  "confidence": 0.0
}`;
  return {
    system: [
      ROLE,
      RULES,
      languageRule(lang),
      `The child's home language is ${langName(lang, "hi")}.`,
      `IMPORTANT: The question may arrive in ANY language — Hindi, English, Santhali, Ho, Mundari, or a mix. Detect its meaning from the content, then respond 100% in ${langName(lang, "hi")} ONLY. Never answer in the question's language when it differs from ${langName(lang, "hi")}.`,
      "If the question is outside primary education or unanswerable, set intent to outside_scope and kindly guide the child back to their lessons.",
      JSON_RULE,
      `JSON schema (use exactly these keys): ${schema}`,
    ].join("\n\n"),
    user: [
      contextBlock({ ...(p.lesson ?? {}), grade: p.grade, subject: p.subject }),
      candidatesBlock(p.candidates),
      p.glossary && p.glossary.length
        ? `AUTHENTIC ${langName(lang, "hi")} VOCABULARY — you MUST use these genuine ${langName(lang, "hi")} words in your answer instead of Hindi words:\n${p.glossary.map((g) => `${g.hi} = ${g.to}`).join(", ")}`
        : "",
      `CHILD'S QUESTION: ${p.question}`,
      `Now produce the JSON answer in ${langName(lang, "hi")} only.`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

// ── Classroom / pedagogical translation ──────────────────────────────────────

/** Authoritative phrasebook lines matching the input — few-shot grounding. */
function phrasebookBlock(text: string, lang: LanguageCode): string {
  if (lang === "hi" || lang === "en") return "";
  const tokens = text
    .toLowerCase()
    .replace(/[?,।.!"'()]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2);
  const matches = PHRASEBOOK.filter((p: Phrase) => {
    const hi = p.hi.toLowerCase();
    return tokens.some((t) => hi.includes(t) || t.includes(hi)) || hi.includes(text.trim().toLowerCase());
  }).slice(0, 6);
  if (!matches.length) return "";
  const lines = matches
    .map((p) => `${p.hi} → ${p[lang as keyof Phrase]}`)
    .join("\n");
  return (
    "AUTHORITATIVE CLASSROOM PHRASEBOOK (validated school phrases — if the input matches any of these, reuse their exact wording):\n" +
    lines
  );
}

export function translatePrompt(p: {
  text: string;
  teacherLanguage: LanguageCode;
  studentLanguage: LanguageCode;
  grade?: number;
  lesson?: LessonContext;
  glossary?: GlossaryEntry[];
}): { system: string; user: string } {
  const to = p.studentLanguage;
  const from = p.teacherLanguage;
  const schema = `{
  "translation": "the teacher's sentence fully in the student language (pure, no mixing)",
  "adaptation": "a simplified, primary-grade pedagogical version of the same meaning in the student language",
  "example": "one concrete everyday example that reinforces the idea, in the student language",
  "note": "very short optional note for the TEACHER in the teacher language, max 12 words, or empty string"
}`;
  return {
    system: [
      ROLE,
      RULES,
      "This is a live classroom translation task. Translate meaning first, then adapt pedagogically. Do NOT do word-for-word substitution.",
      languageRule(to),
      `The teacher normally speaks ${langName(from, "hi")}, but the input text may arrive in ANY language (Hindi, English, Santhali, Ho, Mundari, or a mix). Understand its MEANING first, then the child must receive EVERYTHING in ${langName(to, "hi")} only — no Hindi, no English, no mixed sentences, regardless of the input language.`,
      "Keep sentences short enough for Class 1–3 children to follow.",
      JSON_RULE,
      `JSON schema: ${schema}`,
    ].join("\n\n"),
    user: [
      contextBlock({ ...(p.lesson ?? {}), grade: p.grade }),
      p.glossary && p.glossary.length
        ? `AUTHENTIC ${langName(to, "hi")} VOCABULARY — you MUST use these genuine ${langName(to, "hi")} words in the translation instead of Hindi words:\n${p.glossary.map((g) => `${g.hi} = ${g.to}`).join(", ")}`
        : "",
      phrasebookBlock(p.text, to),
      `TEACHER INPUT (${langName(from, "hi")}): ${p.text}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

// ── Semantic lesson search ───────────────────────────────────────────────────

export function searchPrompt(p: {
  query: string;
  studentLanguage: LanguageCode;
  candidates: CandidateLesson[];
}): { system: string; user: string } {
  const schema = `{
  "queryMeaning": "what the user actually wants, one short sentence in English (internal only)",
  "selectedLessonId": "one slug from the candidate list",
  "reason": "one short sentence in ${getLanguage(p.studentLanguage).name} explaining why this lesson fits",
  "confidence": 0.0
}`;
  return {
    system: [
      ROLE,
      "You rank curriculum lessons by semantic match with a natural-language query. Consider synonyms, concept overlap and primary-school intent.",
      "CRITICAL: selectedLessonId MUST be exactly one of the ids provided. Never invent an id. If nothing fits, choose the closest candidate.",
      JSON_RULE,
      `JSON schema: ${schema}`,
    ].join("\n\n"),
    user: [
      candidatesBlock(p.candidates),
      `SEARCH QUERY: ${p.query}`,
      `Select the single best matching lesson.`,
    ].join("\n\n"),
  };
}

// ── Worksheet generation ─────────────────────────────────────────────────────

export function worksheetPrompt(p: {
  lesson: LessonContext & { slug: string; keywords: string[] };
  language: LanguageCode;
  difficulty: "easy" | "medium" | "hard";
  count: number;
}): { system: string; user: string } {
  const schema = `{
  "title": "worksheet title in the student language",
  "language": "${p.language}",
  "learningObjective": "one line from the lesson objective, in the student language",
  "instructions": "one friendly instruction line for the child, in the student language",
  "questions": [
    {
      "type": "mcq | fill | short",
      "question": "question text in the student language",
      "options": ["4 options for mcq, omitted otherwise"],
      "answer": "correct answer in the student language",
      "explanation": "why this answer is right, one sentence, in the student language"
    }
  ]
}`;
  return {
    system: [
      ROLE,
      RULES,
      "You generate bilingual-printable primary worksheets strictly from the provided lesson context. Do not import content from other topics.",
      `Difficulty level: ${p.difficulty}. Mix question types: mostly mcq, some fill/short.`,
      languageRule(p.language),
      `Generate EXACTLY ${p.count} questions.`,
      JSON_RULE,
      `JSON schema: ${schema}`,
    ].join("\n\n"),
    user: [
      contextBlock(p.lesson),
      `Lesson keywords: ${p.lesson.keywords.slice(0, 12).join(", ")}`,
    ].join("\n\n"),
  };
}

// ── Quiz generation ──────────────────────────────────────────────────────────

export function quizPrompt(p: {
  lesson: LessonContext & { slug: string; keywords: string[] };
  language: LanguageCode;
  count: number;
  previousScore?: number;
  wrongConcepts?: string[];
}): { system: string; user: string } {
  const diff =
    p.previousScore == null
      ? "easy difficulty (first attempt)"
      : p.previousScore < 50
        ? "mostly easy (remedial, reinforce basics)"
        : p.previousScore < 80
          ? "medium difficulty (targeted practice)"
          : "medium-hard (slight challenge)";
  const schema = `{
  "title": "quiz title in the student language",
  "questions": [
    {
      "question": "question text in the student language",
      "options": ["exactly 4 options in the student language"],
      "answer": "the correct option, copied verbatim from options",
      "explanation": "one-sentence explanation in the student language",
      "difficulty": "easy | medium | hard"
    }
  ]
}`;
  return {
    system: [
      ROLE,
      RULES,
      "You generate curriculum-grounded quizzes. Questions must stay inside the provided lesson context. Distractors must be plausible but clearly wrong.",
      diff,
      ...(p.wrongConcepts?.length
        ? [`Focus extra questions on these weak areas: ${p.wrongConcepts.join(", ")}.`]
        : []),
      languageRule(p.language),
      `Generate EXACTLY ${p.count} questions.`,
      JSON_RULE,
      `JSON schema: ${schema}`,
    ].join("\n\n"),
    user: [
      contextBlock(p.lesson),
      `Lesson keywords: ${p.lesson.keywords.slice(0, 12).join(", ")}`,
    ].join("\n\n"),
  };
}

// ── Adaptive learning recommendation ─────────────────────────────────────────

export function recommendPrompt(p: {
  language: LanguageCode;
  progress: Array<{
    lessonSlug: string;
    title: string;
    score: number;
    total: number;
    attempts: number;
    lastAttempt: string;
  }>;
  candidates: CandidateLesson[];
}): { system: string; user: string } {
  const schema = `{
  "action": "remedial_practice | targeted_practice | challenge | revision",
  "lessonId": "one slug from the candidate list (existing lesson the child should do next)",
  "reason": "one friendly sentence for the child in ${getLanguage(p.language).name}",
  "difficulty": "easy | medium | hard",
  "message": "short encouraging message for the child in ${getLanguage(p.language).name} (max 2 sentences)"
}`;
  return {
    system: [
      ROLE,
      "You recommend the next learning step using ONLY the real progress records provided. Never invent scores or history.",
      "Weak/empty progress → remedial_practice on a core lesson. Medium → targeted_practice. Strong → challenge or revision.",
      "CRITICAL: lessonId MUST be exactly one of the candidate ids. Never invent an id.",
      languageRule(p.language),
      JSON_RULE,
      `JSON schema: ${schema}`,
    ].join("\n\n"),
    user: [
      "REAL STUDENT PROGRESS (from database):\n" +
        (p.progress.length
          ? JSON.stringify(p.progress)
          : "No attempts yet — the child is new to the platform."),
      candidatesBlock(p.candidates),
    ].join("\n\n"),
  };
}

// ── Contextual dictionary ────────────────────────────────────────────────────

export function dictionaryPrompt(p: {
  query: string;
  language: LanguageCode;
  entries: Array<{ hi: string; en: string }>;
}): { system: string; user: string } {
  const schema = `{
  "word": "the headword the user asked about, in the student language script",
  "meaning": "child-friendly meaning of the word, in the student language",
  "translation": "the word translated into the student language",
  "example": "one simple everyday sentence using the word, in the student language",
  "contextual": true
}`;
  return {
    system: [
      ROLE,
      "You are the contextual dictionary of a primary school. Understand misspellings, homonyms and phrase questions (e.g. 'X का मतलब क्या है?').",
      languageRule(p.language),
      "The user may ask in Hindi or English; ALWAYS answer entirely in the student language.",
      "If the word is unknown, give the closest reasonable primary-school meaning and mark it clearly in the meaning.",
      JSON_RULE,
      `JSON schema: ${schema}`,
    ].join("\n\n"),
    user: [
      p.entries.length
        ? "NEARBY DICTIONARY ENTRIES (grounding only):\n" + JSON.stringify(p.entries)
        : "",
      `USER QUERY: ${p.query}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

// ── Status ping ──────────────────────────────────────────────────────────────

export function statusPrompt(): { system: string; user: string } {
  return {
    system: "You are a health-check bot. Reply with exactly one word.",
    user: "OK",
  };
}

// ── Whole-page localization (batch UI translation) ──────────────────────────

export function localizePrompt(p: {
  texts: string[];
  language: LanguageCode;
}): { system: string; user: string } {
  const schema = `{
  "items": [ { "i": 0, "text": "translated string" } ]
}`;
  return {
    system: [
      ROLE,
      "You are localizing the user interface of a children's learning app. Keep every string short, warm and easy for a 5–8 year old. Preserve emoji. Keep the same order.",
      languageRule(p.language),
      JSON_RULE,
      `JSON schema: ${schema} — include one object per input string with its original index.`,
    ].join("\n\n"),
    user: [
      `INPUT STRINGS (in order):`,
      JSON.stringify(p.texts),
    ].join("\n\n"),
  };
}

// ── Upload Studio: teacher content → child-friendly pedagogy ────────────────

export function studioPrompt(p: {
  title: string;
  content: string;
  kind: string;
  language: LanguageCode;
}): { system: string; user: string } {
  const schema = `{
  "summary": "the whole idea explained in 3-4 very simple sentences, in the student language",
  "steps": ["ordered short steps of the idea, max 6, each one short — these will be drawn as a flow"],
  "examples": ["2 everyday examples that truly match the content"],
  "takeaway": "one memorable takeaway sentence",
  "followUp": "one short question to check understanding"
}`;
  return {
    system: [
      ROLE,
      RULES,
      "A teacher uploaded their own teaching material. Turn it into a lesson a 5-year-old can understand: simplify hard words, split the idea into short steps, add examples from the child's everyday life.",
      `The uploaded content type is: ${p.kind}.`,
      "Do not add facts that are not in the material. Keep everything inside the material.",
      languageRule(p.language),
      JSON_RULE,
      `JSON schema: ${schema}`,
    ].join("\n\n"),
    user: [
      `MATERIAL TITLE: ${p.title}`,
      `MATERIAL CONTENT:\n${p.content.slice(0, 4000)}`,
    ].join("\n\n"),
  };
}

// ── Visual flashcards ────────────────────────────────────────────────────────

export function flashcardsPrompt(p: {
  lesson: LessonContext & { slug: string; keywords: string[] };
  language: LanguageCode;
  count: number;
}): { system: string; user: string } {
  const schema = `{
  "title": "deck title in the student language",
  "cards": [
    {
      "concept": "short concept name (e.g. evaporation), in the student language",
      "word": "the headword for the card, in the student language",
      "meaning": "child-friendly meaning of the word, in the student language",
      "example": "one short everyday sentence using the word, in the student language",
      "learningObjective": "one short NIPUN-style objective this card supports, in the student language"
    }
  ]
}`;
  return {
    system: [
      ROLE,
      RULES,
      "You generate visual flashcard CONTENT only — concept, word, child-friendly meaning, example, learning objective. Never generate images, code, or UI layout.",
      "Cards must stay strictly inside the provided lesson context.",
      languageRule(p.language),
      `Generate EXACTLY ${p.count} cards.`,
      JSON_RULE,
      `JSON schema: ${schema}`,
    ].join("\n\n"),
    user: [
      contextBlock(p.lesson),
      `Lesson keywords: ${p.lesson.keywords.slice(0, 14).join(", ")}`,
    ].join("\n\n"),
  };
}
