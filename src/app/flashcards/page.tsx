"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 🃏 Flashcards — localized + gamified flip-card deck for 5–8 year olds.
// Nemotron generates card CONTENT (never images/code); the UI renders it.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useLangs, useMode } from "@/components/providers";
import { getLessons, publishContent, runAiOp } from "@/lib/api";
import type { FlashcardsResult } from "@/lib/ai/types";
import { getLanguage, LANGUAGE_LIST, type LanguageCode } from "@/lib/languages";
import { makeT } from "@/lib/i18n";
import { recordFlashcards } from "@/lib/gamification";
import { Badge, Button, Card, EngineBadge, FriendlyError, Select, Spinner } from "@/components/ui";
import { AwardChip, GyanuBubble } from "@/components/gamification";
import { isTtsSupported, speak } from "@/components/speech";
import { useLocalized } from "@/lib/pageLocalize";

interface LessonRow {
  slug: string;
  class: number;
  subject: string;
  titleHi: string;
  titleEn: string;
}

export default function FlashcardsPage() {
  const { mode } = useMode();
  const { studentLanguage, setStudentLanguage } = useLangs();
  const t = makeT(studentLanguage);
  const langDef = getLanguage(studentLanguage);
  const pageTitle = useLocalized(t("flashcards"), studentLanguage);
  const pageSub = useLocalized(t("fcSub", { lang: langDef.name }), studentLanguage);

  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [lessonId, setLessonId] = useState("");
  const [count, setCount] = useState(6);
  const [result, setResult] = useState<FlashcardsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [award, setAward] = useState(0);
  const [seen, setSeen] = useState<number[]>([]);

  useEffect(() => {
    void getLessons().then((res) => {
      if (res.ok && Array.isArray(res.data)) {
        const rows = res.data as LessonRow[];
        setLessons(rows);
        if (rows[0]) setLessonId(rows[0].slug);
      }
    });
  }, []);

  const generate = async () => {
    if (!lessonId || loading) return;
    setLoading(true);
    setError("");
    setIndex(0);
    setFlipped(false);
    setSeen([]);
    setAward(0);
    const res = await runAiOp<FlashcardsResult>(
      "flashcards",
      { lessonId, language: studentLanguage, count },
      mode,
    );
    if (res.ok && res.data) {
      setResult(res.data);
      if (!res.data.cached) setAward(recordFlashcards());
    } else {
      setError(res.friendly ?? "Flashcard generation failed. Please try again.");
    }
    setLoading(false);
  };

  const flip = () => {
    if (!flipped && !seen.includes(index)) setSeen((s) => [...s, index]);
    setFlipped((f) => !f);
  };

  const [published, setPublished] = useState(false);

  const publish = async () => {
    if (!result) return;
    const form = new FormData();
    form.set("title", `${result.title} (${langDef.name})`);
    form.set("kind", "flashcards");
    form.set("lessonSlug", lessonId);
    form.set("text", result.title);
    form.set("payload", JSON.stringify(result));
    const res = await publishContent(form);
    if (res.ok) setPublished(true);
  };

  const card = result?.cards[index];
  const total = result?.cards.length ?? 0;

  return (
    <div className="gs-animate space-y-4">
      <header>
        <h1 className="text-2xl font-black text-indigo-900">{pageTitle}</h1>
        <p className="text-sm text-slate-500">
          {pageSub} {mode === "online" ? t("fcSubOnline") : t("fcSubOffline")}
        </p>
      </header>

      <Card className="border-indigo-100">
        <div className="flex flex-wrap items-end gap-3">
          <Select
            value={lessonId}
            onChange={setLessonId}
            options={lessons.map((l) => ({ value: l.slug, label: `${l.titleHi} (Class ${l.class})` }))}
            label="Lesson"
            className="min-w-56"
          />
          <Select
            value={studentLanguage}
            onChange={(v) => setStudentLanguage(v as LanguageCode)}
            options={LANGUAGE_LIST.map((l) => ({ value: l.code, label: l.nativeName }))}
            label={t("learningLang")}
          />
          <Select
            value={String(count)}
            onChange={(v) => setCount(Number(v))}
            options={[3, 4, 5, 6, 8, 10].map((n) => ({ value: String(n), label: `${n} ${t("fcLabel")}` }))}
            label={t("fcLabel")}
          />
          <Button onClick={() => void generate()} disabled={loading || !lessonId}>
            {loading ? <Spinner label="" /> : t("generate")}
          </Button>
          {award > 0 && <AwardChip xp={award} label={t("fcAward").split("+")[0]} />}
        </div>
      </Card>

      {error && <FriendlyError message={error} />}

      {result && card && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <EngineBadge meta={result} />
            <Badge tone="sky">{result.title}</Badge>
            <Badge tone="slate">
              {index + 1} / {total}
            </Badge>
            <Badge tone="amber">👀 {seen.length}/{total}</Badge>
            <button
              onClick={() => void publish()}
              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
            >
              {published ? t("publishedNote") : t("publishClass")}
            </button>
          </div>

          <div
            className="cursor-pointer select-none rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/60 p-8 shadow-lg transition hover:shadow-xl"
            onClick={flip}
            role="button"
            aria-label={t("flip")}
          >
            {!flipped ? (
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">{card.concept}</p>
                <p className="mt-3 text-4xl font-black text-slate-900">{card.word}</p>
                <p className="mt-4 text-xs text-slate-400">{t("fcFlipHint")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-500">{t("meaning")}</p>
                <p className="text-base font-semibold text-slate-800">{card.meaning}</p>
                {card.example && (
                  <div className="rounded-xl bg-emerald-50/70 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">{t("example")}</p>
                    <p className="text-sm text-slate-700">{card.example}</p>
                  </div>
                )}
                {card.learningObjective && (
                  <p className="text-[11px] text-slate-400">
                    {t("objective")}: {card.learningObjective}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button variant="ghost" onClick={() => { setIndex((i) => (i - 1 + total) % total); setFlipped(false); }}>
              {t("prev")}
            </Button>
            <Button variant="soft" onClick={flip}>
              {t("flip")}
            </Button>
            {isTtsSupported() && (
              <Button variant="soft" onClick={() => speak(`${card.word}। ${card.meaning}`, studentLanguage)}>
                {t("readAloud")}
              </Button>
            )}
            <Button variant="ghost" onClick={() => { setIndex((i) => (i + 1) % total); setFlipped(false); }}>
              {t("next")}
            </Button>
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-400">
          <GyanuBubble text={t("fcEmpty", { lang: langDef.name })} />
        </div>
      )}
    </div>
  );
}
