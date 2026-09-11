"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Worksheets — fully localized + gamified (stars for generating, answer key,
// print-ready). Nemotron generates; results persist to PostgreSQL + IndexedDB.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useLangs, useMode } from "@/components/providers";
import { getLessons, publishContent, runAiOp, saveWorksheet } from "@/lib/api";
import type { WorksheetResult } from "@/lib/ai/types";
import { getLanguage, LANGUAGE_LIST, type LanguageCode } from "@/lib/languages";
import { makeT } from "@/lib/i18n";
import { recordWorksheet } from "@/lib/gamification";
import { Badge, Button, Card, EngineBadge, FriendlyError, RichText, Select, Spinner } from "@/components/ui";
import { AwardChip, GyanuBubble } from "@/components/gamification";
import { isTtsSupported, speak } from "@/components/speech";
import { useLocalized } from "@/lib/pageLocalize";

interface LessonRow {
  slug: string;
  class: number;
  subject: string;
  titleHi: string;
  titleEn: string;
  concept: string;
  objective: string;
  nipunOutcome: string;
}

export default function WorksheetsPage() {
  const { mode } = useMode();
  const { studentLanguage, setStudentLanguage } = useLangs();
  const t = makeT(studentLanguage);
  const langDef = getLanguage(studentLanguage);
  const pageTitle = useLocalized(t("worksheets"), studentLanguage);
  const pageSub = useLocalized(t("wsSub", { lang: langDef.name }), studentLanguage);

  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [lessonId, setLessonId] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [count, setCount] = useState(6);
  const [result, setResult] = useState<WorksheetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [savedNote, setSavedNote] = useState("");
  const [award, setAward] = useState(0);

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
    setSavedNote("");
    setAward(0);
    const res = await runAiOp<WorksheetResult>(
      "worksheet",
      { lessonId, language: studentLanguage, difficulty, questionCount: count },
      mode,
    );
    if (res.ok && res.data) {
      setResult(res.data);
      if (!res.data.cached) setAward(recordWorksheet());
    } else {
      setError(res.friendly ?? "Worksheet generation failed. Please try again.");
    }
    setLoading(false);
  };

  const save = async () => {
    if (!result) return;
    const res = await saveWorksheet({
      lessonSlug: lessonId,
      language: langDef.name,
      title: result.title,
      payload: result as unknown as Record<string, unknown>,
    });
    setSavedNote(res.ok ? t("wsSaved") : t("wsSaveFail"));
  };

  const publish = async () => {
    if (!result) return;
    const form = new FormData();
    form.set("title", `${result.title} (${langDef.name})`);
    form.set("kind", "worksheet");
    form.set("lessonSlug", lessonId);
    form.set("text", result.title);
    form.set("payload", JSON.stringify(result));
    const res = await publishContent(form);
    setSavedNote(res.ok ? t("publishedNote") : t("wsSaveFail"));
  };

  const typeLabel = (tp: string) =>
    tp === "mcq" ? t("wsTypeMcq") : tp === "fill" ? t("wsTypeFill") : t("wsTypeShort");

  return (
    <div className="gs-animate space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-indigo-900">{pageTitle}</h1>
          <p className="text-sm text-slate-500">{pageSub}</p>
        </div>
      </header>

      <Card className="border-indigo-100">
        <div className="flex flex-wrap items-end gap-3">
          <Select
            value={lessonId}
            onChange={setLessonId}
            options={lessons.map((l) => ({ value: l.slug, label: `${l.titleHi} (Class ${l.class} • ${l.subject})` }))}
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
            value={difficulty}
            onChange={(v) => setDifficulty(v as "easy" | "medium" | "hard")}
            options={[
              { value: "easy", label: `${t("easy")} — आसान` },
              { value: "medium", label: `${t("medium")} — मध्यम` },
              { value: "hard", label: `${t("hard")} — कठिन` },
            ]}
            label={t("difficulty")}
          />
          <Select
            value={String(count)}
            onChange={(v) => setCount(Number(v))}
            options={[3, 4, 5, 6, 8, 10].map((n) => ({ value: String(n), label: `${n} ${t("questions")}` }))}
            label={t("questions")}
          />
          <Button onClick={() => void generate()} disabled={loading || !lessonId}>
            {loading ? <Spinner label="" /> : t("generate")}
          </Button>
          {award > 0 && <AwardChip xp={award} label={t("wsAward").split("+")[0]} />}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          {mode === "online" ? t("wsInfoOnline") : t("wsInfoOffline")}
        </p>
      </Card>

      {error && <FriendlyError message={error} />}

      {result && (
        <Card className="gs-print-card print:shadow-none" title={`📄 ${result.title}`}>
          <div className="gs-no-print mb-3 flex flex-wrap items-center gap-2">
            <EngineBadge meta={result} />
            <Badge tone="sky">{result.language || langDef.name}</Badge>
            <Badge tone="slate">{result.questions.length} {t("questions")}</Badge>
            <button className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-200" onClick={() => setShowAnswers((s) => !s)}>
              {showAnswers ? t("hideAnswers") : t("showAnswers")}
            </button>
            <button className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200" onClick={() => window.print()}>
              {t("print")}
            </button>
            <Button variant="soft" className="px-3 py-1 text-xs" onClick={() => void save()}>
              {t("save")}
            </Button>
            <Button variant="success" className="px-3 py-1 text-xs" onClick={() => void publish()}>
              {t("publishClass")}
            </Button>
            {savedNote && <span className="text-xs text-emerald-700">{savedNote}</span>}
          </div>

          <div className="mb-4 rounded-xl bg-indigo-50/60 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-500">{t("objective")}</p>
            <p className="text-sm font-medium text-slate-700">{result.learningObjective}</p>
            <p className="mt-1 text-xs text-slate-500">{result.instructions}</p>
          </div>

          <div className="space-y-3">
            {result.questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-bold text-slate-800">
                  {i + 1}. {q.question}
                  <span className="ml-2 align-middle text-[10px] font-semibold uppercase text-slate-400">
                    ({typeLabel(q.type)})
                  </span>
                </p>
                {q.options && q.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.options.map((opt, oi) => (
                      <span key={oi} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                        {String.fromCharCode(97 + oi)}) {opt}
                      </span>
                    ))}
                  </div>
                )}
                {!q.options?.length && <div className="mt-2 border-b border-dotted border-slate-300 pb-4" />}
                {showAnswers && (
                  <p className="mt-2 text-xs text-emerald-700">
                    {t("wsAnsLabel")} <b>{q.answer}</b>
                    {q.explanation && <span className="text-slate-500"> — {q.explanation}</span>}
                  </p>
                )}
                {isTtsSupported() && !showAnswers && (
                  <button onClick={() => speak(q.question, studentLanguage)} className="mt-2 text-[11px] font-semibold text-indigo-500 hover:underline">
                    {t("readAloud")}
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {!result && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-400">
          <GyanuBubble text={t("wsEmpty", { lang: langDef.name })} />
        </div>
      )}
    </div>
  );
}
