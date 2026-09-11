import { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { progress, worksheets } from "@/db/schema";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ProgressSchema = z.object({
  studentKey: z.string().min(1).max(120),
  lessonSlug: z.string().min(1).max(80),
  score: z.number().int().min(0).max(1000),
  total: z.number().int().min(1).max(1000),
  wrong: z.array(z.string().max(200)).max(30).default([]),
  details: z.record(z.string(), z.unknown()).default({}),
});

export async function GET(req: NextRequest) {
  try {
    const studentKey = req.nextUrl.searchParams.get("studentKey") ?? "";
    const rows = studentKey
      ? await db
          .select()
          .from(progress)
          .where(eq(progress.studentKey, studentKey))
          .orderBy(desc(progress.createdAt))
          .limit(100)
      : await db.select().from(progress).orderBy(desc(progress.createdAt)).limit(20);

    const savedWorksheets = studentKey
      ? []
      : await db.select().from(worksheets).orderBy(desc(worksheets.createdAt)).limit(10);

    return Response.json({
      ok: true,
      progress: rows.map((r) => ({
        id: r.id,
        studentKey: r.studentKey,
        lessonSlug: r.lessonSlug,
        score: r.score,
        total: r.total,
        wrong: r.wrong ?? [],
        details: r.details ?? {},
        createdAt: r.createdAt,
      })),
      savedWorksheets: savedWorksheets.map((w) => ({
        id: w.id,
        lessonSlug: w.lessonSlug,
        language: w.language,
        title: w.title,
        createdAt: w.createdAt,
      })),
    });
  } catch (e) {
    console.error("[gyansetu:progress] error:", e);
    return Response.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ProgressSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
    }
    const rows = await db
      .insert(progress)
      .values({
        studentKey: parsed.data.studentKey,
        lessonSlug: parsed.data.lessonSlug,
        score: parsed.data.score,
        total: parsed.data.total,
        wrong: parsed.data.wrong,
        details: parsed.data.details,
      })
      .returning({ id: progress.id });
    return Response.json({ ok: true, id: rows[0]?.id ?? null });
  } catch (e) {
    console.error("[gyansetu:progress] save error:", e);
    return Response.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
