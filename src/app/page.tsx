"use client";

// ─────────────────────────────────────────────────────────────────────────────
// GyanSetu Home — fully localized + gamified for 5–8 year old learners.
// ─────────────────────────────────────────────────────────────────────────────
import Link from "next/link";
import { useAiStatus, useLangs, useMode, useUser } from "@/components/providers";
import { StatusBadgeMark } from "@/components/home-parts";
import { Badge, Card, RadioGroup } from "@/components/ui";
import { GyanuBubble, XpCard } from "@/components/gamification";
import { makeT } from "@/lib/i18n";
import { useLocalized } from "@/lib/pageLocalize";
import { getLanguage, SUPPORTED_LANGUAGE_COUNT } from "@/lib/languages";

export default function HomePage() {
  const { mode, setMode } = useMode();
  const { status } = useAiStatus();
  const { studentLanguage } = useLangs();
  const { role, name } = useUser();
  const t = makeT(studentLanguage);
  const langDef = getLanguage(studentLanguage);
  const onlineOk = status.configured && status.verified;

  // Nemotron whole-page localization: hero + pipeline texts + quick links.
  const heroText = useLocalized(t("heroText"), studentLanguage);
  const heroClass = useLocalized(t("heroClass"), studentLanguage);
  const heroAsk = useLocalized(t("heroAsk"), studentLanguage);
  const pipe1T = useLocalized(t("pipe1T"), studentLanguage);
  const pipe1X = useLocalized(t("pipe1X"), studentLanguage);
  const pipe2T = useLocalized(t("pipe2T"), studentLanguage);
  const pipe2X = useLocalized(t("pipe2X"), studentLanguage);
  const pipe3T = useLocalized(t("pipe3T"), studentLanguage);
  const pipe3X = useLocalized(t("pipe3X"), studentLanguage);
  const pipe4T = useLocalized(t("pipe4T"), studentLanguage);
  const pipe4X = useLocalized(t("pipe4X"), studentLanguage);

  const welcome =
    role === "teacher" && name
      ? t("welcomeTeacher")
      : name
        ? t("welcomeStudent", { name })
        : t("welcomeGuest");

  return (
    <div className="gs-animate space-y-6">
      {/* ── Hero with mascot ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-600 px-6 py-10 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-indigo-400/30 blur-3xl" />
        <div className="relative">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone="indigo" className="border-white/30 bg-white/15 text-white">🏛️ SIH 26042</Badge>
            <Badge tone="indigo" className="border-white/30 bg-white/15 text-white">🗣️ {SUPPORTED_LANGUAGE_COUNT} Mother Tongues</Badge>
            <Badge tone="indigo" className="border-white/30 bg-white/15 text-white">📖 NIPUN Bharat</Badge>
          </div>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            🌉 GyanSetu <span className="text-amber-300">ज्ञानसेतु</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base">{heroText}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/teacher?tab=meet" className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-indigo-950 shadow hover:bg-amber-300">
              {heroClass}
            </Link>
            <Link href="/ask" className="rounded-xl border border-white/40 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20">
              {heroAsk}
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="rounded-2xl bg-white/15 px-4 py-2 backdrop-blur">
              <GyanuBubble text={`${t("mascotHi")} ${t("mascotTip")}`} />
            </div>
            <div className="flex-1 rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              {welcome}
              <div className="mt-2 flex gap-2">
                {role === "teacher" ? (
                  <Link href="/studio" className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black text-indigo-950 hover:bg-amber-300">
                    {t("studio")} →
                  </Link>
                ) : (
                  <Link href="/student" className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black text-indigo-950 hover:bg-amber-300">
                    {t("myClass")} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo mode + engine status + star card ── */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card title={t("demoTitle")} subtitle={t("demoSub")} className="lg:col-span-2">
          <RadioGroup
            name="home-ai-mode"
            value={mode}
            onChange={setMode}
            options={[
              {
                value: "online",
                label: t("onlineAI"),
                icon: <span>🧠</span>,
                description: t("onlineDesc"),
                tone: "indigo",
              },
              {
                value: "offline",
                label: t("offlineAI"),
                icon: <span>📦</span>,
                description: t("offlineDesc"),
                tone: "slate",
              },
            ]}
            columns={1}
          />
        </Card>

        <div className="space-y-4">
          <XpCard />
          <Card title={t("engineTitle")} subtitle={t("engineSub")}>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {mode === "online" && status.checked && <StatusBadgeMark ok={onlineOk} mode="online" status={status} />}
                {mode === "offline" && <StatusBadgeMark ok={false} mode="offline" status={status} />}
                {mode === "online" && !status.checked && <Badge tone="sky">{t("checking")}</Badge>}
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>{t("engineB1")}</li>
                <li>{t("engineB2")}</li>
                <li>{t("engineB3")}</li>
              </ul>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">{t("engineNet")}</div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Pipeline ── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: "👩‍🏫", title: pipe1T, text: pipe1X },
          { icon: "🧠", title: pipe2T, text: pipe2X },
          { icon: "🗣️", title: pipe3T, text: pipe3X },
          { icon: "📊", title: pipe4T, text: pipe4X },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-100 to-sky-100 text-xl">{s.icon}</div>
            <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.text}</p>
          </div>
        ))}
      </section>

      {/* ── Quick links ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/teacher", icon: "👩‍🏫", title: t("qlTeacher"), text: t("qlTeacherX") },
          { href: "/learn", icon: "🌱", title: t("qlLearn"), text: t("qlLearnX") },
          { href: "/worksheets", icon: "📝", title: t("qlWorksheets"), text: t("qlWorksheetsX") },
          { href: "/flashcards", icon: "🃏", title: t("qlFlashcards"), text: t("qlFlashcardsX") },
          { href: "/dictionary", icon: "📚", title: t("qlDictionary"), text: t("qlDictionaryX") },
          { href: "/progress", icon: "📊", title: t("qlProgress"), text: t("qlProgressX") },
          { href: "/ask", icon: "💬", title: t("qlAsk"), text: t("qlAskX") },
          { href: "/architecture", icon: "⚙️", title: t("qlArch"), text: t("qlArchX") },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
          >
            <span className="text-2xl">{l.icon}</span>
            <h3 className="mt-2 text-sm font-bold text-indigo-900 group-hover:text-indigo-700">{l.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{l.text}</p>
          </Link>
        ))}
      </section>

      <p className="pb-2 text-center text-xs text-slate-400">
        {t("homeLangNote1")} <b className="text-indigo-600">{langDef.name} ({langDef.nativeName})</b> {t("homeLangNote2")}
      </p>
    </div>
  );
}
