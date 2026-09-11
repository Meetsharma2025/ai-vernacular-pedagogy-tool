"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 🎒 My Class — the personalized STUDENT panel: greeting, level/XP, class
// leaderboard, achievements and the teacher's published content feed.
// Opening a content item runs the Studio pipeline: Teacher → Nemotron →
// Student (simplified lesson in the child's language with step-flow,
// everyday examples and a takeaway).
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLangs, useMode, useUser } from "@/components/providers";
import { fetchClassContent, fetchLeaderboard, runAiOp, type ClassContentItem, type LeaderboardEntry } from "@/lib/api";
import type { StudioResult, WorksheetResult, FlashcardsResult } from "@/lib/ai/types";
import { getLanguage } from "@/lib/languages";
import { makeT } from "@/lib/i18n";
import { useLocalized } from "@/lib/pageLocalize";
import { Badge, Button, Card, EngineBadge, FriendlyError, Spinner } from "@/components/ui";
import { AchievementGrid, GyanuBubble, XpCard } from "@/components/gamification";
import { isTtsSupported, speak } from "@/components/speech";

const MEDALS = ["🥇", "🥈", "🥉"];

function StudioViewer({ item, onClose }: { item: ClassContentItem; onClose: () => void }) {
  const { studentLanguage } = useLangs();
  const { mode } = useMode();
  const t = makeT(studentLanguage);
  const langDef = getLanguage(studentLanguage);
  const [result, setResult] = useState<StudioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tried, setTried] = useState(false);

  const isArtifact = item.kind === "worksheet" || item.kind === "flashcards";

  const runAi = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    const res = await runAiOp<StudioResult>(
      "studio",
      {
        contentId: item.id,
        content: item.content || item.title,
        title: item.title,
        kind: item.kind,
        language: studentLanguage,
      },
      mode,
    );
    if (res.ok && res.data) {
      setResult(res.data);
      setError("");
    } else {
      setError(res.friendly ?? "AI is temporarily unavailable. Please try again.");
    }
    setLoading(false);
    setTried(true);
  };

  // Auto-run the Nemotron conversion for text/link/file material.
  // Worksheet/flashcard artifacts render directly (they were already
  // generated in the child's language) with an optional AI explainer.
  useEffect(() => {
    setResult(null);
    setError("");
    setTried(false);
    if (!isArtifact) void runAi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, studentLanguage, mode]);

  const raw = item.content || "";

  return (
    <Card className="border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white" title={`📢 ${item.title}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button onClick={onClose} className="text-xs font-semibold text-indigo-600 hover:underline">
          ← {t("backAll")}
        </button>
        <Badge tone="slate">
          {item.kind === "worksheet" ? "📝" : item.kind === "flashcards" ? "🃏" : item.kind === "link" ? "🔗" : item.kind === "file" ? "📎" : "✍️"}{" "}
          {item.kind}
        </Badge>
        <Badge tone="sky">{item.author}</Badge>
      </div>

      {/* ── AI result (Nemotron pedagogy conversion) ── */}
      {loading && (
        <div className="flex flex-col items-center gap-2 py-8">
          <Spinner label={mode === "online" ? `🧠 Nemotron ${langDef.name} में बना रहा है…` : "…"} />
        </div>
      )}

      {!loading && error && (
        <div className="space-y-3">
          <FriendlyError message={error} />
          <Button variant="soft" onClick={() => void runAi()}>
            🔄 {t("tryAgain")}
          </Button>
          {raw && (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                📄 {item.author} की मूल सामग्री
              </p>
              <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-slate-600">
                {raw.length > 800 ? raw.slice(0, 800) + "…" : raw}
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && result && (
        <div className="space-y-4">
          <EngineBadge meta={result} />
          <div className="rounded-xl bg-indigo-50/70 p-3">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-indigo-500">{t("explanation")}</p>
            <p className="text-base font-semibold leading-relaxed text-slate-800">{result.summary}</p>
            {isTtsSupported() && (
              <button onClick={() => speak(result.summary, studentLanguage)} className="mt-2 text-[11px] font-semibold text-indigo-500 hover:underline">
                {t("studioListen")}
              </button>
            )}
          </div>

          {result.steps.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-sky-500">{t("studioSteps")}</p>
              <div className="flex flex-col items-start gap-0">
                {result.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-0">
                    <div className="flex flex-col items-center">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-black text-white shadow">
                        {i + 1}
                      </span>
                      {i < result.steps.length - 1 && <span className="h-4 w-0.5 bg-sky-200" />}
                    </div>
                    <span className="ml-3 rounded-xl bg-sky-50/70 px-3 py-2 text-sm font-medium text-slate-700">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.examples.length > 0 && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-emerald-600">{t("studioExamples")}</p>
              <ul className="space-y-1 text-sm text-slate-700">
                {result.examples.map((e, i) => (
                  <li key={i}>🌱 {e}</li>
                ))}
              </ul>
            </div>
          )}

          {result.takeaway && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">{t("studioTakeaway")}</p>
              <p className="text-sm font-semibold text-slate-800">{result.takeaway}</p>
            </div>
          )}
          {result.followUp && <p className="text-xs font-semibold text-indigo-600">🤔 {result.followUp}</p>}
        </div>
      )}

      {/* ── Published worksheets/flashcards render instantly ── */}
      {!loading && isArtifact && (
        <div className="space-y-3">
          <PublishedArtifact kind={item.kind} payload={item.payload} language={studentLanguage} />
          {!result && (
            <Button variant="soft" onClick={() => void runAi()}>
              🧠 {t("explainLesson")} ({langDef.name})
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

function PublishedArtifact({
  kind,
  payload,
  language,
}: {
  kind: string;
  payload: Record<string, unknown>;
  language: string;
}) {
  void language;
  if (kind === "worksheet") {
    const ws = payload as unknown as Partial<WorksheetResult>;
    return (
      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-800">{ws.title ?? "Worksheet"}</p>
        {ws.questions?.map((q, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">
              {i + 1}. {q.question}
            </p>
            {q.options?.length ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {q.options.map((o, oi) => (
                  <span key={oi} className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                    {o}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-1.5 border-b border-dotted border-slate-300 pb-3" />
            )}
          </div>
        ))}
      </div>
    );
  }
  const fc = payload as unknown as Partial<FlashcardsResult>;
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-slate-800">{fc.title ?? "Flashcards"}</p>
      {fc.cards?.map((c, i) => (
        <div key={i} className="rounded-xl border border-slate-200 p-3">
          <p className="text-sm font-black text-slate-900">{c.word}</p>
          <p className="text-xs text-slate-600">{c.meaning}</p>
        </div>
      ))}
    </div>
  );
}

function StudentPanel() {
  const { studentLanguage } = useLangs();
  const { name, role } = useUser();
  const t = makeT(studentLanguage);
  const langDef = getLanguage(studentLanguage);

  const [items, setItems] = useState<ClassContentItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [openItem, setOpenItem] = useState<ClassContentItem | null>(null);

  const sub = useLocalized(t("myClassSub"), studentLanguage);

  useEffect(() => {
    void fetchClassContent().then((res) => {
      if (res.ok) setItems(res.data!);
      setLoaded(true);
    });
    void fetchLeaderboard().then((res) => {
      if (res.ok) setBoard(res.data!);
    });
  }, []);

  const myName = name ? name : "";
  const pageTitle = useLocalized(t("myClass"), studentLanguage);

  return (
    <div className="gs-animate space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-indigo-900">{pageTitle}</h1>
          <p className="text-sm text-slate-500">{sub}</p>
        </div>
        {name && <GyanuBubble text={`${t("classGreeting", { name })} ${t("mascotTip")}`} />}
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <XpCard />
          <Card title={t("rewardsTitle")}>
            <AchievementGrid />
          </Card>
        </div>

        <Card title={t("classLeaderboard")} className="lg:col-span-2">
          {board.length === 0 && <GyanuBubble text={t("leaderboardEmpty")} />}
          <div className="space-y-1.5">
            {board.map((e) => {
              const isMe = name && e.name.toLowerCase() === name.toLowerCase();
              return (
                <div
                  key={e.name + e.rank}
                  className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                    isMe ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="w-8 text-center text-lg font-black">
                    {e.rank <= 3 ? MEDALS[e.rank - 1] : `#${e.rank}`}
                  </span>
                  <span className="flex-1 text-sm font-bold text-slate-800">
                    {e.name} {isMe && <Badge tone="indigo">you</Badge>}
                  </span>
                  <Badge tone={e.pct >= 80 ? "emerald" : e.pct >= 50 ? "amber" : "rose"}>{e.pct}%</Badge>
                  <span className="text-xs text-slate-400">
                    ⭐ {e.score}/{e.total}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title={t("classFeed")}>
        {!loaded && <Spinner label="…" />}
        {loaded && items.length === 0 && <GyanuBubble text={t("classFeedEmpty")} />}
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setOpenItem(it)}
              className="rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-slate-800">
                  {it.kind === "worksheet" ? "📝" : it.kind === "flashcards" ? "🃏" : it.kind === "link" ? "🔗" : it.kind === "file" ? "📎" : "📢"} {it.title}
                </span>
                <Badge tone="slate">{it.author}</Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{it.excerpt}</p>
              <p className="mt-1.5 text-[11px] font-semibold text-emerald-600">
                {t("viewContent")} → ({langDef.name})
              </p>
            </button>
          ))}
        </div>
      </Card>

      {openItem && (
        <div className="gs-animate">
          <StudioViewer item={openItem} onClose={() => setOpenItem(null)} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 pb-2">
        <Link href="/learn" className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-2 text-sm font-bold text-white shadow">
          {t("learn")} →
        </Link>
        <Link href="/ask" className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
          {t("askAi")} →
        </Link>
      </div>
      <p className="text-[11px] text-slate-400">
        {role === "teacher" ? "You are viewing the student panel — students see their own personalized version." : ""}
      </p>
    </div>
  );
}

export default StudentPanel;
