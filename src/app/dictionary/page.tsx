"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Dictionary / शब्दकोश — two modes:
//  1) 📚 Hindi/Tribal dictionary (exact → local, ambiguous → Nemotron)
//  2) ᱥᱟᱱᱛᱟᱲ Ol Chiki — the 30-letter Santali alphabet with typing guide and
//     the curated Santali-English lexicon (Hansdah & Murmu, 2003), fully
//     offline. Contextual questions go to Nemotron in the selected language.
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo, useState } from "react";
import { useLangs, useMode } from "@/components/providers";
import { runAiOp } from "@/lib/api";
import type { DictionaryResult } from "@/lib/ai/types";
import { getLanguage, LANGUAGE_LIST, type LanguageCode } from "@/lib/languages";
import { makeT } from "@/lib/i18n";
import { Badge, Button, Card, EngineBadge, FriendlyError, RichText, Select, Spinner } from "@/components/ui";
import { GyanuBubble } from "@/components/gamification";
import { DICTIONARY } from "@/lib/curriculum";
import { OLCHIKI_ALPHABET, OLCHIKI_DICTIONARY, OLCHIKI_KINDS, OLCHIKI_TYPING, searchOlChiki } from "@/lib/olchiki";
import { HO_DICTIONARY, HO_KINDS, searchHo } from "@/lib/holanguage";
import { MUNDARI_DICTIONARY, MUNDARI_KINDS, searchMundari } from "@/lib/mundarilanguage";
import { isTtsSupported, speak } from "@/components/speech";
import { useLocalized } from "@/lib/pageLocalize";

type DictMode = "words" | "olchiki" | "ho" | "mundari";

function MundariMode({ mode, studentLanguage }: { mode: "online" | "offline"; studentLanguage: LanguageCode }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [aiResult, setAiResult] = useState<DictionaryResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const entries = useMemo(() => searchMundari(query, kind), [query, kind]);
  const exact = useMemo(
    () =>
      query.trim()
        ? MUNDARI_DICTIONARY.find((e) => e.en.toLowerCase() === query.trim().toLowerCase())
        : undefined,
    [query],
  );

  const askAi = async () => {
    const q = query.trim();
    if (!q || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    const res = await runAiOp<DictionaryResult>(
      "dictionary",
      { query: `Mundari शब्द "${q}" का मतलब और उदाहरण बताओ`, language: studentLanguage },
      mode,
    );
    if (res.ok && res.data) setAiResult(res.data);
    else setAiError(res.friendly ?? "AI is temporarily unavailable. Please try again.");
    setAiLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card
        title="📖 Mundari-English Dictionary"
        subtitle={`Enike Amina Wani, Martin Lomu Goke with Tim Stirtz, 2013 • SIL-South Sudan — चुने गए ${MUNDARI_DICTIONARY.length} शब्द • पूरी तरह ऑफ़लाइन`}
      >
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-56 flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="coŋ, kadi, bük, kue… (English / Mundari / हिन्दी में खोजो)"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <Select
            compact
            value={kind}
            onChange={setKind}
            options={MUNDARI_KINDS.map((k) => ({ value: k.value, label: k.label }))}
            label="श्रेणी"
          />
          {query.trim() && (
            <Button variant="soft" onClick={() => void askAi()} disabled={aiLoading}>
              {aiLoading ? <Spinner label="" /> : "🧠 AI से पूछो"}
            </Button>
          )}
        </div>

        {exact && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
            <p className="text-sm font-black text-slate-900">
              {exact.en} <span className="ml-2 font-bold text-indigo-700">→ {exact.mu}</span>{" "}
              <span className="text-[10px] font-semibold text-slate-400">({exact.pos})</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">{exact.hi}</p>
          </div>
        )}

        {aiLoading && <div className="mt-3"><Spinner label="Nemotron सोच रहा है…" /></div>}
        {aiError && <div className="mt-3"><FriendlyError message={aiError} /></div>}
        {aiResult && (
          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
            <div className="mb-1"><EngineBadge meta={aiResult} /></div>
            <RichText text={aiResult.meaning} />
            {aiResult.example && <p className="mt-2 text-xs text-slate-600">🌱 {aiResult.example}</p>}
          </div>
        )}

        <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.slice(0, 36).map((e) => (
            <div key={e.en} className="rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-indigo-300 hover:bg-indigo-50/40">
              <p className="text-sm font-black text-slate-900">
                {e.en} <span className="text-[10px] text-slate-400">→</span>{" "}
                <span className="text-sm font-bold text-indigo-700">{e.mu}</span>
              </p>
              <p className="text-[11px] text-slate-400">{e.hi}</p>
            </div>
          ))}
        </div>
        {entries.length === 0 && (
          <p className="mt-3 text-sm text-slate-400">कोई शब्द नहीं मिला — "coŋ" (पानी) या "kadi" (घर) आज़माओ।</p>
        )}
        {entries.length > 36 && (
          <p className="mt-2 text-[11px] text-slate-400">और शब्द देखने के लिए खोज या श्रेणी बदलो ({entries.length} मिले)।</p>
        )}
        <p className="mt-3 text-[10px] text-slate-400">
          स्रोत-नोट: यह SIL दक्षिण सूडान Mundari संदर्भ है; हमारा झारखंड स्कूल पैक अपने देवनागरी रूपों के साथ चलता है — Nemotron दोनों को जोड़कर अनुवाद करता है।
        </p>
      </Card>
    </div>
  );
}

