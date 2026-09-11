"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Teacher Dashboard — fully localized (follows student language) + Live Meet.
// ─────────────────────────────────────────────────────────────────────────────
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLangs, useMode, useUser } from "@/components/providers";
import { getLessons } from "@/lib/api";
import { Badge, Button, Card } from "@/components/ui";
import ClassroomPanel from "@/components/classroom";
import { StatusBadge } from "@/components/app-shell";
import { makeT } from "@/lib/i18n";
import { useLocalized } from "@/lib/pageLocalize";

interface LessonRow {
  slug: string;
  class: number;
  subject: string;
  titleHi: string;
  titleEn: string;
  concept: string;
  objective: string;
}

function TeacherPageInner() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "meet" ? "meet" : "overview";
  const { mode } = useMode();
  const { name, role } = useUser();
  const { studentLanguage } = useLangs();
  const t = makeT(studentLanguage);
  const pageTitle = useLocalized(t("teacher"), studentLanguage);
  const pageSub = useLocalized(t("teacherSub"), studentLanguage);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [counts, setCounts] = useState({ hi: 0, math: 0, evs: 0 });

  useEffect(() => {
    void getLessons().then((res) => {
      if (res.ok && Array.isArray(res.data)) {
        const rows = res.data as LessonRow[];
        setLessons(rows);
        setCounts({
          hi: rows.filter((l) => l.subject === "Hindi").length,
          math: rows.filter((l) => l.subject === "Math").length,
          evs: rows.filter((l) => l.subject === "EVS").length,
        });
      }
    });
  }, []);

  return (
    <div className="gs-animate space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-indigo-900">
            {pageTitle}
            {name && role === "teacher" && (
              <span className="ml-2 align-middle text-sm font-semibold text-slate-500">— {name}</span>
            )}
          </h1>
          <p className="text-sm text-slate-500">{pageSub}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge compact />
          <Link href="/teacher?tab=meet" className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-rose-700">
            {t("openClass")}
          </Link>
        </div>
      </header>

      {tab === "overview" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: t("statHindi"), value: counts.hi, tone: "bg-rose-50 border-rose-100" },
              { label: t("statMath"), value: counts.math, tone: "bg-emerald-50 border-emerald-100" },
              { label: t("statEvs"), value: counts.evs, tone: "bg-sky-50 border-sky-100" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border p-4 ${s.tone}`}>
                <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                <p className="mt-1 text-3xl font-black text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title={t("teachModeTitle")} subtitle={t("teachModeSub")}>
              <div className="space-y-2 text-sm text-slate-600">
                {mode === "online" ? (
                  <>
                    <p>{t("teachOnline1")}</p>
                    <p className="text-xs text-slate-400">{t("teachOnline2")}</p>
                  </>
                ) : (
                  <>
                    <p>{t("teachOffline1")}</p>
                    <p className="text-xs text-slate-400">{t("teachOffline2")}</p>
                  </>
                )}
                <Button variant="soft" onClick={() => window.location.assign("/teacher?tab=meet")}>
                  {t("teachGotoClass")}
                </Button>
              </div>
            </Card>

            <Card title={t("teachQuickTitle")} subtitle={t("teachQuickSub")}>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/worksheets" className="rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50">
                  {t("qaWorksheet")}
                </Link>
                <Link href="/learn" className="rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50">
                  {t("qaBrowse")}
                </Link>
                <Link href="/dictionary" className="rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50">
                  {t("qaDictionary")}
                </Link>
                <Link href="/progress" className="rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50">
                  {t("qaProgress")}
                </Link>
              </div>
            </Card>
          </div>

          <Card title={t("teachLibTitle")} subtitle={t("teachLibSub")}>
            <div className="grid gap-2 sm:grid-cols-2">
              {lessons.map((l) => (
                <Link
                  key={l.slug}
                  href={`/learn?lesson=${l.slug}`}
                  className="rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{l.titleHi}</span>
                    <Badge tone={l.subject === "Hindi" ? "rose" : l.subject === "Math" ? "emerald" : "sky"}>
                      {t("classLabel")} {l.class} • {l.subject}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{l.concept}</p>
                </Link>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <>
          <div className="mb-2 flex flex-wrap items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
            </span>
            <b className="text-rose-700">{t("meetBanner")}</b>
            <span className="text-xs text-rose-600/80">{t("meetBannerText")}</span>
          </div>
          <ClassroomPanel />
        </>
      )}
    </div>
  );
}

export default function TeacherPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">…</p>}>
      <TeacherPageInner />
    </Suspense>
  );
}
