"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Browser speech helpers: SpeechRecognition (STT) and speechSynthesis (TTS).
// SIH fallback chain: voice fails → typed input (UI handles that).
// TTS uses the nearest available voice for tribal languages (hi-IN).
// ─────────────────────────────────────────────────────────────────────────────
import { getLanguage, type LanguageCode } from "@/lib/languages";

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

function getRecognition(lang: string): SpeechRecognitionLike | null {
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionLike)
    | undefined;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = lang;
  rec.interimResults = false;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  return rec;
}

export function startSpeechInput(
  lang: LanguageCode,
  onResult: (text: string) => void,
  onEnd: () => void,
): { stop: () => void } | null {
  const def = getLanguage(lang);
  const rec = getRecognition(def.ttsLang);
  if (!rec) return null;
  rec.onresult = (e) => {
    const first = e.results?.[0];
    if (first?.[0]?.transcript) onResult(first[0].transcript);
  };
  rec.onend = () => onEnd();
  rec.onerror = () => onEnd();
  try {
    rec.start();
  } catch {
    return null;
  }
  return { stop: () => rec.stop() };
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeaking(): void {
  if (!isTtsSupported()) return;
  window.speechSynthesis.cancel();
  activeUtterance = null;
}

export function speak(
  text: string,
  lang: LanguageCode,
  onEnd?: () => void,
): void {
  if (!isTtsSupported() || !text) return;
  const def = getLanguage(lang);
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = def.ttsLang;

  const voices = window.speechSynthesis.getVoices();
  const exact = voices.find((v) => v.lang?.toLowerCase() === def.ttsLang.toLowerCase());
  const prefix = def.ttsLang.split("-")[0];
  const near = voices.find((v) => v.lang?.toLowerCase().startsWith(prefix));
  if (exact) u.voice = exact;
  else if (near) u.voice = near;

  u.rate = 0.92;
  if (onEnd) u.onend = onEnd;
  activeUtterance = u;
  window.speechSynthesis.speak(u);
}

export const TTS_LIMIT = 5000; // chars per utterance for stability
