// ─────────────────────────────────────────────────────────────────────────────
// THE single Nemotron client for GyanSetu.
//
// Every online AI call in the application goes through this file. It is
// server-side ONLY — the OPENROUTER_API_KEY / NVIDIA_API_KEY never leave the
// server. Provider chain: OpenRouter (Nemotron 3 Ultra) → NVIDIA NIM direct
// (same Nemotron model) as a resilience fallback. Both are NVIDIA Nemotron.
// ─────────────────────────────────────────────────────────────────────────────

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export const DEFAULT_NEMOTRON_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
export const NVIDIA_MODEL_SLUG = "nvidia/nemotron-3-ultra-550b-a55b";

export interface NemotronConfig {
  model: string;
  provider: "openrouter" | "nvidia" | "none";
  configured: boolean;
}

export function getNemotronConfig(): NemotronConfig {
  const model = process.env.NEMOTRON_MODEL || DEFAULT_NEMOTRON_MODEL;
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim() || "";
  const nvidiaKey = process.env.NVIDIA_API_KEY?.trim() || "";

  if (openRouterKey) return { model, provider: "openrouter", configured: true };
  if (nvidiaKey) return { model: NVIDIA_MODEL_SLUG, provider: "nvidia", configured: true };
  return { model, provider: "none", configured: false };
}

/** All configured OpenRouter keys (primary + backups). */
export function getOpenRouterKeys(): string[] {
  return Array.from(
    new Set(
      [
        process.env.OPENROUTER_API_KEY,
        process.env.OPENROUTER_API_KEY_2,
        process.env.OPENROUTER_API_KEY_3,
      ]
        .map((k) => (k ?? "").trim())
        .filter(Boolean),
    ),
  );
}

/** All configured NVIDIA NIM keys (primary + backup). */
export function getNvidiaKeys(): string[] {
  return Array.from(
    new Set(
      [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_2]
        .map((k) => (k ?? "").trim())
        .filter(Boolean),
    ),
  );
}

export interface NemotronMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface NemotronCallOptions {
  messages: NemotronMessage[];
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface NemotronResult {
  text: string;
  provider: "openrouter" | "nvidia";
  model: string;
  latencyMs: number;
}

export class NemotronUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NemotronUnavailableError";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface ProviderCall {
  name: string; // unique internal id (nvidia, nvidia1, nvidia2…)
  reportAs: "openrouter" | "nvidia"; // what the UI/DB sees
  key: string;
  url: string;
  model: string;
  buildBody: (opts: NemotronCallOptions) => Record<string, unknown>;
  buildHeaders: (key: string) => Record<string, string>;
}

function openRouterCall(model: string, key: string, label: string): ProviderCall {
  return {
    name: label,
    reportAs: "openrouter",
    key,
    url: OPENROUTER_CHAT_URL,
    model,
    buildBody: (opts) => {
      const body: Record<string, unknown> = {
        model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 800,
        // Low-latency path (SIH ≤3s target): disable long reasoning.
        reasoning: { enabled: false },
      };
      if (opts.json) body.response_format = { type: "json_object" };
      return body;
    },
    buildHeaders: (key) => ({
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://gyansetu.app",
      "X-Title": "GyanSetu",
    }),
  };
}

