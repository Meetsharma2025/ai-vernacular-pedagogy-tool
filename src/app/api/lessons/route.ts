import { NextRequest } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { lessons, worksheets } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const slug = req.nextUrl.searchParams.get("slug");
    const classParam = req.nextUrl.searchParams.get("class");
    const subject = req.nextUrl.searchParams.get("subject");

    if (slug) {
      const rows = await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1);
      if (!rows[0]) {
        return Response.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
      }
      const l = rows[0];
      return Response.json({
        ok: true,
        lesson: {
          ...l,
          keywords: l.keywords ?? [],
        },
      });
    }

    const conditions = [];
    if (classParam) conditions.push(eq(lessons.class, Number(classParam)));
    if (subject) conditions.push(eq(lessons.subject, subject));

    const rows =
      conditions.length > 0
        ? await db.select().from(lessons).where(and(...conditions)).orderBy(asc(lessons.id))
        : await db.select().from(lessons).orderBy(asc(lessons.id));

    return Response.json({
      ok: true,
      lessons: rows.map((l) => ({
        id: l.id,
        slug: l.slug,
        class: l.class,
        subject: l.subject,
        titleHi: l.titleHi,
        titleEn: l.titleEn,
        concept: l.concept,
        objective: l.objective,
        nipunOutcome: l.nipunOutcome,
        keywords: l.keywords ?? [],
        content: l.content,
      })),
    });
  } catch (e) {
    console.error("[gyansetu:lessons] error:", e);
    return Response.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

const SaveWorksheetSchema = z.object({
  lessonSlug: z.string().min(1).max(80),
  language: z.string().min(1).max(40),
  title: z.string().min(1).max(300),
  payload: z.record(z.string(), z.unknown()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SaveWorksheetSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
    }
    const rows = await db
      .insert(worksheets)
      .values({
        lessonSlug: parsed.data.lessonSlug,
        language: parsed.data.language,
        title: parsed.data.title,
        payload: parsed.data.payload,
      })
      .returning({ id: worksheets.id });
    return Response.json({ ok: true, id: rows[0]?.id ?? null });
  } catch (e) {
    console.error("[gyansetu:worksheets] save error:", e);
    return Response.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
