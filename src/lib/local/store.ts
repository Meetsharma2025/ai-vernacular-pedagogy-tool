// ─────────────────────────────────────────────────────────────────────────────
// Minimal IndexedDB store used by the OFFLINE mode for lesson cache and
// local progress. Falls back to memory when IndexedDB is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

import { CACHE_INDEX_KEY } from "@/lib/cache-key";

const DB_NAME = "gyansetu";
const STORE = "kv";

let memoryStore: Record<string, unknown> = {};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

export async function idbPut(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("idb write failed"));
    });
  } catch {
    memoryStore[key] = value; // graceful fallback
  }
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDb();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => reject(req.error ?? new Error("idb read failed"));
    });
  } catch {
    return (memoryStore[key] as T) ?? null;
  }
}

export async function idbDelete(key: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    delete memoryStore[key];
  }
}

// ── AI generation cache (Nemotron output stored for offline use) ────────────
// Every ONLINE Nemotron result is cached here; sync() pulls the full history
// from PostgreSQL into this cache so offline mode can replay it.

export async function cachePut(key: string, value: unknown): Promise<void> {
  await idbPut(key, value);
  const index = (await idbGet<string[]>(CACHE_INDEX_KEY)) ?? [];
  if (!index.includes(key)) {
    index.push(key);
    await idbPut(CACHE_INDEX_KEY, index);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  return idbGet<T>(key);
}

export async function cacheCount(): Promise<number> {
  const index = (await idbGet<string[]>(CACHE_INDEX_KEY)) ?? [];
  return index.length;
}

export async function cacheClear(): Promise<void> {
  const index = (await idbGet<string[]>(CACHE_INDEX_KEY)) ?? [];
  for (const key of index) await idbDelete(key);
  await idbDelete(CACHE_INDEX_KEY);
}

// ── Offline progress queue (🔄 synchronization) ─────────────────────────────
// Quiz results saved while offline are queued in IndexedDB and pushed to the
// server later when ONLINE mode is selected.

export interface QueuedProgress {
  id: string;
  body: Record<string, unknown>;
  at: number;
}

const PENDING_KEY = "pending-progress";

export async function enqueueProgress(body: Record<string, unknown>): Promise<void> {
  const list = (await idbGet<QueuedProgress[]>(PENDING_KEY)) ?? [];
  list.push({
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    body,
    at: Date.now(),
  });
  await idbPut(PENDING_KEY, list);
}

export async function readPendingProgress(): Promise<QueuedProgress[]> {
  return (await idbGet<QueuedProgress[]>(PENDING_KEY)) ?? [];
}

export async function clearPendingProgress(ids: string[]): Promise<void> {
  const list = await readPendingProgress();
  await idbPut(
    PENDING_KEY,
    list.filter((q) => !ids.includes(q.id)),
  );
}
