// ─────────────────────────────────────────────────────────────────────────────
// Client-side AI facade. Every feature calls runAiOp(op, payload, mode):
//   ONLINE  → POST /api/ai (server → Nemotron 3 Ultra)
//   OFFLINE → local deterministic engine (no network at all)
// The result ALWAYS carries engine metadata so the UI can show the true
// execution path (🧠 Nemotron vs 📴 Offline).
// ─────────────────────────────────────────────────────────────────────────────
import type {
  AiApiResponse,
  AiOpName,
  AskPayload,
  AskResult,
  DictionaryPayload,
  DictionaryResult,
  FlashcardsPayload,
  FlashcardsResult,
  QuizPayload,
  QuizResult,
  RecommendPayload,
  RecommendResult,
  SearchPayload,
  SearchResult,
  StatusResult,
  TranslatePayload,
  TranslateResult,
  WorksheetPayload,
  WorksheetResult,
} from "@/lib/ai/types";
import type { LanguageCode } from "@/lib/languages";
import {
  offlineAnswer,
  offlineDictionary,
  offlineFlashcards,
  offlineQuiz,
  offlineRecommend,
  offlineSearchResult,
  offlineTranslate,
  offlineWorksheet,
  getLesson,
} from "@/lib/local/engine";
import {
  cacheCount,
  cacheGet,
  cachePut,
  clearPendingProgress,
  enqueueProgress,
  readPendingProgress,
} from "@/lib/local/store";
import {
  buildCacheKey,
  computeInputHash,
  hashInput,
  type GenerationKind,
} from "@/lib/cache-key";
import { CURRICULUM } from "@/lib/curriculum";
import { translateUi, UI_SYNC_KEYS } from "@/lib/i18n";

export type AiMode = "online" | "offline";

export interface OpResult<T> {
  ok: boolean;
  data?: T;
  friendly?: string;
}

const REQUEST_TIMEOUT_MS = 60_000;

/**
 * Cacheable ops: their Nemotron results are stored on-device (IndexedDB) and
 * in PostgreSQL, then replayed offline. Ops not listed (status, recommend)
 * always run live/local.
 */
const CACHEABLE_OPS: AiOpName[] = ["ask", "translate", "search", "worksheet", "quiz", "flashcards", "dictionary", "studio"];

function cacheKeyForOp(op: AiOpName, payload: Record<string, unknown>): string | null {
  const p = payload as Record<string, unknown>;
  const language = String(p.language ?? p.studentLanguage ?? "hi");
  switch (op) {
    case "ask":
      return buildCacheKey("ask", computeInputHash("ask", String(p.question ?? "")), language);
    case "translate":
      return buildCacheKey("translate", computeInputHash("translate", String(p.text ?? "")), language);
    case "search":
      return buildCacheKey("search", computeInputHash("search", String(p.query ?? "")), language);
    case "worksheet":
    case "quiz":
    case "flashcards": {
      const lessonId = String(p.lessonId ?? "");
      return buildCacheKey(op, computeInputHash(op, lessonId), language);
    }
    case "dictionary":
      return buildCacheKey("dictionary", computeInputHash("dictionary", String(p.query ?? "")), language);
    case "studio":
      return buildCacheKey("studio", computeInputHash("studio", String(p.contentId ?? "")), language);
    default:
      return null;
  }
}

