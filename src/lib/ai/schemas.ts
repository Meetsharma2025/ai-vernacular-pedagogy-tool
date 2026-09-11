// ─────────────────────────────────────────────────────────────────────────────
// Zod schemas used to VALIDATE every structured Nemotron response before it
// can reach the UI. Uncontrolled model output never touches the frontend.
// ─────────────────────────────────────────────────────────────────────────────
import { z } from "zod";

export const AskSchema = z.object({
  intent: z.string().default("concept_question"),
  concept: z.string().default(""),
  answer: z.string().min(1),
  explanation: z.string().min(1),
  steps: z.array(z.string()).max(8).default([]),
  localExample: z.string().default(""),
  takeaway: z.string().default(""),
  followUp: z.string().default(""),
  confidence: z.coerce.number().min(0).max(1).default(0.5),
});

export const TranslateSchema = z.object({
  translation: z.string().min(1),
  adaptation: z.string().default(""),
  example: z.string().default(""),
  note: z.string().default(""),
});

export const SearchSchema = z.object({
  queryMeaning: z.string().default(""),
  selectedLessonId: z.string().min(1),
  reason: z.string().default(""),
  confidence: z.coerce.number().min(0).max(1).default(0.5),
});

const WorksheetQuestionSchema = z.object({
  type: z.enum(["mcq", "fill", "short"]).catch("short"),
  question: z.string().min(1),
  options: z.array(z.string()).max(6).optional(),
  answer: z.string().default(""),
  explanation: z.string().default(""),
});

export const WorksheetSchema = z.object({
  title: z.string().min(1),
  language: z.string().default(""),
  learningObjective: z.string().default(""),
  instructions: z.string().default(""),
  questions: z.array(WorksheetQuestionSchema).min(1).max(12),
});

const QuizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2).max(6).default([]),
  answer: z.string().default(""),
  explanation: z.string().default(""),
  difficulty: z.enum(["easy", "medium", "hard"]).catch("easy"),
});

export const QuizSchema = z.object({
  title: z.string().default("Quiz"),
  questions: z.array(QuizQuestionSchema).min(1).max(12),
});

export const RecommendSchema = z.object({
  action: z
    .enum(["remedial_practice", "targeted_practice", "challenge", "revision"])
    .catch("targeted_practice"),
  lessonId: z.string().min(1),
  reason: z.string().default(""),
  difficulty: z.enum(["easy", "medium", "hard"]).catch("easy"),
  message: z.string().default(""),
});

export const DictionarySchema = z.object({
  word: z.string().default(""),
  meaning: z.string().min(1),
  translation: z.string().default(""),
  example: z.string().default(""),
  contextual: z.boolean().default(true),
});

export const FlashcardSchema = z.object({
  title: z.string().default("Flashcards"),
  cards: z
    .array(
      z.object({
        concept: z.string().min(1),
        word: z.string().min(1),
        meaning: z.string().min(1),
        example: z.string().default(""),
        learningObjective: z.string().default(""),
      }),
    )
    .min(1)
    .max(12),
});

export const LocalizeSchema = z.object({
  items: z.array(z.object({ i: z.number().int().min(0), text: z.string() })).max(30),
});

export const StudioSchema = z.object({
  summary: z.string().min(1),
  steps: z.array(z.string()).max(8).default([]),
  examples: z.array(z.string()).max(4).default([]),
  takeaway: z.string().default(""),
  followUp: z.string().default(""),
});