function HoMode({ mode, studentLanguage }: { mode: "online" | "offline"; studentLanguage: LanguageCode }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [aiResult, setAiResult] = useState<DictionaryResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const entries = useMemo(() => searchHo(query, kind), [query, kind]);
  const exact = useMemo(
    () => (query.trim() ? HO_DICTIONARY.find((e) => e.en.toLowerCase() === query.trim().toLowerCase()) : undefined),
    [query],
  );

  const askAi = async () => {
    const q = query.trim();
    if (!q || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    const res = await runAiOp<DictionaryResult>(
      "dictionary",
      { query: `Ho शब्द "${q}" का मतलब और उदाहरण बताओ`, language: studentLanguage },
      mode,
    );
    if (res.ok && res.data) setAiResult(res.data);
    else setAiError(res.friendly ?? "AI is temporarily unavailable. Please try again.");
    setAiLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card
        title="📖 English–Ho Vocabulary"
        subtitle={`J. Deeney, S.J., 1975 • Xavier Ho Publications, Chaibasa — चुने गए ${HO_DICTIONARY.length} शब्द • पूरी तरह ऑफ़लाइन`}
      >
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-56 flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="da:, hon, iskul, jom… (English / Ho / हिन्दी में खोजो)"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <Select
            compact
            value={kind}
            onChange={setKind}
            options={HO_KINDS.map((k) => ({ value: k.value, label: k.label }))}
            label="श्रेणी"
          />
          {query.trim() && (
            <Button variant="soft" onClick={() => void askAi()} disabled={aiLoading}>
              {aiLoading ? <Spinner label="" /> : "🧠 AI से पूछो"}
            </Button>
          )}
        </div>

        {exact && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
            <p className="text-sm font-black text-slate-900">
              {exact.en} <span className="ml-2 font-bold text-indigo-700">→ {exact.ho}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">{exact.hi}</p>
          </div>
        )}

        {aiLoading && <div className="mt-3"><Spinner label="Nemotron सोच रहा है…" /></div>}
        {aiError && <div className="mt-3"><FriendlyError message={aiError} /></div>}
        {aiResult && (
          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
            <div className="mb-1"><EngineBadge meta={aiResult} /></div>
            <RichText text={aiResult.meaning} />
            {aiResult.example && <p className="mt-2 text-xs text-slate-600">🌱 {aiResult.example}</p>}
          </div>
        )}

        <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.slice(0, 36).map((e) => (
            <div key={e.en} className="rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-indigo-300 hover:bg-indigo-50/40">
              <p className="text-sm font-black text-slate-900">
                {e.en} <span className="text-[10px] text-slate-400">→</span>{" "}
                <span className="text-sm font-bold text-indigo-700">{e.ho}</span>
              </p>
              <p className="text-[11px] text-slate-400">{e.hi}</p>
            </div>
          ))}
        </div>
        {entries.length === 0 && (
          <p className="mt-3 text-sm text-slate-400">कोई शब्द नहीं मिला — "da:" (पानी) या "iskul" (स्कूल) आज़माओ।</p>
        )}
        {entries.length > 36 && (
          <p className="mt-2 text-[11px] text-slate-400">और शब्द देखने के लिए खोज या श्रेणी बदलो ({entries.length} मिले)।</p>
        )}
      </Card>
    </div>
  );
}

