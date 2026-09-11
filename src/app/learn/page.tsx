"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Learn / सीखो — fully localized + gamified for 5–8 year old learners.
// Semantic search → lesson → AI explanation → game quiz (stars + confetti).
// ─────────────────────────────────────────────────────────────────────────────
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLangs, useMode, useUser } from "@/components/providers";
import { getLessons, runAiOp, saveProgressWithFallback } from "@/lib/api";
import type { AskResult, QuizResult, SearchResult } from "@/lib/ai/types";
import { CURRICULUM, type LessonSeed } from "@/lib/curriculum";
import { getLanguage, LANGUAGE_LIST, type LanguageCode } from "@/lib/languages";
import { makeT } from "@/lib/i18n";
import { useLocalized } from "@/lib/pageLocalize";
import { recordQuiz } from "@/lib/gamification";
import {
  Badge,
  Button,
  Card,
  EngineBadge,
  FriendlyError,
  OutputActions,
  RichText,
  Select,
  Spinner,
} from "@/components/ui";
import { AwardChip, Celebration, GyanuBubble, Stars } from "@/components/gamification";
import { isTtsSupported, speak, stopSpeaking } from "@/components/speech";

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

type Tab = "lesson" | "explain" | "quiz";

/** Lesson card with Nemotron-localized objective (whole-page translation). */
function LessonCard({
  l,
  studentLanguage,
  onOpen,
}: {
  l: LessonRow;
  studentLanguage: LanguageCode;
  onOpen: (l: LessonRow) => void;
}) {
  const t = makeT(studentLanguage);
  const objective = useLocalized(l.objective, studentLanguage);
  return (
    <button
      onClick={() => onOpen(l)}
      className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <Badge tone={l.subject === "Hindi" ? "rose" : l.subject === "Math" ? "emerald" : "sky"}>
          {t("classLabel")} {l.class} • {l.subject}
        </Badge>
        <span className="text-lg">{l.subject === "Hindi" ? "📖" : l.subject === "Math" ? "🔢" : "🌿"}</span>
      </div>
      <h3 className="mt-2 text-base font-black text-slate-900">{l.titleHi}</h3>
      <p className="text-xs font-semibold text-slate-400">{l.titleEn}</p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{objective}</p>
    </button>
  );
}

