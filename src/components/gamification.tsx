"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Playful, pedagogy-first components for 5–8 year old learners:
// mascot bubble, star bar, stars, confetti celebration, achievement grid.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import { useLangs } from "@/components/providers";
import { makeT } from "@/lib/i18n";
import {
  LEVEL_STEP,
  levelOf,
  listAchievements,
  progressInLevel,
  useXp,
} from "@/lib/gamification";
import { Badge } from "@/components/ui";

/** Friendly mascot with a speech bubble. */
export function GyanuBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-orange-200 text-2xl shadow-inner">
        🐘
      </span>
      <div className="relative rounded-2xl rounded-tl-sm bg-gradient-to-br from-indigo-50 to-sky-50 px-3 py-2 text-xs font-semibold text-indigo-900 shadow-sm">
        {text}
      </div>
    </div>
  );
}

/** Compact XP pill for the header: 🐘 ⭐123 • Lv3 */
export function XpPill() {
  const xp = useXp();
  const { studentLanguage } = useLangs();
  const t = makeT(studentLanguage);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-1 text-[11px] font-black text-amber-700 shadow-sm"
      title={`${t("xpLabel")}: ${xp}`}
    >
      ⭐ {xp}
      <span className="text-amber-400">•</span>
      {t("levelLabel")} {levelOf(xp)}
    </span>
  );
}

/** Big star + level card used on Home/Progress. */
export function XpCard() {
  const xp = useXp();
  const { studentLanguage } = useLangs();
  const t = makeT(studentLanguage);
  const level = levelOf(xp);
  const inLevel = progressInLevel(xp);
  const pct = Math.round((inLevel / LEVEL_STEP) * 100);
  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-300 text-3xl shadow">
          🐘
        </span>
        <div className="flex-1">
          <p className="text-xs font-bold text-amber-700">
            {t("mascotHi")} — {t("levelLabel")} {level}
          </p>
          <p className="text-lg font-black text-slate-900">
            ⭐ {xp} <span className="text-xs font-semibold text-slate-500">{t("xpLabel")}</span>
          </p>
        </div>
      </div>
      <div className="mt-3">
        <div className="h-3 overflow-hidden rounded-full bg-white/80 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
            style={{ width: `${Math.max(pct, 4)}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] font-semibold text-amber-600">
          {t("xpToNext")}: {LEVEL_STEP - inLevel} ⭐
        </p>
      </div>
    </div>
  );
}

/** Star rating display (filled/empty). */
export function Stars({ count, total }: { count: number; total: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-lg leading-none">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={i < count ? "" : "opacity-25 grayscale"}>
          ⭐
        </span>
      ))}
    </span>
  );
}

/** Confetti celebration overlay (auto-hides). */
export function Celebration({ show, emojis }: { show: boolean; emojis?: string[] }) {
  const [pieces] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.6 + Math.random() * 1.4,
      size: 16 + Math.random() * 16,
      emoji: (emojis ?? ["🎉", "⭐", "🌟", "🎈", "🎊"])[Math.floor(Math.random() * (emojis?.length ?? 5))],
    })),
  );
  if (!show) return null;
  return (
    <div className="gs-confetti pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

/** Achievement grid (earned = colorful, locked = grey). */
export function AchievementGrid() {
  const { studentLanguage } = useLangs();
  const t = makeT(studentLanguage);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const handler = () => setRefresh((r) => r + 1);
    window.addEventListener("gyansetu-xp-changed", handler);
    return () => window.removeEventListener("gyansetu-xp-changed", handler);
  }, []);
  const items = useMemo(() => listAchievements(), [refresh]); // eslint-disable-line react-hooks/exhaustive-deps
  const labels: Record<string, string> = {
    achQuiz: t("achQuiz"),
    achPerfect: t("achPerfect"),
    achThree: t("achThree"),
    achWS: t("achWS"),
    achFC: t("achFC"),
    achExplorer: t("achExplorer"),
    achPolyglot: t("achPolyglot"),
  };
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {items.map((a) => (
        <div
          key={a.id}
          className={`flex flex-col items-center rounded-xl border p-2 text-center ${
            a.earned
              ? "border-amber-200 bg-amber-50 shadow-sm"
              : "border-slate-200 bg-slate-50 opacity-45 grayscale"
          }`}
          title={labels[a.id]}
        >
          <span className="text-xl">{a.icon}</span>
          <span className="mt-1 text-[9px] font-bold leading-tight text-slate-600">
            {labels[a.id]}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Inline award chip: ⭐ +n */
export function AwardChip({ xp, label }: { xp: number; label?: string }) {
  return (
    <Badge tone="amber" className="gs-pop">
      {label ?? "⭐"} +{xp}
    </Badge>
  );
}
