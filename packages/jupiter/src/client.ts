import { randomUUID } from "node:crypto";
import { classifyError, type JupiterResult } from "./errors.js";

export type JupiterClientOptions = {
  apiKey: string;
  baseUrl?: string;
  defaultTimeoutMs?: number;
  maxRetries?: number;
};

export type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  timeoutMs?: number;
  requestId?: string;
};

const DEFAULT_BASE_URL = "https://api.jup.ag";
const DEFAULT_TIMEOUT_MS = 5_000;
const EXECUTE_TIMEOUT_MS = 30_000;
const BASE_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 10_000;

export class JupiterClient {
  readonly #apiKey: string;
  readonly #baseUrl: string;
  readonly #defaultTimeoutMs: number;
  readonly #maxRetries: number;

  constructor(opts: JupiterClientOptions) {
    if (!opts.apiKey) throw new Error("JupiterClient: apiKey is required");
    this.#apiKey = opts.apiKey;
    this.#baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.#defaultTimeoutMs = opts.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.#maxRetries = opts.maxRetries ?? 3;
  }

  async request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<JupiterResult<T>> {
    const requestId = opts.requestId ?? randomUUID();
    const isExecute = opts.method === "POST" || opts.method === "DELETE";
    const timeoutMs = opts.timeoutMs ?? (isExecute ? EXECUTE_TIMEOUT_MS : this.#defaultTimeoutMs);

    const url = new URL(`${this.#baseUrl}${path}`);
    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    let attempt = 0;
    while (true) {
      const started = Date.now();
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), timeoutMs);

      try {
        const res = await fetch(url, {
          method: opts.method ?? "GET",
          headers: {
            "x-api-key": this.#apiKey,
            "x-request-id": requestId,
            ...(opts.body !== undefined ? { "content-type": "application/json" } : {}),
          },
          body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
          signal: ac.signal,
        });

        const latency = Date.now() - started;
        const rawText = await res.text();
        let parsed: unknown = rawText;
        try {
          parsed = rawText ? JSON.parse(rawText) : null;
        } catch {
          // non-json body — keep raw text
        }

        console.log(
          JSON.stringify({
            level: "info",
            api: "jupiter",
            endpoint: path,
            method: opts.method ?? "GET",
            status: res.status,
            latency_ms: latency,
            requestId,
          })
        );

        if (res.status === 429) {
          if (attempt >= this.#maxRetries) {
            return { ok: false, error: classifyError({ code: 429, message: "Rate limited" }) };
          }
          const delay = backoffDelay(attempt);
          await sleep(delay);
          attempt += 1;
          continue;
        }

        if (!res.ok) {
          const error = classifyError(
            typeof parsed === "object" && parsed !== null
              ? { ...parsed, status: res.status }
              : { status: res.status, message: String(parsed) }
          );
          if (error.retryable && attempt < this.#maxRetries) {
            await sleep(backoffDelay(attempt));
            attempt += 1;
            continue;
          }
          return { ok: false, error };
        }

        return { ok: true, result: parsed as T };
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          if (attempt < this.#maxRetries) {
            await sleep(backoffDelay(attempt));
            attempt += 1;
            continue;
          }
          return { ok: false, error: { code: "TIMEOUT", message: "Request timed out", retryable: true } };
        }
        return { ok: false, error: classifyError(err) };
      } finally {
        clearTimeout(timer);
      }
    }
  }
}

function backoffDelay(attempt: number): number {
  const exp = BASE_BACKOFF_MS * 2 ** attempt;
  const jitter = Math.random() * BASE_BACKOFF_MS;
  return Math.min(exp + jitter, MAX_BACKOFF_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
