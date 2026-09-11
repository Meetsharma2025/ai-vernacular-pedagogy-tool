"use client";

// Small status-badge component for the Home page (kept here to avoid a
// circular import between app-shell and ui).
import { Badge } from "@/components/ui";
import type { AiStatus } from "@/components/providers";

export function StatusBadgeMark({
  ok,
  mode,
  status,
}: {
  ok: boolean;
  mode: "online" | "offline";
  status: AiStatus;
}) {
  if (mode === "offline") {
    return <Badge tone="slate">📴 OFFLINE — Local/Cached Engine</Badge>;
  }
  if (!status.configured) {
    return <Badge tone="rose">⚠️ Nemotron not configured — set OPENROUTER_API_KEY on the server</Badge>;
  }
  if (!status.verified) {
    return <Badge tone="amber">🧠 Nemotron configured — verification failed/timed out</Badge>;
  }
  return (
    <Badge tone="indigo">
      🧠 ONLINE — Nemotron 3 Ultra ✓
      {status.latencyMs > 0 ? ` • ${(status.latencyMs / 1000).toFixed(1)}s ping` : ""}
    </Badge>
  );
}
