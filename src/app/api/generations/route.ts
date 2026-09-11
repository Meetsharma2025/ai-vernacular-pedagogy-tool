import { NextRequest } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { aiGenerations } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/generations — re-downloadable Nemotron generation history.
// When a device goes ONLINE, it pulls these rows into IndexedDB so the
// generated content remains available for OFFLINE research and usage.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const kind = req.nextUrl.searchParams.get("kind");
    const language = req.nextUrl.searchParams.get("language");
    const limitRaw = Number(req.nextUrl.searchParams.get("limit") ?? "60");
    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 60, 1), 200);

    const rows = await db
      .select({
        id: aiGenerations.id,
        kind: aiGenerations.kind,
        inputHash: aiGenerations.inputHash,
        language: aiGenerations.language,
        lessonSlug: aiGenerations.lessonSlug,
        studentKey: aiGenerations.studentKey,
        payload: aiGenerations.payload,
        createdAt: aiGenerations.createdAt,
      })
      .from(aiGenerations)
      .orderBy(desc(aiGenerations.id))
      .limit(limit);

    const filtered = rows.filter((r) => (!kind || r.kind === kind) && (!language || r.language === language));

    return Response.json({
      ok: true,
      count: filtered.length,
      rows: filtered,
    });
  } catch (e) {
    console.error("[gyansetu:generations] error:", e);
    return Response.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
