// ─────────────────────────────────────────────────────────────────────────────
// Class leaderboard — aggregated from REAL quiz progress rows in PostgreSQL.
// ─────────────────────────────────────────────────────────────────────────────
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSeeded();
    const result = await db.execute(
      sql`
        select student_key,
               sum(score)::int as score,
               sum(total)::int as total,
               count(*)::int as attempts
        from progress
        group by student_key
        order by case when sum(total) > 0 then sum(score)::float / sum(total) else 0 end desc,
                 sum(score) desc
        limit 10
      `,
    );

    const entries = result.rows.map((r, idx) => {
      const raw = String(r.student_key ?? "");
      const name = raw.startsWith("student:") ? raw.slice("student:".length) : raw;
      return {
        rank: idx + 1,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        score: Number(r.score ?? 0),
        total: Number(r.total ?? 0),
        attempts: Number(r.attempts ?? 0),
        pct: Number(r.total ?? 0) > 0 ? Math.round((Number(r.score) / Number(r.total)) * 100) : 0,
      };
    });

    return Response.json({ ok: true, entries });
  } catch (e) {
    console.error("[gyansetu:leaderboard] error:", e);
    return Response.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