async function serverCall<T>(op: AiOpName, payload: unknown): Promise<OpResult<T>> {
  // Client-side auto-retry: the free Nemotron tier suffers short 503 bursts
  // that can outlast the server's own retry cycle. One silent retry makes
  // the AI features reliable enough for live demonstration.
  let lastFailure: OpResult<T> | null = null;
  const ATTEMPTS = 3;
  const RETRY_DELAYS = [2000, 4000];
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op, payload }),
        signal: controller.signal,
      });
      const json = (await res.json()) as AiApiResponse<T>;
      if (json.ok) {
        // Persist the Nemotron result on-device for offline reuse.
        if (CACHEABLE_OPS.includes(op)) {
          const key = cacheKeyForOp(op, payload as Record<string, unknown>);
          if (key) void cachePut(key, json.data).catch(() => undefined);
        }
        return { ok: true, data: json.data };
      }
      // Deterministic errors (bad input) are returned immediately;
      // transient AI unavailability is retried with a short pause.
      if (json.code !== "AI_UNAVAILABLE" || attempt === ATTEMPTS - 1) {
        return { ok: false, friendly: json.friendly };
      }
      lastFailure = { ok: false, friendly: json.friendly };
    } catch {
      lastFailure = {
        ok: false,
        friendly: "AI is temporarily unavailable. Please try again.",
      };
    } finally {
      clearTimeout(timer);
    }
    await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt] ?? 4000));
  }
  return lastFailure ?? { ok: false, friendly: "AI is temporarily unavailable. Please try again." };
}

/** Replay a cached Nemotron result (honestly labeled) before falling back to
 *  the deterministic local engine. */
async function cachedResult<T>(op: AiOpName, payload: Record<string, unknown>): Promise<T | null> {
  const key = cacheKeyForOp(op, payload);
  if (!key) return null;
  const stored = await cacheGet<T & { mode?: string }>(key);
  if (!stored) return null;
  return {
    ...stored,
    mode: "offline",
    cached: true,
    note: "Cached Nemotron answer from an earlier online session.",
  } as T;
}

async function localDispatch<T>(op: AiOpName, payload: Record<string, unknown>): Promise<OpResult<T>> {
  // 1) Cache-first: replay Nemotron answers stored from earlier online use.
  const cached = await cachedResult<T>(op, payload);
  if (cached) return { ok: true, data: cached };

  // 2) Deterministic offline engine — everything stays on the device.
  await new Promise((r) => setTimeout(r, 40)); // tiny delay so UI shows loading state
  try {
    switch (op) {
      case "status": {
        const data: StatusResult = {
          engine: "local",
          provider: "none",
          model: "local-pedagogy-engine",
          latencyMs: 1,
          mode: "offline",
          configured: false,
          verified: false,
        };
        return { ok: true, data: data as unknown as T };
      }
      case "ask": {
        const p = payload as unknown as AskPayload;
        const lesson = p.lessonId ? getLesson(p.lessonId) : undefined;
        void lesson;
        return {
          ok: true,
          data: offlineAnswer(p.question, p.studentLanguage, p.grade) as unknown as T,
        };
      }
      case "translate": {
        const p = payload as unknown as TranslatePayload;
        return {
          ok: true,
          data: offlineTranslate(p.text, p.teacherLanguage, p.studentLanguage) as unknown as T,
        };
      }
      case "search": {
        const p = payload as unknown as SearchPayload;
        const result = offlineSearchResult(p.query, p.class);
        if (!result) return { ok: false, friendly: "No matching lesson found offline." };
        return { ok: true, data: result as unknown as T };
      }
      case "worksheet": {
        const p = payload as unknown as WorksheetPayload;
        const lesson = getLesson(p.lessonId);
        if (!lesson) return { ok: false, friendly: "Lesson not found in offline pack." };
        return {
          ok: true,
          data: offlineWorksheet(lesson, p.language, p.difficulty) as unknown as T,
        };
      }
      case "quiz": {
        const p = payload as unknown as QuizPayload;
        const lesson = getLesson(p.lessonId);
        if (!lesson) return { ok: false, friendly: "Lesson not found in offline pack." };
        return {
          ok: true,
          data: offlineQuiz(lesson, p.language, p.count ?? 4) as unknown as T,
        };
      }
      case "recommend": {
        const p = payload as unknown as RecommendPayload & {
          history?: Array<{ lessonSlug: string; score: number; total: number }>;
        };
        return {
          ok: true,
          data: offlineRecommend(p.history ?? [], p.language) as unknown as T,
        };
      }
      case "dictionary": {
        const p = payload as unknown as DictionaryPayload;
        const result = offlineDictionary(p.query, p.language);
        if (!result) {
          return {
            ok: false,
            friendly: "Word not found in offline dictionary. Switch to Online AI for contextual meaning.",
          };
        }
        return { ok: true, data: result as unknown as T };
      }
      case "flashcards": {
        const p = payload as unknown as FlashcardsPayload;
        const lesson = getLesson(p.lessonId);
        if (!lesson) return { ok: false, friendly: "Lesson not found in offline pack." };
        return {
          ok: true,
          data: offlineFlashcards(lesson, p.language, p.count ?? 6) as unknown as T,
        };
      }
      case "studio":
        // Studio content offline: no Nemotron — return friendly guidance.
        return {
          ok: false,
          friendly: "Uploaded lesson content needs ONLINE AI for adaptation.",
        };
      default:
        return { ok: false, friendly: "Unknown operation." };
    }
  } catch {
    return { ok: false, friendly: "Offline engine could not answer this." };
  }
}

