"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Ask AI — fully localized, gamified: mascot invites questions, every answer
// earns stars. Answers come in the selected language only.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import { useLangs, useMode } from "@/components/providers";
import { runAiOp } from "@/lib/api";
import type { AskResult } from "@/lib/ai/types";
import { getLanguage, LANGUAGE_LIST, type LanguageCode } from "@/lib/languages";
import { makeT } from "@/lib/i18n";
import { recordAsk, recordCachedUse } from "@/lib/gamification";
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
import { AwardChip, GyanuBubble } from "@/components/gamification";
import { isTtsSupported, speak, stopSpeaking } from "@/components/speech";
import { useLocalized } from "@/lib/pageLocalize";

interface ChatItem {
  question: string;
  result?: AskResult;
  error?: string;
}

const SUGGESTIONS = [
  "पानी बादल कैसे बनता है?",
  "5 और 3 को जोड़ने पर कितना होता है?",
  "चालाक खरगोश की कहानी में खरगोश ने शेर को कैसे हराया?",
  "पेड़ अपना खाना कहाँ से लाते हैं?",
  "संज्ञा किसे कहते हैं?",
];

export default function AskPage() {
  const { mode } = useMode();
  const { studentLanguage, setStudentLanguage } = useLangs();
  const t = makeT(studentLanguage);
  const langDef = getLanguage(studentLanguage);
  const pageTitle = useLocalized(t("askAi"), studentLanguage);
  const pageSub = useLocalized(t("askSub", { lang: `${langDef.name} (${langDef.nativeName})` }), studentLanguage);

  const [question, setQuestion] = useState("");
  const [grade, setGrade] = useState("2");
  const [items, setItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState("");
  const [awards, setAwards] = useState<Record<number, number>>({});
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [items, loading]);

  useEffect(() => () => stopSpeaking(), []);

  const ask = async (q: string) => {
    const txt = q.trim();
    if (!txt || loading) return;
    setQuestion("");
    setError("");
    setItems((prev) => [...prev, { question: txt }]);
    setLoading(true);
    const res = await runAiOp<AskResult>(
      "ask",
      { question: txt, studentLanguage, grade: Number(grade) || undefined },
      mode,
    );
    const idx = items.length;
    if (res.ok && res.data) {
      if (res.data.cached) recordCachedUse();
      const gained = recordAsk();
      setAwards((prev) => ({ ...prev, [idx]: gained }));
      setItems((prev) => {
        const next = [...prev];
        next[next.length - 1] = { question: txt, result: res.data };
        return next;
      });
    } else {
      setItems((prev) => {
        const next = [...prev];
        next[next.length - 1] = { question: txt, error: res.friendly ?? "AI is temporarily unavailable. Please try again." };
        return next;
      });
    }
    setLoading(false);
  };

  const speakText = (text: string) => {
    setSpeaking(text);
    speak(text, studentLanguage, () => setSpeaking(""));
  };

  return (
    <div className="gs-animate mx-auto max-w-4xl space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-indigo-900">{pageTitle}</h1>
          <p className="text-sm text-slate-500">{pageSub}</p>
          <p className="mt-1 inline-block rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-[11px] font-semibold text-indigo-700">
            ✨ {t("askAnyLangNote", { lang: langDef.name })}
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            compact
            value={studentLanguage}
            onChange={(v) => setStudentLanguage(v as LanguageCode)}
            options={LANGUAGE_LIST.map((l) => ({ value: l.code, label: l.nativeName }))}
            label={t("answerLang")}
          />
          <Select
            compact
            value={grade}
            onChange={setGrade}
            options={["1", "2", "3", "4", "5"].map((g) => ({ value: g, label: `Class ${g}` }))}
            label={t("classLabel")}
          />
        </div>
      </header>

      <Card className="border-indigo-100">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void ask(question)}
            placeholder={t("askPh")}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <Button onClick={() => void ask(question)} disabled={loading || !question.trim()}>
            {loading ? <Spinner label="" /> : t("ask")}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{t("try")}</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => void ask(s)}
              disabled={loading}
              className="rounded-full border border-indigo-100 bg-indigo-50/60 px-2.5 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      {error && <FriendlyError message={error} />}

      <div ref={listRef} className="max-h-[65vh] space-y-4 overflow-y-auto pb-2">
        {items.length === 0 && !loading && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-400">
            <GyanuBubble text={`${t("askEmptyTitle")} — ${t("askEmptyText")}`} />
          </div>
        )}

        {items.map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm">
                {item.question}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                {item.error ? (
                  <FriendlyError message={item.error} />
                ) : item.result ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <EngineBadge meta={item.result} />
                      {item.result.intent === "outside_scope" && <Badge tone="amber">{t("outsideLessons")}</Badge>}
                      {item.result.concept && <Badge tone="sky">📘 {item.result.concept}</Badge>}
                      {awards[i] != null && <AwardChip xp={awards[i]} />}
                    </div>
                    <div className="rounded-xl bg-indigo-50/70 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-500">{t("answerLabel")}</p>
                      <RichText text={item.result.answer} />
                    </div>
                    {item.result.explanation && (
                      <div>
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{t("explanation")}</p>
                        <RichText text={item.result.explanation} />
                      </div>
                    )}
                    {item.result.steps.length > 0 && (
                      <div>
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{t("steps")}</p>
                        <ol className="list-decimal space-y-0.5 pl-5 text-sm text-slate-700">
                          {item.result.steps.map((s, si) => (
                            <li key={si}>{s}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {item.result.localExample && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">{t("example")}</p>
                        <RichText text={item.result.localExample} />
                      </div>
                    )}
                    {item.result.takeaway && (
                      <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">{t("takeaway")}</p>
                        <RichText text={item.result.takeaway} />
                      </div>
                    )}
                    {item.result.followUp && (
                      <p className="text-xs font-semibold text-indigo-600">{t("followUpLabel")} {item.result.followUp}</p>
                    )}
                    {item.result.note && <p className="text-[10px] text-slate-400">{item.result.note}</p>}
                    {isTtsSupported() && (
                      <OutputActions
                        text={item.result.answer + "\n" + item.result.explanation + "\n" + item.result.localExample}
                        onSpeak={speakText}
                        speaking={speaking === item.result.answer}
                      />
                    )}
                  </div>
                ) : (
                  <Spinner label={mode === "online" ? t("askThinkOnline") : t("askThinkOffline")} />
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && items.length > 0 && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Spinner label={mode === "online" ? t("askThinkOnline") : t("askThinkOffline")} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
