"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Progress — fully localized + gamified rewards center:
// stars/level card, achievements, real quiz history, Nemotron recommendation,
// and the two-way AI-data synchronization.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLangs, useMode, useUser } from "@/components/providers";
import {
  getCacheCount,
  getLastSyncTime,
  getPendingCount,
  getProgress,
  runAiOp,
  runFullSync,
} from "@/lib/api";
import type { RecommendResult } from "@/lib/ai/types";
import { CURRICULUM } from "@/lib/curriculum";
import { makeT } from "@/lib/i18n";
import { Badge, Button, Card, EngineBadge, FriendlyError, Spinner } from "@/components/ui";
import { AchievementGrid, GyanuBubble, XpCard } from "@/components/gamification";
import { useLocalized } from "@/lib/pageLocalize";

interface ProgressRow {
  id: number;
  studentKey: string;
  lessonSlug: string;
  score: number;
  total: number;
  wrong: string[];
  details: Record<string, unknown>;
  createdAt: string;
}

export default function ProgressPage() {
  const { mode } = useMode();
  const { studentLanguage } = useLangs();
  const { name, studentKey, role } = useUser();
  const t = makeT(studentLanguage);
  const pageTitle = useLocalized(t("progress"), studentLanguage);

  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [recommend, setRecommend] = useState<RecommendResult | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(0);
  const [cacheN, setCacheN] = useState(0);
  const [syncNote, setSyncNote] = useState("");

  const load = () => {
    void getProgress(studentKey).then((res) => {
      if (res.ok && Array.isArray(res.data)) setRows(res.data as ProgressRow[]);
      setLoaded(true);
    });
  };

  const refreshCounts = () => {
    void getPendingCount().then(setPending);
    void getCacheCount().then(setCacheN);
  };

  const [lastSync, setLastSync] = useState<number>(0);
  const [syncBusy, setSyncBusy] = useState(false);

  useEffect(() => {
    load();
    refreshCounts();
    setLastSync(getLastSyncTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentKey, mode]);

  /** Manual full sync — downloads EVERYTHING needed offline (lessons, AI
   *  history, class content, leaderboard, Nemotron-translated UI chrome)
   *  and uploads any offline progress records. */
  const runSync = async () => {
    if (syncBusy) return;
    setSyncBusy(true);
    setSyncNote("");
    const res = await runFullSync(studentLanguage);
    if (res.ok && res.data) {
      const s = res.data;
      const total = s.lessons + s.aiResults + s.posts + s.leaderboard + s.uiStrings + s.uploaded;
      setSyncNote(t("syncSummary", { n: String(total) }));
      setLastSync(Date.now());
      refreshCounts();
      load();
    } else {
      setSyncNote(res.friendly ?? "Sync failed.");
    }
    setSyncBusy(false);
  };

  const askNext = async () => {
    setRecLoading(true);
    setError("");
    const res = await runAiOp<RecommendResult>(
      "recommend",
      {
        studentKey,
        language: studentLanguage,
        history: rows.map((r) => ({ lessonSlug: r.lessonSlug, score: r.score, total: r.total })),
      },
      mode,
    );
    if (res.ok && res.data) setRecommend(res.data);
    else setError(res.friendly ?? "Could not get a recommendation right now.");
    setRecLoading(false);
  };

  const lessonTitle = (slug: string) => {
    const l = CURRICULUM.find((x) => x.slug === slug);
    return l ? `${l.titleHi} (${l.titleEn})` : slug;
  };

  const avg =
    rows.length > 0
      ? Math.round((rows.reduce((s, r) => s + (r.total > 0 ? r.score / r.total : 0), 0) / rows.length) * 100)
      : null;

  const actionLabel: Record<string, string> = {
    remedial_practice: t("recRemedial"),
    targeted_practice: t("recTargeted"),
    challenge: t("recChallenge"),
    revision: t("recRevision"),
  };

  return (
    <div className="gs-animate space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-indigo-900">{pageTitle}</h1>
          <p className="text-sm text-slate-500">
            {name ? t("progSubNamed", { name, role }) : t("progSubAnon")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="indigo">📦 {cacheN} {t("cachedAIBadge")}</Badge>
          <Button variant="ghost" onClick={() => void runSync()} disabled={syncBusy}>
            {syncBusy ? "⏳" : t("syncNow")}
            {pending > 0 && <Badge tone="amber">{pending}</Badge>}
          </Button>
          <Button onClick={() => void askNext()} disabled={recLoading}>
            {recLoading ? <Spinner label="" /> : t("nextStep")}
          </Button>
        </div>
      </header>

      {/* Gamified rewards center */}
      <div className="grid gap-4 lg:grid-cols-2">
        <XpCard />
        <Card title={t("rewardsTitle")} subtitle={t("mascotTip")}>
          <AchievementGrid />
        </Card>
      </div>

      {pending > 0 && mode === "offline" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          {t("offlineWaiting", { n: String(pending) })}
        </div>
      )}
      {syncNote && <p className="text-xs font-semibold text-emerald-700">{syncNote}</p>}
      {lastSync > 0 && !syncNote && (
        <p className="text-[11px] text-slate-400">
          {t("syncedAt", { time: new Date(lastSync).toLocaleString() })}
        </p>
      )}
      {mode === "online" && <p className="text-[11px] text-slate-400">{t("syncOfflineHint")}</p>}
      {mode === "offline" && lastSync === 0 && (
        <p className="text-[11px] text-amber-600">
          📴 कभी सिंक नहीं किया — पहले ONLINE AI मोड में {t("syncNow")} दबाओ, फिर यह सब ऑफ़लाइन चलेगा।
        </p>
      )}

      {error && <FriendlyError message={error} />}

      {recommend && (
        <Card
          className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-sky-50"
          icon="🧭"
          title={t("recTitle")}
          subtitle={mode === "online" ? t("recSubOnline") : t("recSubOffline")}
        >
          <div className="mb-2"><EngineBadge meta={recommend} /></div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={
              recommend.action === "remedial_practice"
                ? "rose"
                : recommend.action === "challenge"
                  ? "emerald"
                  : recommend.action === "revision"
                    ? "amber"
                    : "sky"
            }>
              {actionLabel[recommend.action] ?? recommend.action} • {recommend.difficulty}
            </Badge>
            {(() => {
              const l = CURRICULUM.find((x) => x.slug === recommend.lessonId);
              return l ? <Badge tone="indigo">{l.titleHi}</Badge> : null;
            })()}
          </div>
          <p className="mt-2 text-sm font-medium text-slate-700">{recommend.reason}</p>
          {recommend.message && <p className="mt-1 text-sm font-bold text-indigo-700">{recommend.message}</p>}
          <div className="mt-3">
            <Link
              href={`/learn?lesson=${recommend.lessonId}`}
              className="inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-2 text-sm font-bold text-white shadow-sm"
            >
              {t("recOpenLesson")}
            </Link>
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{t("statAttempts")}</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{t("statAvg")}</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{avg === null ? "—" : `${avg}%`}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">{t("statEngine")}</p>
          <p className="mt-1 text-lg font-black text-slate-900">
            {mode === "online" ? "🧠 Nemotron" : t("offlineAI")}
          </p>
        </div>
      </div>

      <Card title={t("histTitle")} subtitle={t("histSub")}>
        {!loaded && <Spinner label="…" />}
        {loaded && rows.length === 0 && (
          <div className="py-2">
            <GyanuBubble text={t("histEmpty")} />
          </div>
        )}
        {rows.length > 0 && (
          <div className="space-y-2">
            {rows.slice(0, 12).map((r) => {
              const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
              return (
                <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <div className="min-w-40 flex-1">
                    <p className="text-sm font-bold text-slate-800">{lessonTitle(r.lessonSlug)}</p>
                    <p className="text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge tone={pct >= 80 ? "emerald" : pct >= 50 ? "amber" : "rose"}>
                    {r.score}/{r.total} ({pct}%)
                  </Badge>
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
