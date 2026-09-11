// ─────────────────────────────────────────────────────────────────────────────
// Upload Studio API — teachers publish content (text / PDF / txt file / link /
// generated worksheet / flashcards). Students see it in My Class and Nemotron
// converts it into their language on view.
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { teacherContent } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getLesson } from "@/lib/curriculum";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  try {
    await ensureSeeded();
    const rows = await db
      .select({
        id: teacherContent.id,
        title: teacherContent.title,
        kind: teacherContent.kind,
        lessonSlug: teacherContent.lessonSlug,
        author: teacherContent.author,
        content: teacherContent.content,
        payload: teacherContent.payload,
        createdAt: teacherContent.createdAt,
      })
      .from(teacherContent)
      .orderBy(desc(teacherContent.id))
      .limit(30);

    return Response.json({
      ok: true,
      items: rows.map((r) => ({
        id: String(r.id),
        title: r.title,
        kind: r.kind,
        lessonSlug: r.lessonSlug,
        author: r.author,
        content: r.content ?? "",
        payload: r.payload ?? {},
        createdAt: r.createdAt,
        excerpt: (r.content ?? r.title).slice(0, 160),
      })),
    });
  } catch (e) {
    console.error("[gyansetu:studio] list error:", e);
    return Response.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const title = String(form.get("title") ?? "").trim().slice(0, 300);
    const kind = String(form.get("kind") ?? "text").slice(0, 40);
    const lessonSlug = String(form.get("lessonSlug") ?? "").slice(0, 80) || null;
    const author = String(form.get("author") ?? "शिक्षक").slice(0, 80);
    if (!title) {
      return Response.json({ ok: false, error: "TITLE_REQUIRED" }, { status: 400 });
    }

    let content = String(form.get("text") ?? "").trim().slice(0, 6000);

    // ── Link: fetch server-side and extract readable text ──
    if (kind === "link") {
      const url = String(form.get("url") ?? "").trim();
      if (!/^https?:\/\//i.test(url)) {
        return Response.json({ ok: false, error: "BAD_URL" }, { status: 400 });
      }
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        const raw = await res.text();
        content = stripHtml(raw).slice(0, 6000);
      } catch {
        content = `${title}\n(सामग्री लिंक से नहीं पढ़ी जा सकी — बाद में पुनः प्रयास करें।)`;
      }
    }

    // ── File: txt/md read directly, PDF parsed server-side ──
    if (kind === "file") {
      const file = form.get("file") as File | null;
      if (!file) {
        return Response.json({ ok: false, error: "FILE_REQUIRED" }, { status: 400 });
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      const name = file.name.toLowerCase();
      if (name.endsWith(".pdf")) {
        try {
          const mod = (await import("pdf-parse")) as unknown as { default?: unknown; parse?: unknown };
          const fn = (mod.default ?? mod.parse) as ((buf: Buffer) => Promise<{ text?: string }>);
          const parsed = await fn(bytes);
          content = String(parsed.text ?? "").replace(/\s+/g, " ").slice(0, 6000);
        } catch (e) {
          console.error("[gyansetu:studio] pdf parse failed:", e);
          content = `${title}\n(PDF पढ़ा नहीं जा सका — पाठ सीधे टाइप करें या txt फ़ाइल अपलोड करें।)`;
        }
      } else {
        content = bytes.toString("utf-8").slice(0, 6000);
      }
    }

    // ── Published worksheet / flashcards payloads ──
    let payload: Record<string, unknown> = {};
    const payloadRaw = String(form.get("payload") ?? "");
    if (payloadRaw) {
      try {
        payload = JSON.parse(payloadRaw) as Record<string, unknown>;
      } catch {
        /* ignore */
      }
    }
    if (kind === "worksheet" || kind === "flashcards") {
      content = content || title;
    }

    const lesson = lessonSlug ? getLesson(lessonSlug) : undefined;
    void lesson;

    const rows = await db
      .insert(teacherContent)
      .values({
        title,
        kind,
        lessonSlug,
        author,
        content,
        payload,
      })
      .returning({ id: teacherContent.id });

    return Response.json({ ok: true, id: rows[0]?.id ?? null });
  } catch (e) {
    console.error("[gyansetu:studio] create error:", e);
    return Response.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