export async function runAiOp<T>(
  op: AiOpName,
  payload: Record<string, unknown>,
  mode: AiMode,
): Promise<OpResult<T>> {
  if (mode === "offline") return localDispatch<T>(op, payload);
  return serverCall<T>(op, payload);
}

/** Fast helpers for data routes (lessons/progress) — used in both modes. */
const LESSONS_CACHE = "lessons-cache";

/** Bundled curriculum as the final offline fallback (zero connectivity). */
function bundledLessons(): unknown[] {
  return CURRICULUM.map((l) => ({
    slug: l.slug,
    class: l.class,
    subject: l.subject,
    titleHi: l.titleHi,
    titleEn: l.titleEn,
    concept: l.concept,
    objective: l.objective,
    nipunOutcome: l.nipunOutcome,
    keywords: l.keywords,
    content: {
      explanationHi: l.explanationHi,
      explanationEn: l.explanationEn,
      examplesHi: l.examplesHi,
      examplesEn: l.examplesEn,
    },
  }));
}

export async function getLessons(): Promise<OpResult<unknown[]>> {
  try {
    const res = await fetch("/api/lessons", { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; lessons?: unknown[] };
    if (json.ok && json.lessons) {
      void cachePut(LESSONS_CACHE, json.lessons).catch(() => undefined);
      return { ok: true, data: json.lessons };
    }
    return { ok: false, friendly: "Lessons unavailable." };
  } catch {
    // Offline: synced IndexedDB copy first, bundled curriculum as last resort.
    const cached = await cacheGet<unknown[]>(LESSONS_CACHE);
    if (cached?.length) return { ok: true, data: cached };
    return { ok: true, data: bundledLessons() };
  }
}

export async function getProgress(studentKey: string): Promise<OpResult<unknown[]>> {
  try {
    const res = await fetch(`/api/progress?studentKey=${encodeURIComponent(studentKey)}`, {
      cache: "no-store",
    });
    const json = (await res.json()) as { ok: boolean; progress?: unknown[] };
    return json.ok && json.progress ? { ok: true, data: json.progress } : { ok: false, friendly: "Progress unavailable." };
  } catch {
    return { ok: false, friendly: "Progress unavailable right now." };
  }
}

export async function saveProgress(body: {
  studentKey: string;
  lessonSlug: string;
  score: number;
  total: number;
  wrong: string[];
  details?: Record<string, unknown>;
}): Promise<OpResult<{ id: number | null }>> {
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { ok: boolean; id?: number | null };
    return json.ok ? { ok: true, data: { id: json.id ?? null } } : { ok: false, friendly: "Could not save progress." };
  } catch {
    return { ok: false, friendly: "Could not save progress right now." };
  }
}

export async function saveWorksheet(body: {
  lessonSlug: string;
  language: string;
  title: string;
  payload: Record<string, unknown>;
}): Promise<OpResult<{ id: number | null }>> {
  try {
    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { ok: boolean; id?: number | null };
    return json.ok ? { ok: true, data: { id: json.id ?? null } } : { ok: false, friendly: "Could not save worksheet." };
  } catch {
    return { ok: false, friendly: "Could not save worksheet right now." };
  }
}

