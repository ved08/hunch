export type JupiterError = {
  code: string | number;
  message: string;
  retryable: boolean;
};

export type JupiterResult<T> =
  | { ok: true; result: T }
  | { ok: false; error: JupiterError };

const RETRYABLE_ULTRA_CODES = new Set([-1, -1000, -1001, -1005, -1006, -2000, -2003, -2005]);

export function classifyError(raw: unknown): JupiterError {
  const err = raw as { code?: unknown; status?: unknown; message?: unknown; error?: unknown };
  const code = (err?.code ?? err?.status ?? "UNKNOWN") as string | number;

  if (code === 429 || code === "RATE_LIMITED") {
    return { code: "RATE_LIMITED", message: "Rate limited", retryable: true };
  }

  if (typeof code === "number" && code < 0) {
    return {
      code,
      message: (err?.error as string) ?? (err?.message as string) ?? "Execute failed",
      retryable: RETRYABLE_ULTRA_CODES.has(code),
    };
  }

  if (typeof code === "number" && code > 0) {
    return {
      code,
      message: (err?.error as string) ?? (err?.message as string) ?? "Program error",
      retryable: false,
    };
  }

  return {
    code,
    message: (err?.message as string) ?? "UNKNOWN_ERROR",
    retryable: false,
  };
}
