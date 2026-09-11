"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Whole-page Nemotron localization. When the student selects a tribal language
// (Santhali/Ho/Maithili/Mundari), every registered page string is translated
// by Nemotron in ONE batched call, cached in IndexedDB, and swapped into the
// UI. Hindi/English are native and skipped.
// Teacher → Nemotron → Student, applied to the page chrome itself.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { hashInput } from "@/lib/cache-key";
import type { LanguageCode } from "@/lib/languages";
import { cacheGet, cachePut } from "@/lib/local/store";

export const PGT_EVENT = "gyansetu-page-translated";

interface Pending {
  id: string;
  source: string;
}

const queue: Pending[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let inFlight = false;

const keyFor = (lang: LanguageCode, id: string) => `pgtr:${lang}:${id}`;

async function flush(lang: LanguageCode): Promise<void> {
  if (inFlight || !queue.length) return;
  const batch = queue.splice(0, 20);
  inFlight = true;
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        op: "localize",
        payload: { texts: batch.map((b) => b.source), language: lang },
      }),
    });
    const json = (await res.json()) as {
      ok: boolean;
      data?: { items?: Array<{ i: number; text: string }> };
    };
    if (json.ok && json.data?.items) {
      const map = new Map<number, string>(json.data.items.map((it) => [it.i, it.text]));
      for (let idx = 0; idx < batch.length; idx++) {
        const item = batch[idx];
        const text = map.get(idx);
        if (text && text.trim()) {
          void cachePut(keyFor(lang, item.id), text).catch(() => undefined);
          window.dispatchEvent(
            new CustomEvent(PGT_EVENT, { detail: { id: item.id, text, lang } }),
          );
        }
      }
    }
  } catch {
    /* stay on fallback strings */
  } finally {
    inFlight = false;
    if (queue.length) scheduleFlush(lang);
  }
}

function scheduleFlush(lang: LanguageCode): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void flush(lang), 350);
}

function enqueue(lang: LanguageCode, source: string): string {
  const id = hashInput(source.trim().toLowerCase());
  queue.push({ id, source });
  scheduleFlush(lang);
  return id;
}

/**
 * useLocalized(source, lang)
 *  - hi/en: returns source unchanged.
 *  - tribal: shows source immediately (Hindi fallback), then swaps to the
 *    Nemotron translation once the batch completes (cached thereafter).
 */
export function useLocalized(source: string, lang: LanguageCode): string {
  const [text, setText] = useState(source);

  useEffect(() => {
    if (lang === "hi" || lang === "en") {
      setText(source);
      return;
    }
    let alive = true;
    const id = hashInput(source.trim().toLowerCase());
    const key = keyFor(lang, id);

    void (async () => {
      const cached = await cacheGet<string>(key);
      if (cached) {
        if (alive) setText(cached);
        return;
      }
      enqueue(lang, source);
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail as { id: string; text: string; lang: string };
        if (detail.id === id && detail.lang === lang && alive) setText(detail.text);
      };
      window.addEventListener(PGT_EVENT, handler);
      setTimeout(() => {
        window.removeEventListener(PGT_EVENT, handler);
      }, 120_000);
    })();

    return () => {
      alive = false;
    };
  }, [source, lang]);

  return text;
}