// ── Offline → online synchronization (🔄) ────────────────────────────────────
// Progress records queued in IndexedDB while offline are pushed to the server
// when the app is back in ONLINE mode. Returns counts for the UI.

export async function getPendingCount(): Promise<number> {
  const list = await readPendingProgress();
  return list.length;
}

export async function syncOfflineProgress(): Promise<{ synced: number; failed: number }> {
  const pending = await readPendingProgress();
  if (!pending.length) return { synced: 0, failed: 0 };
  let synced = 0;
  const okIds: string[] = [];
  for (const q of pending) {
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q.body),
      });
      const json = (await res.json()) as { ok: boolean };
      if (json.ok) {
        synced++;
        okIds.push(q.id);
      }
    } catch {
      /* keep in queue */
    }
  }
  await clearPendingProgress(okIds);
  return { synced, failed: pending.length - synced };
}

/** Save progress: server first; on failure (or offline) queue locally for sync. */
export async function saveProgressWithFallback(body: {
  studentKey: string;
  lessonSlug: string;
  score: number;
  total: number;
  wrong: string[];
  details?: Record<string, unknown>;
}): Promise<{ savedTo: "server" | "queue" | "failed" }> {
  const res = await saveProgress(body);
  if (res.ok) return { savedTo: "server" };
  await enqueueProgress(body as unknown as Record<string, unknown>);
  return { savedTo: "queue" };
}

// ── AI data synchronization (server → device) ────────────────────────────────
// Pulls the full Nemotron generation history from PostgreSQL into IndexedDB,
// making it available for offline research and usage.

interface GenerationRow {
  kind: string;
  inputHash: string;
  language: string;
  payload: Record<string, unknown>;
}

