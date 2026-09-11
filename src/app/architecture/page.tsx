"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️ Architecture — in-app documentation of the LLM / AI / backend design,
// including the offline capability matrix and per-feature pipelines.
// ─────────────────────────────────────────────────────────────────────────────
import { Badge, Card } from "@/components/ui";
import { StatusBadge } from "@/components/app-shell";

function Pipe({ steps, note }: { steps: Array<[string, string]>; note?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
        {steps.map(([icon, label], i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="rounded-lg bg-white px-2 py-1 shadow-sm">{icon} {label}</span>
            {i < steps.length - 1 && <span className="text-indigo-400">↓</span>}
          </span>
        ))}
      </div>
      {note && <p className="mt-2 text-[11px] text-slate-500">{note}</p>}
    </div>
  );
}

const FEATURES: Array<{ title: string; icon: string; desc: string; steps: Array<[string, string]>; note?: string }> = [
  {
    title: "Ask AI — Student Tutor",
    icon: "💬",
    desc: "Free-form question → intent + concept + child-level pedagogy in the selected language.",
    steps: [["👧", "Question"], ["🗄️", "Candidate retrieval (DB)"], ["🧠", "Nemotron tutor prompt"], ["✅", "Zod + script-purity validation"], ["👧", "Answer (steps, example, takeaway)"]],
    note: "Candidates are a small retrieved subset — the full database is never sent to the model. Predefined answers do not exist.",
  },
  {
    title: "Semantic Lesson Search",
    icon: "🔎",
    desc: "Natural-language queries (“पानी से बादल कैसे बनते हैं?”) map to real lessons.",
    steps: [["⌨️", "Query"], ["⚡", "Fast keyword candidate set"], ["🧠", "Nemotron semantic ranking"], ["🛡️", "Lesson-ID validation against DB"], ["📖", "Real lesson opened"]],
    note: "Nemotron can only pick IDs from the provided candidate list — it cannot invent lessons.",
  },
  {
    title: "Classroom Translation (Voice→Voice)",
    icon: "🗣️",
    desc: "Teacher Hindi speech → STT → meaning → pedagogical adaptation → mother tongue → TTS.",
    steps: [["🎙️", "STT (browser, teacher lang)"], ["🧠", "Nemotron translate+pedagogy prompt"], ["🔤", "Single-language output (no Hindi/English mixing)"], ["✅", "Script-purity check + repair pass"], ["🔊", "TTS (nearest voice for tribal languages)"]],
    note: "Every stage's latency is measured in the Live Meet UI; the ≤3s SIH target is shown as measured, never claimed.",
  },
  {
    title: "Worksheets & Quizzes",
    icon: "📝",
    desc: "Structured generation grounded in grade, subject, lesson, objective and language.",
    steps: [["🗄️", "Real lesson row (DB)"], ["🧠", "Worksheet/quiz prompt (lesson context only)"], ["📐", "Zod schema validation (no HTML/code from model)"], ["🖨️", "Existing GyanSetu worksheet UI / quiz UI"]],
    note: "Quiz difficulty adapts to the student's real stored performance.",
  },
  {
    title: "Adaptive Learning",
    icon: "🧭",
    desc: "“What should I learn next?” reasoned from real database progress.",
    steps: [["🗄️", "Actual progress rows (PostgreSQL)"], ["🧠", "Nemotron recommend prompt"], ["🛡️", "Recommended lesson must exist in curriculum"], ["🧒", "Validated next step shown"]],
    note: "Nemotron never writes student records and never invents scores/history.",
  },
  {
    title: "Contextual Dictionary",
    icon: "📚",
    desc: "Exact words → local lookup (1 ms, no LLM). Ambiguous/misspelled → Nemotron.",
    steps: [["⚡", "Exact match? → local entry"], ["🧠", "Else Nemotron understands meaning/usage"], ["🗣️", "Meaning + translation + example in student language"]],
  },
  {
    title: "Flashcards",
    icon: "🃏",
    desc: "Visual card content from the lesson, rendered by the existing UI.",
    steps: [["🗄️", "Lesson keywords (DB)"], ["🧠", "Nemotron flashcard prompt (content only)"], ["📐", "Schema validation"], ["🃏", "Flip-card UI + TTS"]],
    note: "The model generates card CONTENT only — never images, code or layout.",
  },
];

const OFFLINE_MATRIX: Array<[string, string, string]> = [
  ["📝 Hindi → Tribal translation", "✅", "Local glossary → word-bank → transliteration fallback chain (prototype quality)"],
  ["🔊 Text → Speech", "✅", "Browser speechSynthesis with nearest available voice (hi-IN) for tribal languages"],
  ["🎙️ Speech → Text", "✅", "Browser SpeechRecognition; typed-input fallback when unavailable (layered fallback chain)"],
  ["🗣️ Voice → Voice", "✅", "Local STT → offline translation → local TTS pipeline in the Live Meet bridge"],
  ["📚 Lesson delivery", "✅", "Bundled + IndexedDB-cached curriculum (12 NIPUN lessons) with local explanations"],
  ["📝 Worksheets", "✅", "Nemotron-generated worksheets cached on-device + synced sample pack fallback"],
  ["🃏 Flashcards", "✅", "Nemotron-generated decks cached on-device + local keyword/dictionary fallback"],
  ["🧠 Cached AI answers", "✅", "Every online Nemotron result is mirrored into IndexedDB and replayed offline (labeled “Cached Nemotron”)"],
  ["📊 Learning progress", "✅", "Quiz results queued in IndexedDB"],
  ["🔄 Synchronization", "🌐 when available", "Two-way: queued records push UP to PostgreSQL; the Nemotron generation history pulls DOWN into IndexedDB — automatically when ONLINE is selected"],
];

