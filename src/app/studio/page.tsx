"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 📤 Upload Studio — teacher uploads text / PDF / txt file / link.
// Pipeline on publish: Teacher → Nemotron → Student. Students see it in
// 🎒 My Class, where Nemotron converts it into their language with steps,
// examples and a takeaway.
// ─────────────────────────────────────────────────────────────────────────────
import { Suspense, useEffect, useState } from "react";
import { useLangs, useUser } from "@/components/providers";
import { fetchClassContent, getLessons, publishContent } from "@/lib/api";
import { makeT } from "@/lib/i18n";
import { Badge, Button, Card, FriendlyError, Select } from "@/components/ui";
import { GyanuBubble } from "@/components/gamification";
import { useLocalized } from "@/lib/pageLocalize";

interface LessonRow {
  slug: string;
  titleHi: string;
  class: number;
  subject: string;
}

function StudioPage() {
  const { studentLanguage } = useLangs();
  const { name, role } = useUser();
  const t = makeT(studentLanguage);
  const pageTitle = useLocalized(t("studio"), studentLanguage);
  const pageSub = useLocalized(t("studioSub"), studentLanguage);

  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [kind, setKind] = useState<"text" | "file" | "link">("text");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [lessonSlug, setLessonSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<Array<{ id: string; title: string; kind: string; createdAt: string }>>([]);

  useEffect(() => {
    void getLessons().then((res) => {
      if (res.ok && Array.isArray(res.data)) setLessons(res.data as LessonRow[]);
    });
    void fetchClassContent().then((res) => {
      if (res.ok) setRecent(res.data!.slice(0, 6));
    });
  }, []);

  const publish = async () => {
    if (!title.trim() || busy) return;
    if (kind === "text" && !text.trim()) {
      setError("Content is empty — write something first.");
      return;
    }
    if (kind === "link" && !url.trim()) {
      setError("Paste a link first.");
      return;
    }
    if (kind === "file" && !file) {
      setError("Choose a file first.");
      return;
    }
    setBusy(true);
    setError("");
    setNote("");
    const form = new FormData();
    form.set("title", title);
    form.set("kind", kind);
    form.set("lessonSlug", lessonSlug);
    form.set("author", role === "teacher" && name ? name : "शिक्षक");
    if (kind === "text") form.set("text", text);
    if (kind === "link") form.set("url", url);
    if (kind === "file" && file) form.set("file", file);

    const res = await publishContent(form);
    if (res.ok) {
      setNote(t("uploadSuccess"));
      setTitle("");
      setText("");
      setUrl("");
      setFile(null);
      void fetchClassContent().then((r) => {
        if (r.ok) setRecent(r.data!.slice(0, 6));
      });
    } else {
      setError(res.friendly ?? t("uploadFail"));
    }
    setBusy(false);
  };

  const kindLabel = (k: string) =>
    k === "worksheet" ? "📝 Worksheet" : k === "flashcards" ? "🃏 Flashcards" : k === "link" ? "🔗 Link" : k === "file" ? "📎 File" : "✍️ Text";

  return (
    <div className="gs-animate mx-auto max-w-4xl space-y-4">
      <header>
        <h1 className="text-2xl font-black text-indigo-900">{pageTitle}</h1>
        <p className="text-sm text-slate-500">{pageSub}</p>
      </header>

      <Card title={t("uploadTitle")} subtitle={t("uploadSub")} className="border-indigo-100">
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-56 flex-1">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {t("uploadTitleLabel")}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="जैसे: पानी की कहानी"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <Select
              compact
              value={kind}
              onChange={(v) => setKind(v as "text" | "file" | "link")}
              options={[
                { value: "text", label: t("uploadText") },
                { value: "file", label: t("uploadFile") },
                { value: "link", label: t("uploadLink") },
              ]}
              label={t("uploadKind")}
            />
            <Select
              compact
              value={lessonSlug}
              onChange={setLessonSlug}
              options={[
                { value: "", label: t("allSubjects") },
                ...lessons.map((l) => ({ value: l.slug, label: `${l.titleHi} (${l.class})` })),
              ]}
              label={t("uploadLesson")}
            />
          </div>

          {kind === "text" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder={t("uploadTextarea")}
              className="w-full resize-none rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-indigo-500"
            />
          )}
          {kind === "link" && (
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("uploadUrlPh")}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          )}
          {kind === "file" && (
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 hover:border-indigo-400 hover:bg-indigo-50/40">
              <span className="text-2xl">📎</span>
              <p className="mt-1 font-semibold">{file ? file.name : "txt / pdf file चुनें — PDF भी चलेगा"}</p>
              <input
                type="file"
                accept=".txt,.md,.pdf,text/plain,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => void publish()} disabled={busy || !title.trim()}>
              {busy ? "…" : t("uploadPublish")}
            </Button>
            {note && <span className="text-xs font-semibold text-emerald-700">{note}</span>}
          </div>
          <p className="text-[11px] text-slate-400">{t("uploadNote")}</p>
        </div>
      </Card>

      {error && <FriendlyError message={error} />}

      <Card title="📚 हाल में प्रकाशित" subtitle="Students see these in 🎒 My Class">
        {recent.length === 0 && <GyanuBubble text={t("classFeedEmpty")} />}
        <div className="mt-2 space-y-2">
          {recent.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
              <div className="min-w-40 flex-1">
                <p className="text-sm font-bold text-slate-800">{r.title}</p>
                <p className="text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <Badge tone="indigo">{kindLabel(r.kind)}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function StudioPageWrapper() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">…</p>}>
      <StudioPage />
    </Suspense>
  );
}
