"use client";

// ─────────────────────────────────────────────────────────────────────────────
// GyanSetu app shell. Layout (top → bottom):
//   1) Brand row (logo + login)
//   2) LANGUAGE BAR — Student & Teacher language selectors (above the nav)
//   3) Navigation tabs — labels follow the selected language
//   4) Demo mode strip — manual ONLINE/OFFLINE radio + truthful AI status
// ─────────────────────────────────────────────────────────────────────────────
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAiStatus, useLangs, useMode, useUser } from "@/components/providers";
import { LANGUAGE_LIST, type LanguageCode } from "@/lib/languages";
import { makeT } from "@/lib/i18n";
import { Badge, RadioGroup } from "@/components/ui";
import { XpPill } from "@/components/gamification";
import { useLocalized } from "@/lib/pageLocalize";
import { getLastSyncTime, runFullSync } from "@/lib/api";

type NavItem = { href: string; key: Parameters<ReturnType<typeof makeT>>[0] };

/** One chrome string localized live by Nemotron 3 Ultra (cached offline). */
function NavLabel({ label, lang }: { label: string; lang: LanguageCode }) {
  const localized = useLocalized(label, lang);
  return <>{localized}</>;
}

/** Manual 🔄 Sync — downloads everything needed for offline use. */
function SyncButton() {
  const { mode } = useMode();
  const { studentLanguage } = useLangs();
  const t = makeT(studentLanguage);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [lastSync, setLastSync] = useState<number>(0);

  useEffect(() => {
    setLastSync(getLastSyncTime());
  }, []);

  const run = async () => {
    if (mode !== "online") {
      setNote("Sync needs ONLINE AI mode.");
      return;
    }
    setBusy(true);
    setNote("");
    const res = await runFullSync(studentLanguage);
    if (res.ok && res.data) {
      const s = res.data;
      setNote(
        t("syncSummary", { n: String(s.lessons + s.aiResults + s.posts + s.leaderboard + s.uiStrings + s.uploaded) }),
      );
      setLastSync(Date.now());
    } else {
      setNote(res.friendly ?? "Sync failed.");
    }
    setBusy(false);
  };

  return (
    <span className="flex items-center gap-1.5">
      <button
        onClick={() => void run()}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-700 shadow-sm hover:bg-indigo-100 disabled:opacity-50"
        title={t("syncOfflineHint")}
      >
        {busy ? "⏳" : "🔄"} {t("syncNow")}
        {lastSync > 0 && !busy && <span className="text-emerald-600">✓</span>}
      </button>
      {note && <span className="text-[10px] font-semibold text-emerald-700">{note}</span>}
      {lastSync > 0 && !note && (
        <span className="text-[10px] text-slate-400">
          {t("syncedAt", { time: new Date(lastSync).toLocaleTimeString() })}
        </span>
      )}
    </span>
  );
}

function ModeRadios() {
  const { mode, setMode } = useMode();
  const { studentLanguage } = useLangs();
  const t = makeT(studentLanguage);
  return (
    <RadioGroup
      name="ai-mode"
      value={mode}
      onChange={setMode}
      columns={2}
      options={[
        {
          value: "online",
          label: <NavLabel label={t("onlineAI")} lang={studentLanguage} />,
          description: <NavLabel label={t("onlineDesc")} lang={studentLanguage} />,
          tone: "indigo",
        },
        {
          value: "offline",
          label: <NavLabel label={t("offlineAI")} lang={studentLanguage} />,
          description: <NavLabel label={t("offlineDesc")} lang={studentLanguage} />,
          tone: "slate",
        },
      ]}
    />
  );
}

export function StatusBadge({ compact }: { compact?: boolean }) {
  const { mode } = useMode();
  const { status } = useAiStatus();
  const { studentLanguage } = useLangs();
  const t = makeT(studentLanguage);

  if (mode === "offline") {
    return <Badge tone="slate" className={compact ? "" : "px-3 py-1 text-xs"}>{t("offlineBadge")}</Badge>;
  }
  if (!status.checked) {
    return <Badge tone="sky" className={compact ? "" : "px-3 py-1 text-xs"}>{t("checking")}</Badge>;
  }
  if (!status.configured) {
    return <Badge tone="rose" className={compact ? "" : "px-3 py-1 text-xs"}>{t("notConfigured")}</Badge>;
  }
  if (!status.verified) {
    return <Badge tone="amber" className={compact ? "" : "px-3 py-1 text-xs"}>{t("verifiedPending")}</Badge>;
  }
  return (
    <Badge tone="indigo" className={compact ? "" : "px-3 py-1 text-xs"}>
      {t("verifiedOk")}
      {status.latencyMs > 0 && <span className="font-normal opacity-75">{(status.latencyMs / 1000).toFixed(1)}s</span>}
    </Badge>
  );
}

