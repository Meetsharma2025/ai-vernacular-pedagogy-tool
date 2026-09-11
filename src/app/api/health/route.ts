import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getNemotronConfig, getNvidiaKeys, getOpenRouterKeys } from "@/lib/ai/nemotron-client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    const cfg = getNemotronConfig();
    const openRouterKeys = getOpenRouterKeys().length;
    const nvidiaKeys = getNvidiaKeys().length;
    return Response.json({
      ok: true,
      db: true,
      ai: {
        configured: cfg.configured,
        provider: cfg.provider,
        model: cfg.model,
        // counts only — never the keys themselves
        openRouterKeys,
        nvidiaKeys,
      },
    });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