function nvidiaCall(key: string, label: string): ProviderCall {
  return {
    name: label,
    reportAs: "nvidia",
    key,
    url: NVIDIA_CHAT_URL,
    model: NVIDIA_MODEL_SLUG,
    buildBody: (opts) => ({
      model: NVIDIA_MODEL_SLUG,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      top_p: 0.95,
      max_tokens: opts.maxTokens ?? 800,
      // Disable long internal reasoning for the ≤3s classroom latency target.
      chat_template_kwargs: { enable_thinking: false },
    }),
    buildHeaders: (k) => ({
      Authorization: `Bearer ${k}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
  };
}

interface ProviderError extends Error {
  retryable?: boolean;
  rateLimited?: boolean;
}

async function callProvider(
  provider: ProviderCall,
  opts: NemotronCallOptions,
  startedAt: number,
): Promise<{ text: string }> {
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(provider.url, {
      method: "POST",
      headers: provider.buildHeaders(provider.key),
      body: JSON.stringify(provider.buildBody(opts)),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const err = new Error(
        `[${provider.name}] HTTP ${res.status} — ${detail.slice(0, 300)}`,
      ) as ProviderError;
      // 429 handling:
      //  • "free-models-per-day" (OpenRouter daily cap) → NOT retryable —
      //    waiting seconds will never help; fail fast to the next provider.
      //  • per-minute 429 (NVIDIA) → retryable after a quiet pause.
      const isDailyLimit = res.status === 429 && /per-day|free-models/.test(detail);
      err.retryable = res.status >= 500 || (res.status === 429 && !isDailyLimit);
      err.rateLimited = res.status === 429;
      throw err;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content || !content.trim()) {
      throw new Error(`[${provider.name}] empty completion`);
    }
    // Remove stray code fences around JSON.
    let text = content.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("completion exceeded timeout");
    }
    return { text };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Calls Nemotron through the provider chain with one retry per provider on
 * transient (429/5xx/network) failures. Throws NemotronUnavailableError when
 * every provider fails — callers convert that into a friendly UI message.
 */
/** Remembers the last working provider so subsequent calls skip dead ones. */
let lastWorkingProvider: "openrouter" | "nvidia" | null = null;
/** Timestamp of the last fully-failed cycle — used for overload cooldown. */
let lastTotalFailure: number | null = null;

export async function callNemotron(
  opts: NemotronCallOptions,
): Promise<NemotronResult> {
  const cfg = getNemotronConfig();
  const startedAt = Date.now();
  const errors: string[] = [];

  const providers: ProviderCall[] = [];
  // Every configured OpenRouter key is an independent provider — a daily
  // rate limit on one account never blocks the others.
  getOpenRouterKeys().forEach((key, i) => {
    providers.push(openRouterCall(cfg.model, key, `or${i}`));
  });
  // Every configured NVIDIA key is an independent provider — a per-minute
  // 429/503 window on one key never blocks the others.
  getNvidiaKeys().forEach((key, i) => {
    providers.push(nvidiaCall(key, `nvidia${i}`));
  });

  // Smart ordering: the provider family that worked last time goes first.
  // On a cold start (no memory), NVIDIA NIM goes first — OpenRouter's free
  // daily cap is often exhausted while NVIDIA's per-minute window resets
  // quickly, so this ordering gets a working provider fastest.
  if (lastWorkingProvider) {
    providers.sort((a) => (a.reportAs === lastWorkingProvider ? -1 : 1));
  } else {
    providers.sort((a) => (a.reportAs === "nvidia" ? -1 : 1));
  }

  if (providers.length === 0) {
    throw new NemotronUnavailableError(
      "OPENROUTER_API_KEY and NVIDIA_API_KEY are both missing — Nemotron is not configured.",
    );
  }

  // Overload cooldown: when the free tier is in a 503 burst, hammering it
  // with retries makes the overload WORSE. If a full cycle failed recently,
  // wait a moment before touching the API again.
  if (lastTotalFailure && Date.now() - lastTotalFailure < 6000) {
    await sleep(6000 - (Date.now() - lastTotalFailure));
  }

  // Round-robin retry with 429-aware backoff: providers serving the same
  // Nemotron model are cycled until one succeeds. Non-retryable 4xx fail
  // that provider fast. 429/5xx retry across 4 rounds — but when a round
  // only produced RATE LIMITS, we pause longer (NVIDIA's free tier resets
  // per minute; quiet waiting beats hammering).
  const rounds = 4;
  const dead = new Set<string>();
  for (let round = 0; round < rounds; round++) {
    let sawRateLimit = false;
    for (const provider of providers) {
      if (dead.has(provider.name)) continue;
      try {
        const { text } = await callProvider(provider, opts, startedAt);
        lastWorkingProvider = provider.reportAs;
        lastTotalFailure = null;
        return {
          text,
          provider: provider.reportAs,
          model: provider.model,
          latencyMs: Date.now() - startedAt,
        };
      } catch (err) {
        const providerErr = err as ProviderError;
        errors.push(err instanceof Error ? err.message : String(err));
        if (!providerErr.retryable) dead.add(provider.name);
        if (providerErr.rateLimited) sawRateLimit = true;
      }
    }
    if (round < rounds - 1) {
      // Rate-limit rounds: quiet 8s pause so the provider window can reset.
      await sleep(sawRateLimit ? 8000 : 1000 * (round + 1));
    }
  }

  lastTotalFailure = Date.now();

  console.error("[gyansetu:ai] Nemotron call failed:", errors.slice(0, 5).join(" | "));
  throw new NemotronUnavailableError(
    `All Nemotron providers failed: ${errors.slice(0, 2).join(" | ")}`,
  );
}

/** Robust JSON extraction from model output (handles fences, prose around JSON). */
export function extractJson<T>(text: string): T | null {
  let candidate = text.trim();
  const fence = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidate = fence[1].trim();

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    // Tolerate trailing commas / smart quotes in a second pass.
    try {
      const cleaned = candidate
        .slice(start, end + 1)
        .replace(/,(\s*[}\]])/g, "$1")
        .replace(/[\u201c\u201d]/g, '"');
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}