function OlChikiMode({ mode, studentLanguage }: { mode: "online" | "offline"; studentLanguage: LanguageCode }) {
  const t = makeT(studentLanguage);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [aiResult, setAiResult] = useState<DictionaryResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const entries = useMemo(() => searchOlChiki(query, kind), [query, kind]);
  const exact = useMemo(
    () =>
      query.trim()
        ? OLCHIKI_DICTIONARY.find((e) => e.word.toLowerCase() === query.trim().toLowerCase())
        : undefined,
    [query],
  );

  const askAi = async () => {
    const q = query.trim();
    if (!q || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    const res = await runAiOp<DictionaryResult>(
      "dictionary",
      { query: `संथाली शब्द "${q}" का मतलब और उदाहरण बताओ`, language: studentLanguage },
      mode,
    );
    if (res.ok && res.data) setAiResult(res.data);
    else setAiError(res.friendly ?? "AI is temporarily unavailable. Please try again.");
    setAiLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* ── The Ol Chiki alphabet ── */}
      <Card title="ᱚᱞ ᱪᱤᱠᱤ — Ol Chiki वर्णमाला" subtitle="संथाली की आधिकारिक लिपि (पंडित रघुनाथ मुर्मू, 1930s) • 30 अक्षर">
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
          {OLCHIKI_ALPHABET.map((l) => (
            <div
              key={l.ol}
              title={`${l.ol} — ${l.latin} (${l.name})`}
              className="flex flex-col items-center rounded-xl border border-slate-200 bg-gradient-to-b from-indigo-50/60 to-white p-2 transition hover:border-indigo-300 hover:shadow"
            >
              <span className="text-2xl font-bold text-indigo-900">{l.ol}</span>
              <span className="text-[10px] font-semibold text-slate-500">{l.latin}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-sky-50/70 p-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-sky-600">
            ⌨️ कैसे टाइप करें (keyboard guide)
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {OLCHIKI_TYPING.map((tp) => (
              <div key={tp.keys} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-[11px]">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-indigo-700">{tp.keys}</code>
                <span className="font-bold text-slate-600">{tp.result}</span>
                <span className="text-slate-400">{tp.note}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Santali-English lexicon ── */}
      <Card
        title="📖 Santali–English शब्दकोश"
        subtitle={`R. C. Hansdah & N. C. Murmu (IISc/NAL, 2003) से चुने गए ${OLCHIKI_DICTIONARY.length} शब्द — पूरी तरह ऑफ़लाइन`}
      >
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-56 flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="DAG, PUTHI, mID, BES… (Santali / English / हिन्दी में खोजो)"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <Select
            compact
            value={kind}
            onChange={setKind}
            options={OLCHIKI_KINDS.map((k) => ({ value: k.value, label: k.label }))}
            label="श्रेणी"
          />
          {query.trim() && (
            <Button variant="soft" onClick={() => void askAi()} disabled={aiLoading}>
              {aiLoading ? <Spinner label="" /> : "🧠 AI से पूछो"}
            </Button>
          )}
        </div>

        {/* Exact match highlight */}
        {exact && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
            <p className="text-sm font-black text-slate-900">
              {exact.word} <span className="text-xs font-semibold text-emerald-600">({exact.pos})</span>
              {exact.dev && <span className="ml-2 font-bold text-indigo-700">{exact.dev}</span>}
            </p>
            <p className="mt-1 text-sm text-slate-700">{exact.en}</p>
            <p className="text-xs text-slate-500">{exact.hi}</p>
          </div>
        )}

        {aiLoading && (
          <div className="mt-3">
            <Spinner label="Nemotron सोच रहा है…" />
          </div>
        )}
        {aiError && <div className="mt-3"><FriendlyError message={aiError} /></div>}
        {aiResult && (
          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
            <div className="mb-1"><EngineBadge meta={aiResult} /></div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-500">{t("meaning")}</p>
            <RichText text={aiResult.meaning} />
            {aiResult.example && (
              <p className="mt-2 text-xs text-slate-600">
                🌱 {aiResult.example}
              </p>
            )}
          </div>
        )}

        <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.slice(0, 36).map((e) => (
            <div key={e.word} className="rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-indigo-300 hover:bg-indigo-50/40">
              <p className="text-sm font-black text-slate-900">
                {e.word} <span className="text-[10px] font-semibold text-slate-400">({e.pos})</span>
                {e.dev && <span className="ml-1.5 text-xs font-bold text-indigo-700">{e.dev}</span>}
              </p>
              <p className="text-xs font-medium text-slate-700">{e.en}</p>
              <p className="text-[11px] text-slate-400">{e.hi}</p>
            </div>
          ))}
        </div>
        {entries.length === 0 && (
          <p className="mt-3 text-sm text-slate-400">कोई शब्द नहीं मिला — "DAG" (पानी) या "PUTHI" (किताब) आज़माओ।</p>
        )}
        {entries.length > 36 && (
          <p className="mt-2 text-[11px] text-slate-400">
            और शब्द देखने के लिए खोज या श्रेणी बदलो ({entries.length} मिले)।
          </p>
        )}
      </Card>
    </div>
  );
}

export default function DictionaryPage() {
  const { mode } = useMode();
  const { studentLanguage, setStudentLanguage } = useLangs();
  const t = makeT(studentLanguage);
  const langDef = getLanguage(studentLanguage);
  const pageTitle = useLocalized(t("dictionary"), studentLanguage);
  const pageSub = useLocalized(t("dictSub"), studentLanguage);

  const [tab, setTab] = useState<DictMode>("words");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookup = async (q: string) => {
    const txt = q.trim();
    if (!txt || loading) return;
    setLoading(true);
    setError("");
    const res = await runAiOp<DictionaryResult>("dictionary", { query: txt, language: studentLanguage }, mode);
    if (res.ok && res.data) setResult(res.data);
    else setError(res.friendly ?? "Could not find this word. Please try again.");
    setLoading(false);
  };

  return (
    <div className="gs-animate mx-auto max-w-4xl space-y-4">
      <header>
        <h1 className="text-2xl font-black text-indigo-900">{pageTitle}</h1>
        <p className="text-sm text-slate-500">{pageSub}</p>
      </header>

      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab("words")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition ${
            tab === "words" ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50"
          }`}
        >
          📚 {t("dictionary")} (हिन्दी / {langDef.name})
        </button>
        <button
          onClick={() => setTab("olchiki")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition ${
            tab === "olchiki" ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50"
          }`}
        >
          ᱥᱟᱱᱛᱟᱲ Ol Chiki — Santali शब्दकोश
        </button>
        <button
          onClick={() => setTab("ho")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition ${
            tab === "ho" ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50"
          }`}
        >
          🕉️ English–Ho शब्दकोश (Deeney 1975)
        </button>
        <button
          onClick={() => setTab("mundari")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition ${
            tab === "mundari" ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50"
          }`}
        >
          🗣️ Mundari–English शब्दकोश (SIL 2013)
        </button>
      </div>

      {tab === "olchiki" ? (
        <OlChikiMode mode={mode} studentLanguage={studentLanguage} />
      ) : tab === "ho" ? (
        <HoMode mode={mode} studentLanguage={studentLanguage} />
      ) : tab === "mundari" ? (
        <MundariMode mode={mode} studentLanguage={studentLanguage} />
      ) : (
        <>
          <Card className="border-indigo-100">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-56 flex-1">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Word / शब्द
                </label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void lookup(query)}
                  placeholder={t("dictPh")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <Select
                compact
                value={studentLanguage}
                onChange={(v) => setStudentLanguage(v as LanguageCode)}
                options={LANGUAGE_LIST.map((l) => ({ value: l.code, label: l.nativeName }))}
                label={t("answerLang")}
              />
              <Button onClick={() => void lookup(query)} disabled={loading || !query.trim()}>
                {loading ? <Spinner label="" /> : t("lookUp")}
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {DICTIONARY.slice(0, 12).map((d) => (
                <button
                  key={d.hi}
                  onClick={() => void lookup(d.hi)}
                  disabled={loading}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {d.hi}
                </button>
              ))}
            </div>
          </Card>

          {error && <FriendlyError message={error} />}

          {result && (
            <Card className="border-emerald-100" title={`📖 ${result.word || query}`}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <EngineBadge meta={result} />
                <Badge tone={result.source === "exact" ? "emerald" : result.source === "ai" ? "indigo" : "amber"}>
                  {result.source === "exact"
                    ? t("dictBadgeExact")
                    : result.source === "ai"
                      ? t("dictBadgeAI")
                      : t("dictBadgeOffline")}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl bg-indigo-50/70 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-500">{t("meaning")}</p>
                  <RichText text={result.meaning} className="text-base" />
                </div>
                {result.translation && result.translation !== result.word && (
                  <div className="rounded-xl bg-sky-50/70 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-sky-500">
                      {t("dictTransLabel", { lang: langDef.name })}
                    </p>
                    <p className="text-base font-bold text-slate-900">{result.translation}</p>
                  </div>
                )}
                {result.example && (
                  <div className="rounded-xl bg-emerald-50/70 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">{t("example")}</p>
                    <RichText text={result.example} />
                  </div>
                )}
                {isTtsSupported() && (
                  <Button variant="soft" className="px-3 py-1.5 text-xs" onClick={() => speak(`${result.word}। ${result.meaning}`, studentLanguage)}>
                    {t("readAloud")}
                  </Button>
                )}
              </div>
            </Card>
          )}

          {!result && !loading && !error && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-400">
              <GyanuBubble text={t("dictEmpty", { n: String(DICTIONARY.length) })} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
