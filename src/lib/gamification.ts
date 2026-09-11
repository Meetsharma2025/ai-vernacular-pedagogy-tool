"use client";

// ─────────────────────────────────────────────────────────────────────────────
// GyanSetu gamification — stars (XP), levels and achievements for 5–8 year
// old learners. Stored on-device (localStorage) so rewards survive offline.
// Events bubble through a CustomEvent so the UI updates instantly.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";

const XP_KEY = "gyansetu-xp";
const ACH_KEY = "gyansetu-ach";
export const XP_EVENT = "gyansetu-xp-changed";

export interface Achievements {
  quizzes: number;
  perfect: number;
  cached: number;
  languages: string[];
  worksheets: number;
  flashcards: number;
}

export const LEVEL_STEP = 50;

function emptyAchievements(): Achievements {
  return { quizzes: 0, perfect: 0, cached: 0, languages: [], worksheets: 0, flashcards: 0 };
}

export function getXp(): number {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(XP_KEY) ?? "0") || 0;
}

export function addXp(n: number): number {
  if (typeof window === "undefined") return 0;
  const next = getXp() + n;
  try {
    window.localStorage.setItem(XP_KEY, String(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(XP_EVENT, { detail: { xp: next, gained: n } }));
  return next;
}

export function getAchievements(): Achievements {
  if (typeof window === "undefined") return emptyAchievements();
  try {
    const raw = window.localStorage.getItem(ACH_KEY);
    if (raw) return { ...emptyAchievements(), ...(JSON.parse(raw) as Partial<Achievements>) };
  } catch {
    /* ignore */
  }
  return emptyAchievements();
}

function saveAchievements(a: Achievements): void {
  try {
    window.localStorage.setItem(ACH_KEY, JSON.stringify(a));
  } catch {
    /* ignore */
  }
}

/** Quiz finished → stars + achievement counters. Returns stars gained. */
export function recordQuiz(score: number, total: number): number {
  const a = getAchievements();
  a.quizzes += 1;
  if (total > 0 && score === total) a.perfect += 1;
  saveAchievements(a);
  return addXp(10 + score * 2);
}

export function recordLanguage(lang: string): void {
  const a = getAchievements();
  if (!a.languages.includes(lang)) {
    a.languages.push(lang);
    saveAchievements(a);
  }
}

export function recordWorksheet(): number {
  const a = getAchievements();
  a.worksheets += 1;
  saveAchievements(a);
  return addXp(5);
}

export function recordFlashcards(): number {
  const a = getAchievements();
  a.flashcards += 1;
  saveAchievements(a);
  return addXp(5);
}

export function recordAsk(): number {
  return addXp(2);
}

export function recordBridge(): number {
  return addXp(1);
}

export function recordCachedUse(): void {
  const a = getAchievements();
  a.cached += 1;
  saveAchievements(a);
}

export function levelOf(xp: number): number {
  return Math.floor(xp / LEVEL_STEP) + 1;
}

export function progressInLevel(xp: number): number {
  return xp % LEVEL_STEP;
}

export interface AchievementDef {
  id: string;
  icon: string;
  earned: boolean;
}

export function listAchievements(): AchievementDef[] {
  const a = getAchievements();
  return [
    { id: "achQuiz", icon: "🎯", earned: a.quizzes >= 1 },
    { id: "achPerfect", icon: "💯", earned: a.perfect >= 1 },
    { id: "achThree", icon: "🏅", earned: a.quizzes >= 3 },
    { id: "achWS", icon: "📝", earned: a.worksheets >= 1 },
    { id: "achFC", icon: "🃏", earned: a.flashcards >= 1 },
    { id: "achExplorer", icon: "🧭", earned: a.cached >= 1 },
    { id: "achPolyglot", icon: "🌍", earned: a.languages.length >= 2 },
  ];
}

/** React hook — re-renders whenever stars change. */
export function useXp(): number {
  const [xp, setXp] = useState<number>(0);
  useEffect(() => {
    setXp(getXp());
    const handler = () => setXp(getXp());
    window.addEventListener(XP_EVENT, handler);
    return () => window.removeEventListener(XP_EVENT, handler);
  }, []);
  return xp;
}
