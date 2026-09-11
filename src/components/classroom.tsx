"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Magic Classroom / Live Meet — localized + gamified for young learners.
// Voice→Voice bridge measures every stage (STT ms, AI ms, TTS ms) honestly.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import { useLangs, useMode } from "@/components/providers";
import { runAiOp } from "@/lib/api";
import type { TranslateResult } from "@/lib/ai/types";
import { getLanguage, LANGUAGE_LIST, type LanguageCode } from "@/lib/languages";
import { makeT } from "@/lib/i18n";
import { Badge, Button, Card, EngineBadge, FriendlyError, RichText, Select, Spinner } from "@/components/ui";
import { AwardChip } from "@/components/gamification";
import { recordBridge } from "@/lib/gamification";
import { isSpeechRecognitionSupported, isTtsSupported, speak, startSpeechInput, stopSpeaking } from "@/components/speech";
import { useLocalized } from "@/lib/pageLocalize";

const SAMPLE_SENTENCES = [
  "आज हम पानी के चक्र के बारे में सीखेंगे।",
  "आज बच्चों को संज्ञा समझानी है।",
  "5 आम और 3 आम मिलाकर कितने आम होते हैं?",
  "धूप में गीले कपड़े क्यों सूख जाते हैं?",
];

type Stage = "idle" | "stt" | "ai" | "tts";

