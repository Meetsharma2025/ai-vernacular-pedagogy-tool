// ─────────────────────────────────────────────────────────────────────────────
// Deterministic cache keys shared by the server (PostgreSQL persistence) and
// the client (IndexedDB offline cache). Same input → same key everywhere.
// ─────────────────────────────────────────────────────────────────────────────

export type GenerationKind =
  | "ask"
  | "translate"
  | "search"
  | "worksheet"
  | "quiz"
  | "flashcards"
  | "dictionary"
  | "localize"
  | "studio";

/** djb2 hash — stable across server and browser. */
export function hashInput(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

/** Hash of the semantic input of an op (lesson-based ops hash the lesson id). */
export function computeInputHash(kind: GenerationKind, input: string): string {
  return hashInput(`${kind}:${input.trim().toLowerCase()}`);
}

/** IndexedDB key under which a generation result is cached on-device. */
export function buildCacheKey(kind: GenerationKind, inputHash: string, language: string): string {
  return `aigc:${kind}:${inputHash}:${language}`;
}

export const CACHE_INDEX_KEY = "aigc:index";