function LoginWidget() {
  const { name, role, setUser, logout } = useUser();
  const { studentLanguage } = useLangs();
  const t = makeT(studentLanguage);
  const [open, setOpen] = useState(false);
  const [n, setN] = useState("");
  const [r, setR] = useState<"teacher" | "student">("student");

  if (name) {
    return (
      <span className="flex items-center gap-2">
        <Badge tone={role === "teacher" ? "amber" : "emerald"}>
          {role === "teacher" ? "👩‍🏫" : "🧑‍🎓"} {name}
        </Badge>
        <button onClick={logout} className="text-xs font-semibold text-slate-400 hover:text-rose-600">
          {t("logout")}
        </button>
      </span>
    );
  }
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        {t("login")}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{t("demoLogin")}</p>
          <input
            value={n}
            onChange={(e) => setN(e.target.value)}
            placeholder={t("yourName")}
            className="mb-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <div className="mb-3 flex gap-2">
            {(["student", "teacher"] as const).map((opt) => (
              <label
                key={opt}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-1.5 text-xs font-semibold has-checked:border-indigo-500 has-checked:bg-indigo-50"
              >
                <input type="radio" name="login-role" className="sr-only" checked={r === opt} onChange={() => setR(opt)} />
                {opt === "teacher" ? t("teacherRole") : t("studentRole")}
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              setUser(n, r);
              setOpen(false);
            }}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 py-2 text-sm font-bold text-white"
          >
            {t("enterApp")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { studentLanguage, setStudentLanguage, teacherLanguage, setTeacherLanguage } = useLangs();
  const { role, name } = useUser();
  const t = makeT(studentLanguage);

  // Role-aware navigation: teacher and student get personalized tab sets.
  const nav: NavItem[] =
    role === "teacher" && name
      ? [
          { href: "/", key: "home" },
          { href: "/teacher", key: "teacher" },
          { href: "/teacher?tab=meet", key: "liveMeet" },
          { href: "/studio", key: "studio" },
          { href: "/learn", key: "learn" },
          { href: "/worksheets", key: "worksheets" },
          { href: "/flashcards", key: "flashcards" },
          { href: "/student", key: "myClass" },
          { href: "/progress", key: "progress" },
          { href: "/architecture", key: "architecture" },
        ]
      : [
          { href: "/", key: "home" },
          { href: "/learn", key: "learn" },
          { href: "/worksheets", key: "worksheets" },
          { href: "/flashcards", key: "flashcards" },
          { href: "/dictionary", key: "dictionary" },
          { href: "/ask", key: "askAi" },
          { href: "/student", key: "myClass" },
          { href: "/progress", key: "progress" },
          { href: "/teacher?tab=meet", key: "liveMeet" },
        ];

  // Whole-page language change: update <html lang> whenever it changes.
  useEffect(() => {
    document.documentElement.lang = studentLanguage;
  }, [studentLanguage]);

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(base);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-indigo-50/60 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-indigo-100 bg-white/90 backdrop-blur">
        {/* ── Row 1: brand + login ── */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌉</span>
            <span className="leading-tight">
              <span className="block text-lg font-black tracking-tight text-indigo-900">
                GyanSetu <span className="text-sky-600">ज्ञानसेतु</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                SIH 26042 • 26 Mother Tongues • NIPUN Bharat
              </span>
            </span>
          </Link>
          <LoginWidget />
        </div>

        {/* ── Row 2: LANGUAGE BAR (above the nav tabs) ── */}
        <div className="border-t border-indigo-100/70 bg-gradient-to-r from-indigo-50/80 via-sky-50/60 to-indigo-50/80">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600">
              {t("languageBar")}
            </span>
            <label className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {t("studentLang")}
              </span>
              <select
                value={studentLanguage}
                onChange={(e) => setStudentLanguage(e.target.value as LanguageCode)}
                className="rounded-lg border border-indigo-200 bg-white px-2 py-1 text-xs font-bold text-indigo-800 shadow-sm outline-none focus:border-indigo-500"
                aria-label={t("studentLang")}
              >
                {LANGUAGE_LIST.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {t("teacherLang")}
              </span>
              <select
                value={teacherLanguage}
                onChange={(e) => setTeacherLanguage(e.target.value as LanguageCode)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm outline-none focus:border-indigo-500"
                aria-label={t("teacherLang")}
              >
                {LANGUAGE_LIST.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName}
                  </option>
                ))}
              </select>
            </label>
            <span className="ml-auto hidden text-[10px] text-slate-400 sm:block">
              {t("homeLangNote1")} <b className="text-indigo-600">{studentLanguage.toUpperCase()}</b>{" "}
              {t("homeLangNote2")}
            </span>
          </div>
        </div>

        {/* ── Row 3: navigation tabs (Nemotron-localized, role-aware) ── */}
        <nav className="border-t border-slate-100">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isActive(n.href)
                    ? "bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-indigo-50"
                }`}
              >
                <NavLabel label={t(n.key)} lang={studentLanguage} />
              </Link>
            ))}
          </div>
        </nav>

        {/* ── Row 4: demo mode strip (manual ONLINE/OFFLINE radio) ── */}
        <div className="border-t border-slate-100 bg-white/80">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {t("demoMode")}
              </span>
              <div className="w-64 sm:w-96">
                <ModeRadios />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <SyncButton />
              <XpPill />
              <StatusBadge compact />
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-[11px] text-slate-500">
          <span>🌉 GyanSetu ज्ञानसेतु — One Classroom. Many Mother Tongues. One Learning Bridge.</span>
          <span className="flex gap-2">
            <Badge tone="slate">NEP 2020</Badge>
            <Badge tone="slate">NIPUN Bharat</Badge>
            <Badge tone="slate">PALASH MTB-MLE Jharkhand</Badge>
          </span>
        </div>
      </footer>
    </div>
  );
}