export async function syncGenerations(): Promise<{ pulled: number; total: number }> {
  try {
    const res = await fetch("/api/generations?limit=200", { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; count?: number; rows?: GenerationRow[] };
    if (!json.ok || !json.rows) return { pulled: 0, total: 0 };
    let pulled = 0;
    for (const row of json.rows) {
      if (!["ask", "translate", "search", "worksheet", "quiz", "flashcards", "dictionary"].includes(row.kind)) {
        continue;
      }
      // Server rows store an envelope {input, result} — unwrap to the bare
      // result so it matches what the online call cached locally.
      const stored = row.payload && typeof row.payload === "object" && "result" in row.payload
        ? (row.payload as { result: unknown }).result
        : row.payload;
      const key = buildCacheKey(row.kind as GenerationKind, row.inputHash, row.language);
      await cachePut(key, stored);
      pulled++;
    }
    return { pulled, total: json.count ?? json.rows.length };
  } catch {
    return { pulled: 0, total: 0 };
  }
}

export async function getCacheCount(): Promise<number> {
  return cacheCount();
}

// ── Upload Studio + class content ────────────────────────────────────────────

export interface ClassContentItem {
  id: string;
  title: string;
  kind: string;
  lessonSlug: string | null;
  author: string;
  content: string;
  payload: Record<string, unknown>;
  createdAt: string;
  excerpt: string;
}

const CONTENT_CACHE = "content-cache";

export async function fetchClassContent(): Promise<OpResult<ClassContentItem[]>> {
  try {
    const res = await fetch("/api/studio", { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; items?: ClassContentItem[] };
    if (json.ok && json.items) {
      void cachePut(CONTENT_CACHE, json.items).catch(() => undefined);
      return { ok: true, data: json.items };
    }
    return { ok: false, friendly: "Content unavailable." };
  } catch {
    const cached = await cacheGet<ClassContentItem[]>(CONTENT_CACHE);
    if (cached?.length) return { ok: true, data: cached };
    return { ok: false, friendly: "Content unavailable — sync once while online." };
  }
}

export async function publishContent(form: FormData): Promise<OpResult<{ id: number | null }>> {
  try {
    const res = await fetch("/api/studio", { method: "POST", body: form });
    const json = (await res.json()) as { ok: boolean; id?: number | null };
    return json.ok ? { ok: true, data: { id: json.id ?? null } } : { ok: false, friendly: "Publish failed. Please try again." };
  } catch {
    return { ok: false, friendly: "Publish failed right now." };
  }
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  total: number;
  attempts: number;
  pct: number;
}

const BOARD_CACHE = "leaderboard-cache";

export async function fetchLeaderboard(): Promise<OpResult<LeaderboardEntry[]>> {
  try {
    const res = await fetch("/api/leaderboard", { cache: "no-store" });
    const json = (await res.json()) as { ok: boolean; entries?: LeaderboardEntry[] };
    if (json.ok && json.entries) {
      void cachePut(BOARD_CACHE, json.entries).catch(() => undefined);
      return { ok: true, data: json.entries };
    }
    return { ok: false, friendly: "Leaderboard unavailable." };
  } catch {
    const cached = await cacheGet<LeaderboardEntry[]>(BOARD_CACHE);
    if (cached?.length) return { ok: true, data: cached };
    return { ok: false, friendly: "Leaderboard unavailable — sync once while online." };
  }
}

// ── FULL MANUAL SYNC (online → offline) ──────────────────────────────────────
// One button downloads EVERYTHING needed offline:
//   1. curriculum lessons        → IndexedDB
//   2. Nemotron generation history → IndexedDB (answers replay offline)
//   3. teacher's class content   → IndexedDB
//   4. class leaderboard         → IndexedDB
//   5. the whole UI chrome in the selected tribal language → pre-translated
//      by Nemotron 3 Ultra and cached (pgtr:*) for offline rendering
//   6. queued offline progress records → uploaded to PostgreSQL

export interface SyncSummary {
  lessons: number;
  aiResults: number;
  posts: number;
  leaderboard: number;
  uiStrings: number;
  uploaded: number;
}

export function getLastSyncTime(): number {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem("gyansetu-last-sync") ?? "0") || 0;
}

function setLastSyncTime(t: number): void {
  try {
    window.localStorage.setItem("gyansetu-last-sync", String(t));
  } catch {
    /* ignore */
  }
}

/** Nemotron pre-translates the whole UI chrome for the selected language. */
export async function syncUiTranslations(lang: LanguageCode): Promise<number> {
  if (lang === "hi" || lang === "en") return 0;
  const texts = UI_SYNC_KEYS.map((k) => translateUi(lang, k));
  let done = 0;
  // Batch of ≤20 per localize call.
  for (let offset = 0; offset < texts.length; offset += 20) {
    const batch = texts.slice(offset, offset + 20);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "localize", payload: { texts: batch, language: lang } }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        data?: { items?: Array<{ i: number; text: string }> };
      };
      if (json.ok && json.data?.items) {
        for (const it of json.data.items) {
          if (it.i < batch.length && it.text?.trim()) {
            const src = batch[it.i];
            const key = `pgtr:${lang}:${hashInput(src.trim().toLowerCase())}`;
            await cachePut(key, it.text);
            done++;
          }
        }
      }
    } catch {
      /* continue with remaining batches */
    }
  }
  return done;
}

export async function runFullSync(lang: LanguageCode): Promise<OpResult<SyncSummary>> {
  try {
    const [l, c, b] = await Promise.all([getLessons(), fetchClassContent(), fetchLeaderboard()]);
    const g = await syncGenerations();
    const p = await syncOfflineProgress();
    const ui = await syncUiTranslations(lang);
    if (!l.ok || !c.ok || !b.ok) {
      return { ok: false, friendly: "Sync failed — please check the connection." };
    }
    setLastSyncTime(Date.now());
    return {
      ok: true,
      data: {
        lessons: l.data?.length ?? 0,
        aiResults: g.pulled,
        posts: c.data?.length ?? 0,
        leaderboard: b.data?.length ?? 0,
        uiStrings: ui,
        uploaded: p.synced,
      },
    };
  } catch {
    return { ok: false, friendly: "Sync failed — please check the connection." };
  }
}