function LearnPage() {
  const searchParams = useSearchParams();
  const { mode } = useMode();
  const { studentLanguage, setStudentLanguage } = useLangs();
  const { studentKey, name } = useUser();
  const t = makeT(studentLanguage);
  const langDef = getLanguage(studentLanguage);
  const pageTitle = useLocalized(t("learn"), studentLanguage);
  const pageSub = useLocalized(t("learnSub"), studentLanguage);

  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [selected, setSelected] = useState<LessonRow | null>(null);
  const [tab, setTab] = useState<Tab>("lesson");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState("");
  const [explain, setExplain] = useState<AskResult | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState("");
  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizDone, setQuizDone] = useState(false);
  const [savedNote, setSavedNote] = useState("");
  const [speakingText, setSpeakingText] = useState("");
  const [score, setScore] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [praise, setPraise] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void getLessons().then((res) => {
      if (res.ok && Array.isArray(res.data)) {
        const rows = res.data as LessonRow[];
        setLessons(rows);
        const slugParam = searchParams.get("lesson");
        if (slugParam) {
          const found = rows.find((l) => l.slug === slugParam) ?? null;
          if (found) setSelected(found);
        }
      }
    });
  }, [searchParams]);

  useEffect(() => () => stopSpeaking(), []);

  const seed = useMemo<LessonSeed | undefined>(
    () => (selected ? CURRICULUM.find((l) => l.slug === selected.slug) : undefined),
    [selected],
  );

  const filtered = useMemo(() => {
    let rows = lessons;
    if (classFilter) rows = rows.filter((l) => String(l.class) === classFilter);
    if (subjectFilter) rows = rows.filter((l) => l.subject === subjectFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(
        (l) =>
          l.titleHi.toLowerCase().includes(q) ||
          l.titleEn.toLowerCase().includes(q) ||
          l.concept.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [lessons, classFilter, subjectFilter, query]);

  const runSearch = async (q: string) => {
    const txt = q.trim();
    if (!txt) {
      setSearchResult(null);
      return;
    }
    setSearching(true);
    setSearchError("");
    setSearchResult(null);
    const res = await runAiOp<SearchResult>(
      "search",
      { query: txt, studentLanguage, class: classFilter ? Number(classFilter) : undefined },
      mode,
    );
    if (res.ok && res.data) {
      setSearchResult(res.data);
      const found = lessons.find((l) => l.slug === res.data?.selectedLessonId);
      if (found) {
        setSelected(found);
        setTab("lesson");
        setQuery("");
      }
    } else {
      setSearchError(res.friendly ?? "Search failed. Please try again.");
    }
    setSearching(false);
  };

  const onQueryChange = (v: string) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!v.trim()) return;
    debounceRef.current = setTimeout(() => {
      if (v.trim().length >= 3) void runSearch(v);
    }, 600);
  };

  const openLesson = (l: LessonRow) => {
    setSelected(l);
    setTab("lesson");
    setExplain(null);
    setQuiz(null);
    setQuizDone(false);
    setAnswers({});
    setSavedNote("");
    setCelebrate(false);
  };

  const runExplain = async () => {
    if (!selected) return;
    setExplainLoading(true);
    setExplainError("");
    const res = await runAiOp<AskResult>(
      "ask",
      {
        question: seed
          ? `इस पाठ "${seed.titleHi}" को सरल शब्दों में समझाओ। ${seed.concept} क्या है?`
          : `इस पाठ "${selected.titleHi}" को सरल शब्दों में समझाओ।`,
        studentLanguage,
        grade: selected.class,
        subject: selected.subject,
        lessonId: selected.slug,
      },
      mode,
    );
    if (res.ok && res.data) setExplain(res.data);
    else setExplainError(res.friendly ?? "AI is temporarily unavailable. Please try again.");
    setExplainLoading(false);
  };

  const runQuiz = async () => {
    if (!selected) return;
    setQuizLoading(true);
    setQuizError("");
    setQuiz(null);
    setQuizDone(false);
    setAnswers({});
    setCelebrate(false);
    const res = await runAiOp<QuizResult>(
      "quiz",
      { lessonId: selected.slug, language: studentLanguage, count: 4 },
      mode,
    );
    if (res.ok && res.data) setQuiz(res.data);
    else setQuizError(res.friendly ?? "Quiz generation failed. Please try again.");
    setQuizLoading(false);
  };

  const finishQuiz = async () => {
    if (!quiz || !selected) return;
    let sc = 0;
    const wrong: string[] = [];
    quiz.questions.forEach((q, i) => {
      if ((answers[i] ?? "").trim() === q.answer.trim()) sc++;
      else wrong.push(q.question);
    });
    setScore(sc);
    setQuizDone(true);
    const stars = recordQuiz(sc, quiz.questions.length);
    setStarsEarned(stars);
    setCelebrate(true);
    setPraise(
      sc === quiz.questions.length ? t("perfect") : sc >= Math.ceil(quiz.questions.length / 2) ? t("great") : t("good"),
    );
    if (name) {
      const { savedTo } = await saveProgressWithFallback({
        studentKey,
        lessonSlug: selected.slug,
        score: sc,
        total: quiz.questions.length,
        wrong: wrong.slice(0, 10),
        details: { subject: selected.subject, class: selected.class, engine: mode },
      });
      setSavedNote(
        savedTo === "server" ? t("savedServer") : savedTo === "queue" ? t("savedQueue") : t("savedFail"),
      );
    } else {
      setSavedNote(t("loginNote"));
    }
  };

  const speakText = (text: string) => {
    setSpeakingText(text);
    speak(text, studentLanguage, () => setSpeakingText(""));
  };

  if (selected) {
    return (
      <div className="gs-animate space-y-4">
        <Celebration show={celebrate} />
        <button onClick={() => setSelected(null)} className="text-sm font-semibold text-indigo-600 hover:underline">
          {t("backAll")}
        </button>
        <Card
          icon="📖"
          title={`${selected.titleHi} — ${selected.titleEn}`}
          subtitle={`${t("classLabel")} ${selected.class} • ${selected.subject} • ${selected.concept}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="slate">NIPUN: {selected.nipunOutcome}</Badge>
            <Select
              compact
              value={studentLanguage}
              onChange={(v) => setStudentLanguage(v as LanguageCode)}
              options={LANGUAGE_LIST.map((l) => ({ value: l.code, label: l.nativeName }))}
              label={t("learningLang")}
            />
          </div>
          <div className="mt-3 flex gap-2 border-b border-slate-100 pb-2">
            {(["lesson", "explain", "quiz"] as Tab[]).map((tb) => (
              <button
                key={tb}
                onClick={() => setTab(tb)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  tab === tb ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tb === "lesson" ? t("tabLesson") : tb === "explain" ? t("tabExplain") : t("tabQuiz")}
              </button>
            ))}
          </div>
        </Card>

        {tab === "lesson" && seed && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title={t("hindiCurric")} className="border-rose-100">
              <RichText text={seed.explanationHi} className="text-base leading-7" />
              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-rose-400">{t("examplesHi")}</p>
                {seed.examplesHi.map((e, i) => (
                  <div key={i} className="rounded-xl bg-rose-50/60 p-2.5 text-sm text-slate-700">✏️ {e}</div>
                ))}
              </div>
              {isTtsSupported() && (
                <OutputActions text={seed.explanationHi} onSpeak={(tx) => speak(tx, "hi", undefined)} speaking={speakingText === seed.explanationHi} />
              )}
            </Card>
            <Card title={t("englishRef")} className="border-sky-100">
              <RichText text={seed.explanationEn} />
              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-sky-400">{t("examplesEn")}</p>
                {seed.examplesEn.map((e, i) => (
                  <div key={i} className="rounded-xl bg-sky-50/60 p-2.5 text-sm text-slate-700">✏️ {e}</div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "explain" && (
          <Card
            title={t("explainCardTitle", { lang: `${langDef.name} (${langDef.nativeName})` })}
            subtitle={mode === "online" ? t("explainSubOnline") : t("explainSubOffline")}
          >
            {!explain && !explainLoading && !explainError && (
              <div className="py-6 text-center">
                <GyanuBubble text={t("explainInvite", { lang: langDef.name })} />
                <Button className="mt-3" onClick={() => void runExplain()}>
                  {t("explainBtn", { lang: langDef.name })}
                </Button>
              </div>
            )}
            {explainLoading && (
              <div className="flex flex-col items-center gap-2 py-8">
                <Spinner label={mode === "online" ? t("explainThinkOnline") : t("explainThinkOffline")} />
              </div>
            )}
            {explainError && <FriendlyError message={explainError} />}
            {explain && (
              <div className="space-y-3">
                <EngineBadge meta={explain} />
                <div className="rounded-xl bg-indigo-50/70 p-3">
                  <RichText text={explain.answer} className="text-base" />
                </div>
                {explain.explanation && <RichText text={explain.explanation} />}
                {explain.steps.length > 0 && (
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
                    {explain.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                )}
                {explain.localExample && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">{t("example")}</p>
                    <RichText text={explain.localExample} />
                  </div>
                )}
                {explain.takeaway && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">{t("takeaway")}</p>
                    <RichText text={explain.takeaway} />
                  </div>
                )}
                {isTtsSupported() && (
                  <OutputActions
                    text={[explain.answer, explain.explanation, explain.localExample].join("\n")}
                    onSpeak={speakText}
                    speaking={speakingText === explain.answer}
                  />
                )}
              </div>
            )}
          </Card>
        )}

        {tab === "quiz" && (
          <Card
            title={t("quizCardTitle", { title: selected.titleHi })}
            subtitle={mode === "online" ? t("quizSubOnline") : t("quizSubOffline")}
          >
            {!quiz && !quizLoading && !quizError && (
              <div className="py-6 text-center">
                <GyanuBubble text={t("quizInvite")} />
                <Button className="mt-3" onClick={() => void runQuiz()}>
                  {t("quizBtn", { lang: langDef.name })}
                </Button>
              </div>
            )}
            {quizLoading && (
              <div className="flex flex-col items-center gap-2 py-8">
                <Spinner label={mode === "online" ? t("quizThinkOnline") : t("quizThinkOffline")} />
              </div>
            )}
            {quizError && <FriendlyError message={quizError} />}
            {quiz && (
              <div className="space-y-4">
                <EngineBadge meta={quiz} />
                {quiz.questions.map((q, i) => {
                  const correct = (answers[i] ?? "").trim() === q.answer.trim();
                  return (
                    <div key={i} className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm font-bold text-slate-800">
                        {i + 1}. {q.question}
                      </p>
                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {q.options.map((opt) => {
                          const chosen = answers[i] === opt;
                          const show = quizDone;
                          return (
                            <button
                              key={opt}
                              disabled={quizDone}
                              onClick={() => setAnswers((prev) => ({ ...prev, [i]: opt }))}
                              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                                show && opt === q.answer
                                  ? "border-emerald-400 bg-emerald-50 font-semibold text-emerald-800"
                                  : show && chosen
                                    ? "border-rose-400 bg-rose-50 text-rose-700"
                                    : chosen
                                      ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              {opt}
                              {show && opt === q.answer && " ✓"}
                              {show && chosen && opt !== q.answer && " ✗"}
                            </button>
                          );
                        })}
                      </div>
                      {quizDone && <p className="mt-2 text-xs text-slate-500">💡 {q.explanation || q.answer}</p>}
                    </div>
                  );
                })}
                {!quizDone ? (
                  <Button onClick={() => void finishQuiz()} disabled={Object.keys(answers).length < quiz.questions.length}>
                    {t("submitQuiz")}
                  </Button>
                ) : (
                  <div className="gs-pop space-y-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center">
                    <p className="text-xl font-black text-amber-700">{praise}</p>
                    <Stars count={score} total={quiz.questions.length} />
                    <p className="text-sm font-bold text-slate-700">
                      {t("scoreLine")} {score}/{quiz.questions.length}
                    </p>
                    <p className="text-xs font-semibold text-amber-600">
                      {t("earnedStars")} {starsEarned} ⭐
                    </p>
                    <p className="text-xs text-slate-500">{savedNote}</p>
                    <div className="flex justify-center gap-2">
                      <Button variant="soft" onClick={() => void runQuiz()}>
                        {t("tryAgain")}
                      </Button>
                      <Link href="/progress" className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-2 text-sm font-semibold text-white">
                        {t("progress")} →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    );
  }

  // ── Lesson browser ──
  return (
    <div className="gs-animate space-y-4">
      <header>
        <h1 className="text-2xl font-black text-indigo-900">{pageTitle}</h1>
        <p className="text-sm text-slate-500">{pageSub}</p>
      </header>

      <Card className="border-indigo-100">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-64 flex-1">
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void runSearch(query)}
              placeholder={t("searchPh")}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-24 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <button
              onClick={() => void runSearch(query)}
              disabled={searching}
              className="absolute right-1.5 top-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {searching ? "…" : t("search")}
            </button>
          </div>
          <Select
            compact
            value={classFilter}
            onChange={setClassFilter}
            options={[{ value: "", label: t("allClasses") }, { value: "1", label: "Class 1" }, { value: "2", label: "Class 2" }, { value: "3", label: "Class 3" }]}
            label={t("classLabel")}
          />
          <Select
            compact
            value={subjectFilter}
            onChange={setSubjectFilter}
            options={[
              { value: "", label: t("allSubjects") },
              { value: "Hindi", label: "हिन्दी" },
              { value: "Math", label: "गणित" },
              { value: "EVS", label: "पर्यावरण" },
            ]}
            label="Subject"
          />
          <Select
            compact
            value={studentLanguage}
            onChange={(v) => setStudentLanguage(v as LanguageCode)}
            options={LANGUAGE_LIST.map((l) => ({ value: l.code, label: l.nativeName }))}
            label={t("learningLang")}
          />
        </div>
        {searching && (
          <div className="mt-2">
            <Spinner label={mode === "online" ? t("askThinkOnline") : t("askThinkOffline")} />
          </div>
        )}
        {searchError && <div className="mt-2"><FriendlyError message={searchError} /></div>}
        {searchResult && (
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-xs text-indigo-800">
            <EngineBadge meta={searchResult} />
            <span>
              🎯 <b>{searchResult.reason || "Matched lesson"}</b>
            </span>
          </div>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((l) => (
          <LessonCard key={l.slug} l={l} studentLanguage={studentLanguage} onOpen={openLesson} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-400">
          {t("learnEmpty")}
        </div>
      )}
    </div>
  );
}

export default function LearnPageWrapper() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">…</p>}>
      <LearnPage />
    </Suspense>
  );
}
