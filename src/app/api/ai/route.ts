// ─────────────────────────────────────────────────────────────────────────────
// GyanSetu centralized AI API. Every online AI feature routes through this
// one endpoint → orchestrator → Nemotron 3 Ultra (server-side only).
// The OPENROUTER_API_KEY never leaves this server process.
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest } from "next/server";
import { z } from "zod";
import { isLanguageCode, type LanguageCode } from "@/lib/languages";
import {
  getAiStatus,
  runAsk,
  runTranslate,
  runSearch,
  runWorksheet,
  runQuiz,
  runRecommend,
  runDictionary,
  runFlashcards,
  runLocalize,
  runStudio,
} from "@/lib/ai/orchestrator";
import { NemotronUnavailableError } from "@/lib/ai/nemotron-client";
import type { AiApiResponse } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const lang = () => z.custom<LanguageCode>(isLanguageCode);

const RequestSchema = z.object({
  op: z.enum([
    "status",
    "ask",
    "translate",
    "search",
    "worksheet",
    "quiz",
    "recommend",
    "dictionary",
    "flashcards",
    "localize",
    "studio",
  ]),
  payload: z.record(z.string(), z.unknown()).default({}),
});

const flashcardsPayloadSchema = z.object({
  lessonId: z.string().min(1).max(80),
  language: lang(),
  count: z.number().int().min(3).max(10).optional(),
});

const localizePayloadSchema = z.object({
  texts: z.array(z.string().min(1).max(300)).min(1).max(20),
  language: lang(),
});

const studioPayloadSchema = z.object({
  contentId: z.string().min(1).max(120),
  content: z.string().min(1).max(6000),
  title: z.string().min(1).max(300),
  kind: z.string().min(1).max(40),
  language: lang(),
});

const askPayloadSchema = z.object({
  question: z.string().min(1).max(1500),
  studentLanguage: lang(),
  teacherLanguage: lang().optional(),
  grade: z.number().int().min(1).max(8).optional(),
  subject: z.string().max(40).optional(),
  lessonId: z.string().max(80).optional(),
});

const translatePayloadSchema = z.object({
  text: z.string().min(1).max(2000),
  teacherLanguage: lang(),
  studentLanguage: lang(),
  grade: z.number().int().min(1).max(8).optional(),
  lessonContext: z.record(z.string(), z.unknown()).optional(),
});

const searchPayloadSchema = z.object({
  query: z.string().min(1).max(500),
  class: z.number().int().min(1).max(8).optional(),
  studentLanguage: lang(),
});

const worksheetPayloadSchema = z.object({
  lessonId: z.string().min(1).max(80),
  language: lang(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  questionCount: z.number().int().min(2).max(10).optional(),
});

const quizPayloadSchema = z.object({
  lessonId: z.string().min(1).max(80),
  language: lang(),
  count: z.number().int().min(2).max(8).optional(),
  performance: z
    .object({
      previousScore: z.number().min(0).max(100).optional(),
      wrongConcepts: z.array(z.string().max(120)).max(10).optional(),
    })
    .optional(),
});

const recommendPayloadSchema = z.object({
  studentKey: z.string().min(1).max(120),
  language: lang(),
  class: z.number().int().min(1).max(8).optional(),
});

const dictionaryPayloadSchema = z.object({
  query: z.string().min(1).max(300),
  language: lang(),
});

function err(code: string, friendly: string, status = 200): Response {
  return Response.json(
    { ok: false, code, friendly } satisfies AiApiResponse<never>,
    { status },
  );
}

export async function GET() {
  try {
    const status = await getAiStatus({});
    return Response.json({ ok: true, data: status });
  } catch (e) {
    console.error("[gyansetu:ai] status error:", e);
    return err("AI_UNAVAILABLE", "AI is temporarily unavailable. Please try again.", 503);
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("BAD_REQUEST", "Request could not be read.");
  }

  const parsedRequest = RequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return err("BAD_REQUEST", "Request format is not valid.");
  }
  const { op, payload } = parsedRequest.data;

  try {
    switch (op) {
      case "status":
        return Response.json({ ok: true, data: await getAiStatus({}) });
      case "ask": {
        const p = askPayloadSchema.parse(payload);
        return Response.json({ ok: true, data: await runAsk(p) });
      }
      case "translate": {
        const p = translatePayloadSchema.parse(payload);
        return Response.json({ ok: true, data: await runTranslate(p) });
      }
      case "search": {
        const p = searchPayloadSchema.parse(payload);
        return Response.json({ ok: true, data: await runSearch(p) });
      }
      case "worksheet": {
        const p = worksheetPayloadSchema.parse(payload);
        return Response.json({ ok: true, data: await runWorksheet(p) });
      }
      case "quiz": {
        const p = quizPayloadSchema.parse(payload);
        return Response.json({ ok: true, data: await runQuiz(p) });
      }
      case "recommend": {
        const p = recommendPayloadSchema.parse(payload);
        return Response.json({ ok: true, data: await runRecommend(p) });
      }
      case "dictionary": {
        const p = dictionaryPayloadSchema.parse(payload);
        return Response.json({ ok: true, data: await runDictionary(p) });
      }
      case "flashcards": {
        const p = flashcardsPayloadSchema.parse(payload);
        return Response.json({ ok: true, data: await runFlashcards(p) });
      }
      case "localize": {
        const p = localizePayloadSchema.parse(payload);
        return Response.json({ ok: true, data: await runLocalize(p) });
      }
      case "studio": {
        const p = studioPayloadSchema.parse(payload);
        return Response.json({ ok: true, data: await runStudio(p) });
      }
      default:
        return err("UNKNOWN_OP", "Unknown AI operation.");
    }
  } catch (e) {
    // Children never see raw errors. Details are logged server-side only.
    if (e instanceof NemotronUnavailableError) {
      console.error("[gyansetu:ai] Nemotron unavailable:", e.message);
      return err("AI_UNAVAILABLE", "AI is temporarily unavailable. Please try again.", 503);
    }
    if (e instanceof z.ZodError) {
      return err("BAD_REQUEST", "Please check your input and try again.");
    }
    console.error("[gyansetu:ai] unexpected error:", e);
    return err("AI_ERROR", "AI is temporarily unavailable. Please try again.", 500);
  }
}