export default function ArchitecturePage() {
  return (
    <div className="gs-animate space-y-5">
      <header>
        <h1 className="text-2xl font-black text-indigo-900">⚙️ Technical Architecture</h1>
        <p className="text-sm text-slate-500">
          How the LLM (Nemotron 3 Ultra), AI orchestration and backend fit together — and exactly what works offline.
        </p>
      </header>

      {/* Overall flow */}
      <Card title="🧠 Central AI Architecture" subtitle="One Nemotron service for the whole platform — no per-page AI clients">
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center text-xs font-bold text-slate-700">
          <div>GyanSetu UI</div>
          <div className="text-indigo-400">↓</div>
          <div>API Layer — <code className="rounded bg-white px-1">POST /api/ai</code> (server-side only)</div>
          <div className="text-indigo-400">↓</div>
          <div>AI Orchestrator — grounding retrieval → prompt → Nemotron → validation</div>
          <div className="text-indigo-400">↓</div>
          <div>🧠 NVIDIA Nemotron 3 Ultra — OpenRouter (primary) → NVIDIA NIM direct (fallback)</div>
          <div className="text-indigo-400">↓</div>
          <div>Structured, validated result → GyanSetu feature → Teacher / Student</div>
        </div>
        <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
          <div className="rounded-xl bg-indigo-50/60 p-3">
            <b className="text-indigo-700">Resilience:</b> provider chain with last-working-provider memory, 429 fast-fail, round-robin retries on 5xx (NVIDIA's free tier 503s), 25–45s timeouts, request abort.
          </div>
          <div className="rounded-xl bg-emerald-50/60 p-3">
            <b className="text-emerald-700">Latency:</b> reasoning disabled on the low-latency path; exact lookups never call the LLM; measured latency shown in the UI.
          </div>
          <div className="rounded-xl bg-rose-50/60 p-3">
            <b className="text-rose-700">Security:</b> OPENROUTER_API_KEY / NVIDIA_API_KEY exist only in server code; payload size limits; Zod validation of input AND model output; child-friendly errors only.
          </div>
          <div className="rounded-xl bg-amber-50/60 p-3">
            <b className="text-amber-700">Truthfulness:</b> every result carries its real engine (🧠 Nemotron 3 Ultra vs 📴 Offline AI) — the badge never guesses.
          </div>
        </div>
      </Card>

      {/* Per-feature pipelines */}
      <Card title="🔀 Feature Pipelines" subtitle="Every semantic feature flows through the same centralized orchestrator">
        <div className="grid gap-4 lg:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-900">
                {f.icon} {f.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{f.desc}</p>
              <div className="mt-2">
                <Pipe steps={f.steps} note={f.note} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Offline matrix */}
      <Card title="📴 Offline Capability Matrix" subtitle="What keeps working with zero connectivity — and what syncs later">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4">Feature</th>
                <th className="py-2 pr-4">Offline?</th>
                <th className="py-2">What happens</th>
              </tr>
            </thead>
            <tbody>
              {OFFLINE_MATRIX.map(([f, ok, what]) => (
                <tr key={f} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-semibold text-slate-700">{f}</td>
                  <td className="py-2 pr-4">
                    <Badge tone={ok === "✅" ? "emerald" : "amber"}>{ok}</Badge>
                  </td>
                  <td className="py-2 text-slate-500">{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          Honest note: offline translation uses a prototype glossary (community validation pending); offline mode
          never claims Nemotron. Production roadmap: Whisper (STT) → NLLB (translation) → Piper (TTS) in the APK.
        </p>
      </Card>

      {/* Files */}
      <Card title="🗂️ Code Map" subtitle="Where each responsibility lives">
        <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
          {[
            ["src/lib/ai/nemotron-client.ts", "Single Nemotron HTTP client: provider chain, retries, JSON extraction"],
            ["src/lib/ai/orchestrator.ts", "Grounding retrieval → specialized prompts → schema + language validation"],
            ["src/lib/ai/prompts.ts", "8 task-specific system prompts (tutor, translation, search, worksheet, quiz, recommend, dictionary, flashcards)"],
            ["src/lib/ai/schemas.ts", "Zod schemas validating every structured model output"],
            ["src/lib/ai/types.ts", "Shared AI contracts (engine metadata rides every result)"],
            ["src/app/api/ai/route.ts", "One centralized API endpoint — keys never leave the server"],
            ["src/lib/local/engine.ts", "Offline deterministic engine: glossary → word-bank → transliteration"],
            ["src/lib/local/store.ts", "IndexedDB cache + offline progress queue (sync)"],
            ["src/db/*", "PostgreSQL via Drizzle: lessons, progress, worksheets, ai_generations (every Nemotron result persisted)"],
            ["src/app/api/generations/route.ts", "Re-download endpoint: devices pull the generation history into IndexedDB for offline use"],
            ["src/lib/cache-key.ts", "Deterministic input hashes shared by server (PostgreSQL) and device (IndexedDB) caches"],
            ["src/lib/languages.ts", "Modular language registry: 26-language architecture, script purity, transliteration"],
          ].map(([file, desc]) => (
            <div key={file} className="rounded-xl border border-slate-200 p-3">
              <code className="text-[11px] font-bold text-indigo-700">{file}</code>
              <p className="mt-1 text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="🟢 Live Engine Status" subtitle="As reported by the server right now">
        <StatusBadge />
        <p className="mt-2 text-xs text-slate-500">
          “Configured” = a valid provider key exists server-side. “Verified ✓” = a real Nemotron ping succeeded
          (measured latency shown). If verification fails, the badge says so honestly.
        </p>
      </Card>
    </div>
  );
}