export default function ClassroomPanel({ compact }: { compact?: boolean }) {
  const { mode } = useMode();
  const { teacherLanguage, setTeacherLanguage, studentLanguage, setStudentLanguage } = useLangs();
  const t = makeT(studentLanguage);

  const [teacherText, setTeacherText] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [latencies, setLatencies] = useState<{ stt?: number; ai?: number; tts?: number }>({});
  const [autoBridge, setAutoBridge] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [award, setAward] = useState(0);
  const [awardNonce, setAwardNonce] = useState(0);

  const recRef = useRef<{ stop: () => void } | null>(null);
  const sttStart = useRef(0);
  const aiStart = useRef(0);

  useEffect(() => () => stopSpeaking(), []);

  const run = async (text: string, speakAfter: boolean) => {
    const txt = text.trim();
    if (!txt || loading) return;
    setLoading(true);
    setError("");
    aiStart.current = Date.now();
    setStage("ai");
    const res = await runAiOp<TranslateResult>(
      "translate",
      { text: txt, teacherLanguage, studentLanguage },
      mode,
    );
    const aiMs = Date.now() - aiStart.current;
    if (res.ok && res.data) {
      const final = { ...res.data, latencyMs: res.data.latencyMs || aiMs };
      setResult(final);
      setLatencies((prev) => ({ ...prev, ai: aiMs }));
      const gained = recordBridge();
      setAward(gained);
      setAwardNonce((n) => n + 1);
      if (speakAfter && isTtsSupported()) {
        setStage("tts");
        const ttsStart = Date.now();
        setSpeaking(true);
        speak(final.translation, studentLanguage, () => {
          setSpeaking(false);
          setStage("idle");
          setLatencies((prev) => ({ ...prev, tts: Date.now() - ttsStart }));
        });
      } else {
        setStage("idle");
      }
    } else {
      setError(res.friendly ?? "Translation failed. Please try again.");
      setStage("idle");
    }
    setLoading(false);
  };

  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      setStage("idle");
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      setError(t("classMicFail"));
      return;
    }
    setStage("stt");
    sttStart.current = Date.now();
    const handle = startSpeechInput(
      teacherLanguage,
      (text) => {
        const sttMs = Date.now() - sttStart.current;
        setLatencies((prev) => ({ ...prev, stt: sttMs }));
        setTeacherText((prev) => (prev ? prev + " " : "") + text);
        setListening(false);
        recRef.current = null;
        if (autoBridge) void run(text, autoSpeak);
        else setStage("idle");
      },
      () => {
        setListening(false);
        recRef.current = null;
        setStage("idle");
      },
    );
    if (!handle) {
      setError(t("classMicStartFail"));
      setStage("idle");
      return;
    }
    recRef.current = handle;
    setListening(true);
  };

  const speakResult = (text: string) => {
    const ttsStart = Date.now();
    setStage("tts");
    setSpeaking(true);
    speak(text, studentLanguage, () => {
      setSpeaking(false);
      setStage("idle");
      setLatencies((prev) => ({ ...prev, tts: Date.now() - ttsStart }));
    });
  };

  const studentDef = getLanguage(studentLanguage);
  const teacherDef = getLanguage(teacherLanguage);
  const totalMs = (latencies.stt ?? 0) + (latencies.ai ?? 0) + (latencies.tts ?? 0);

  // Nemotron whole-page translation for the two classroom card titles.
  const inputTitle = useLocalized(t("classInputTitle"), studentLanguage);
  const outputTitle = useLocalized(t("classOutputTitle"), studentLanguage);

  const pipelineStages: Array<{ id: Stage; icon: string; label: string }> = [
    { id: "stt", icon: "🎙️", label: t("classSTT") },
    { id: "ai", icon: "🧠", label: mode === "online" ? "Nemotron" : t("offlineAI") },
    { id: "tts", icon: "🔊", label: t("classTTS") },
  ];

  return (
    <div className="space-y-4">
      {/* ── Pipeline visual ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {t("classPipeline")} — 👩‍🏫 {t("teacher")}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {pipelineStages.map((s, i) => (
            <span key={s.id} className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  stage === s.id
                    ? "border-indigo-400 bg-indigo-600 text-white shadow"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {s.icon} {s.label}
                {latencies[s.id === "stt" ? "stt" : s.id === "ai" ? "ai" : "tts"] != null && (
                  <span className="font-normal opacity-80">
                    {((latencies[s.id === "stt" ? "stt" : s.id === "ai" ? "ai" : "tts"] ?? 0) / 1000).toFixed(1)}s
                  </span>
                )}
              </span>
              {i < pipelineStages.length - 1 && <span className="text-slate-300">→</span>}
            </span>
          ))}
          <span className="text-sm">
            🧑‍🎓 {t("classStudent")} ({studentDef.name})
          </span>
          {totalMs > 0 && (
            <Badge tone={totalMs <= 3000 ? "emerald" : "amber"} className="ml-auto">
              {t("classTotal")} {(totalMs / 1000).toFixed(1)}s {totalMs <= 3000 ? "≤ 3s ✓" : ""}
            </Badge>
          )}
        </div>
      </div>

      <div className={`grid gap-4 ${compact ? "" : "lg:grid-cols-2"}`}>
        {/* ── Teacher side ── */}
        <Card
          title={inputTitle}
          subtitle={t("classInputSub", { lang: `${teacherDef.name} (${teacherDef.nativeName})` })}
          className="border-amber-100 bg-gradient-to-b from-amber-50/60 to-white"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Select
              compact
              value={teacherLanguage}
              onChange={(v) => setTeacherLanguage(v as LanguageCode)}
              options={LANGUAGE_LIST.map((l) => ({ value: l.code, label: l.nativeName }))}
              label={t("teacherLang")}
            />
            <Select
              compact
              value={studentLanguage}
              onChange={(v) => setStudentLanguage(v as LanguageCode)}
              options={LANGUAGE_LIST.map((l) => ({ value: l.code, label: l.nativeName }))}
              label={t("studentLang")}
            />
          </div>

          <textarea
            value={teacherText}
            onChange={(e) => setTeacherText(e.target.value)}
            rows={4}
            placeholder="यहाँ हिन्दी में लिखें या बोलें…"
            className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button onClick={() => void run(teacherText, autoSpeak)} disabled={loading || !teacherText.trim()}>
              {t("sendClass")}
            </Button>
            {isSpeechRecognitionSupported() && (
              <Button variant={listening ? "danger" : "soft"} onClick={toggleMic} className={listening ? "gs-mic-live" : ""}>
                {listening ? t("stopMic") : t("listen")}
              </Button>
            )}
            {award > 0 && <AwardChip key={awardNonce} xp={award} label={t("bridgeAward").split("+")[0]} />}
          </div>

          <div className="mt-3 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
              <input type="checkbox" checked={autoBridge} onChange={(e) => setAutoBridge(e.target.checked)} />
              {t("voiceBridge")} <span className="font-normal text-slate-400">{t("classBridgeHint")}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
              <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
              {t("autoSpeak")}
            </label>
          </div>

          <div className="mt-3 border-t border-amber-100 pt-3">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">{t("classTryLabel")}</p>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_SENTENCES.map((s) => (
                <button
                  key={s}
                  onClick={() => void run(s, autoSpeak)}
                  className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] text-amber-800 hover:bg-amber-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Student side ── */}
        <Card
          title={outputTitle}
          subtitle={t("classOutputSub", { lang: `${studentDef.name} (${studentDef.nativeName})` })}
          className="border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white"
        >
          {loading && (
            <div className="flex h-40 flex-col items-center justify-center gap-2">
              <Spinner label={mode === "online" ? t("classThinkOnline") : t("classThinkOffline")} />
              <span className="text-[11px] text-slate-400">{t("classHint", { lang: studentDef.name })}</span>
            </div>
          )}

          {!loading && error && <FriendlyError message={error} />}

          {!loading && !error && !result && (
            <div className="flex h-40 flex-col items-center justify-center text-center text-slate-400">
              <span className="gs-bounce text-3xl">🛰️</span>
              <p className="mt-2 max-w-xs text-xs">{t("classEmpty", { lang: studentDef.name })}</p>
            </div>
          )}

          {!loading && !error && result && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <EngineBadge meta={result} />
                <Badge tone={result.quality === "mixed" ? "amber" : "emerald"}>
                  {result.quality === "mixed" ? t("classMixed") : t("classPure", { lang: studentDef.name })}
                </Badge>
                {speaking && <Badge tone="rose">{t("classSpeaking")}</Badge>}
              </div>

              <div className="rounded-xl border border-indigo-100 bg-white p-3">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-indigo-400">
                  {t("classForChild", { lang: studentDef.name })}
                </p>
                <p className="text-base font-semibold leading-relaxed text-slate-900">{result.translation}</p>
                <div className="mt-2 flex items-center gap-2">
                  {isTtsSupported() && (
                    <Button variant="soft" className="px-2.5 py-1 text-xs" onClick={() => speakResult(result.translation)} disabled={speaking}>
                      {speaking ? "🔊…" : t("readAloud")}
                    </Button>
                  )}
                </div>
              </div>

              {result.adaptation && result.adaptation !== result.translation && (
                <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-sky-500">{t("classSimplified")}</p>
                  <RichText text={result.adaptation} />
                </div>
              )}

              {result.example && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-emerald-600">{t("example")}</p>
                  <RichText text={result.example} />
                </div>
              )}

              {result.note && (
                <p className="text-[11px] text-slate-400">
                  <span className="font-bold">{t("classNoteLabel")}:</span> {result.note}
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
