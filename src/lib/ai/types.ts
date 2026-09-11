// ─────────────────────────────────────────────────────────────────────────────
// Central AI types shared by the server orchestrator and the client.
// ─────────────────────────────────────────────────────────────────────────────
import type { LanguageCode } from "@/lib/languages";

export type AiEngine = "nemotron" | "local";
export type AiProvider = "openrouter" | "nvidia" | "none";

/** Metadata attached to EVERY AI result so the UI can show the TRUE engine. */
export interface AiMeta {
  engine: AiEngine;
  provider: AiProvider;
  model: string;
  latencyMs: number;
  mode: "online" | "offline";
  quality?: "ok" | "mixed";
  note?: string;
  /** True when a Nemotron result generated ONLINE is replayed from the
   *  device cache while offline — labeled honestly in the UI. */
  cached?: boolean;
}

export interface CandidateLesson {
  slug: string;
  class: number;
  subject: string;
  titleHi: string;
  titleEn: string;
  concept: string;
  objective: string;
  keywords: string[];
}

export interface LessonContext {
  grade?: number;
  subject?: string;
  lessonTitle?: string;
  concept?: string;
  objective?: string;
  nipunOutcome?: string;
}

// ── Operations ──────────────────────────────────────────────────────────────

export interface AskPayload {
  question: string;
  studentLanguage: LanguageCode;
  teacherLanguage?: LanguageCode;
  grade?: number;
  subject?: string;
  lessonId?: string;
}

export interface AskResult extends AiMeta {
  intent: string;
  concept: string;
  answer: string;
  explanation: string;
  steps: string[];
  localExample: string;
  takeaway: string;
  followUp: string;
  confidence: number;
}

export interface TranslatePayload {
  text: string;
  teacherLanguage: LanguageCode;
  studentLanguage: LanguageCode;
  grade?: number;
  lessonContext?: LessonContext;
}

export interface TranslateResult extends AiMeta {
  translation: string;
  adaptation: string;
  example: string;
  note?: string;
}

export interface SearchPayload {
  query: string;
  class?: number;
  studentLanguage: LanguageCode;
}

export interface SearchResult extends AiMeta {
  queryMeaning: string;
  selectedLessonId: string;
  reason: string;
  confidence: number;
}

export interface WorksheetPayload {
  lessonId: string;
  language: LanguageCode;
  difficulty: "easy" | "medium" | "hard";
  questionCount?: number;
}

export interface WorksheetQuestion {
  type: "mcq" | "fill" | "short";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface WorksheetResult extends AiMeta {
  title: string;
  language: string;
  learningObjective: string;
  instructions: string;
  questions: WorksheetQuestion[];
}

export interface QuizPayload {
  lessonId: string;
  language: LanguageCode;
  count?: number;
  performance?: { previousScore?: number; wrongConcepts?: string[] };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizResult extends AiMeta {
  title: string;
  questions: QuizQuestion[];
}

export interface RecommendPayload {
  studentKey: string;
  language: LanguageCode;
  class?: number;
}

export interface RecommendResult extends AiMeta {
  action: "remedial_practice" | "targeted_practice" | "challenge" | "revision";
  lessonId: string;
  reason: string;
  difficulty: "easy" | "medium" | "hard";
  message: string;
}

export interface DictionaryPayload {
  query: string;
  language: LanguageCode;
}

export interface DictionaryResult extends AiMeta {
  word: string;
  meaning: string;
  translation: string;
  example: string;
  source: "exact" | "ai" | "offline";
  contextual: boolean;
}

export interface StatusPayload {
  _?: null;
}

export interface StatusResult extends AiMeta {
  configured: boolean;
  verified: boolean;
  model: string;
}

export interface FlashcardsPayload {
  lessonId: string;
  language: LanguageCode;
  count?: number;
}

export interface FlashcardItem {
  concept: string;
  word: string;
  meaning: string;
  example: string;
  learningObjective: string;
}

export interface FlashcardsResult extends AiMeta {
  title: string;
  cards: FlashcardItem[];
}

// ── Whole-page localization (Nemotron translates UI text on language switch) ─

export interface LocalizePayload {
  texts: string[];
  language: LanguageCode;
}

export interface LocalizeResult extends AiMeta {
  items: Array<{ i: number; text: string }>;
}

// ── Upload Studio: teacher content → child-friendly lesson ──────────────────

export interface StudioPayload {
  contentId: string;
  content: string;
  title: string;
  kind: string;
  language: LanguageCode;
}

export interface StudioResult extends AiMeta {
  summary: string;
  steps: string[];
  examples: string[];
  takeaway: string;
  followUp: string;
}

// ── API envelope ─────────────────────────────────────────────────────────────

export type AiOpName =
  | "status"
  | "ask"
  | "translate"
  | "search"
  | "worksheet"
  | "quiz"
  | "recommend"
  | "dictionary"
  | "flashcards"
  | "localize"
  | "studio";

export interface AiApiRequest {
  op: AiOpName;
  payload: Record<string, unknown>;
}

export type AiApiOk<T> = { ok: true; data: T };
export type AiApiErr = { ok: false; code: string; friendly: string };
export type AiApiResponse<T> = AiApiOk<T> | AiApiErr;

export const FRIENDLY_AI_ERROR =
  "AI is temporarily unavailable. Please try again.";
