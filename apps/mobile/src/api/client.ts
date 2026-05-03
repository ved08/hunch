import Constants from "expo-constants";

const ENV_URL = process.env.EXPO_PUBLIC_API_URL;

function resolveBaseUrl(): string {
  if (ENV_URL) return ENV_URL.replace(/\/$/, "");
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (host) return `http://${host}:3000`;
  return "http://localhost:3000";
}

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly payload?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiInit = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch<T>(path: string, init?: ApiInit): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const { body, headers, ...rest } = init ?? {};
  const hasBody = body !== undefined;
  const res = await fetch(url, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let parsed: unknown = undefined;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const err =
      parsed && typeof parsed === "object" && "error" in (parsed as Record<string, unknown>)
        ? (parsed as { error: { code?: string; message?: string } }).error
        : undefined;
    throw new ApiError(
      res.status,
      err?.code ?? `HTTP_${res.status}`,
      err?.message ?? `Request failed: ${res.status}`,
      parsed
    );
  }

  return parsed as T;
}
