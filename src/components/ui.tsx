"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Shared GyanSetu UI kit — cards, buttons, selects, badges, radio groups,
// the engine badge (truthful AI source display) and a small rich-text
// renderer for Nemotron output (no HTML injection — React escapes by default).
// ─────────────────────────────────────────────────────────────────────────────
import type { ReactNode, ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { AiMeta } from "@/lib/ai/types";

export function Card({
  children,
  className = "",
  title,
  subtitle,
  icon,
}: {
  children?: ReactNode;
  className?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {(title || subtitle || icon) && (
        <header className="mb-4 flex items-start gap-3">
          {icon && (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-100 to-sky-100 text-xl">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
  type = "button",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "soft" | "danger" | "success";
  className?: string;
  type?: "button" | "submit";
  title?: string;
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-sky-600 text-white hover:from-indigo-700 hover:to-sky-700 shadow-sm",
    soft: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border border-slate-200",
    danger: "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  };
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Select({
  value,
  onChange,
  options,
  label,
  className = "",
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <label className={`inline-flex flex-col gap-1 ${className}`}>
      {label && <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>}
      <select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className={`rounded-xl border border-slate-300 bg-white font-medium text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${
          compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Badge({
  children,
  tone = "slate",
  className = "",
}: {
  children: ReactNode;
  tone?: "slate" | "indigo" | "emerald" | "amber" | "rose" | "sky";
  className?: string;
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Radio group with card-style options — used for the ONLINE/OFFLINE switch. */
export function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  columns = 2,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{
    value: T;
    label: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    tone?: "indigo" | "emerald" | "amber" | "slate";
  }>;
  columns?: 1 | 2;
}) {
  const tones: Record<string, string> = {
    indigo: "peer-checked:border-indigo-500 peer-checked:bg-indigo-50/60",
    emerald: "peer-checked:border-emerald-500 peer-checked:bg-emerald-50/60",
    amber: "peer-checked:border-amber-500 peer-checked:bg-amber-50/60",
    slate: "peer-checked:border-slate-500 peer-checked:bg-slate-50",
  };
  return (
    <div role="radiogroup" aria-label={name} className={`grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`relative flex cursor-pointer items-start gap-3 rounded-xl border-2 border-slate-200 p-3 transition hover:border-slate-300 ${
            value === opt.value ? tones[opt.tone ?? "indigo"] : ""
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="peer sr-only"
          />
          <span
            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
              value === opt.value ? "border-indigo-600" : "border-slate-300"
            }`}
          >
            {value === opt.value && <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              {opt.icon}
              {opt.label}
            </span>
            {opt.description && (
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                {opt.description}
              </span>
            )}
          </span>
        </label>
      ))}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
      {label ?? "Thinking…"}
    </span>
  );
}

export function FriendlyError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {message}
    </div>
  );
}

/** Truthful engine badge — reflects the actual backend execution path. */
export function EngineBadge({
  meta,
  className = "",
}: {
  meta?: Partial<AiMeta> | null;
  className?: string;
}) {
  if (!meta) return null;
  const isNemotron = meta.engine === "nemotron";
  const isCached = Boolean(meta.cached);
  let label: string;
  let toneClass: string;
  let sub: string;
  if (isNemotron && isCached) {
    label = "📦 Cached Nemotron";
    toneClass = "border-amber-200 bg-amber-50 text-amber-700";
    sub = "stored on-device, replayed offline";
  } else if (isNemotron) {
    label = "🧠 Nemotron 3 Ultra";
    toneClass = "border-indigo-200 bg-indigo-50 text-indigo-700";
    sub = meta.provider === "nvidia" ? "NVIDIA NIM direct" : "OpenRouter";
  } else {
    label = "📴 Offline AI";
    toneClass = "border-slate-300 bg-slate-100 text-slate-600";
    sub = "Local/Cached Engine";
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${toneClass} ${className}`}
      title={`Engine: ${label} • ${sub} • Latency: ${meta.latencyMs ?? "–"} ms`}
    >
      {label}
      {typeof meta.latencyMs === "number" && meta.latencyMs > 0 && !isCached && (
        <span className="font-normal opacity-70">{(meta.latencyMs / 1000).toFixed(1)}s</span>
      )}
    </span>
  );
}

/** Small rich-text renderer for AI output: bold, bullets, numbered lists, lines. */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;
  const blocks = text
    .replace(/\*\*(.+?)\*\*/g, "\u0001$1\u0002")
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const renderInline = (line: string, key: number) => {
    const parts = line.split(/(\u0001|\u0002)/);
    let bold = false;
    return (
      <span key={key}>
        {parts.map((part, i) => {
          if (part === "\u0001") {
            bold = true;
            return null;
          }
          if (part === "\u0002") {
            bold = false;
            return null;
          }
          return bold ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const items: ReactNode[] = [];
  let listBuffer: string[] = [];
  let numberedBuffer: string[] = [];

  const flushLists = (keyBase: string) => {
    if (listBuffer.length) {
      items.push(
        <ul key={keyBase + "-ul"} className="mt-2 space-y-1">
          {listBuffer.map((li, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-indigo-500">•</span>
              <span>{renderInline(li, i)}</span>
            </li>
          ))}
        </ul>,
      );
      listBuffer = [];
    }
    if (numberedBuffer.length) {
      items.push(
        <ol key={keyBase + "-ol"} className="mt-2 list-decimal space-y-1 pl-5">
          {numberedBuffer.map((li, i) => (
            <li key={i}>{renderInline(li, i)}</li>
          ))}
        </ol>,
      );
      numberedBuffer = [];
    }
  };

  blocks.forEach((block, idx) => {
    if (/^[-•]\s+/.test(block)) {
      flushLists("b" + idx);
      listBuffer.push(block.replace(/^[-•]\s+/, ""));
      return;
    }
    if (/^\d+[.)]\s+/.test(block)) {
      flushLists("b" + idx);
      numberedBuffer.push(block.replace(/^\d+[.)]\s+/, ""));
      return;
    }
    flushLists("b" + idx);
    items.push(
      <p key={idx} className="leading-relaxed">
        {renderInline(block, idx)}
      </p>,
    );
  });
  flushLists("end");

  return <div className={`space-y-1 text-sm text-slate-700 ${className}`}>{items}</div>;
}

/** Copy-to-clipboard + TTS helper row for AI output. */
export function OutputActions({
  text,
  onSpeak,
  speaking,
}: {
  text: string;
  onSpeak?: (t: string) => void;
  speaking?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <div className="mt-2 flex items-center gap-2">
      {onSpeak && (
        <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => onSpeak(text)} disabled={speaking}>
          {speaking ? "🔊 बोल रहा है…" : "🔊 सुनो / Listen"}
        </Button>
      )}
      <Button
        variant="ghost"
        className="px-2.5 py-1 text-xs"
        onClick={() => {
          navigator.clipboard?.writeText(text).catch(() => undefined);
          setCopied(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "✓ Copied" : "📋 Copy"}
      </Button>
    </div>
  );
}
