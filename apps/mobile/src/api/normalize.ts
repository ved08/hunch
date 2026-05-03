export type NormalizedMarket = {
  jupiterMarketId: string;
  question: string;
  status: "open" | "closed";
  outcomes: string[];
  outcomePrices: string[];
  imageUrl: string | null;
  rulesPrimary: string | null;
  closeTime: string | null;
};

export type NormalizedEvent = {
  jupiterEventId: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  tags: string[];
  imageUrl: string | null;
  isLive: boolean;
  volumeUsd: number | null;
  closesAt: string | null;
  markets: NormalizedMarket[];
};

type Raw = Record<string, unknown>;

function str(obj: Raw, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "number") return String(v);
  }
  return null;
}

function obj(o: Raw, ...keys: string[]): Raw | null {
  for (const k of keys) {
    const v = o[k];
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Raw;
  }
  return null;
}

function arr(o: Raw, ...keys: string[]): unknown[] | null {
  for (const k of keys) {
    const v = o[k];
    if (Array.isArray(v)) return v;
  }
  return null;
}

function num(o: Raw, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.length > 0) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function bool(o: Raw, ...keys: string[]): boolean | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "boolean") return v;
  }
  return null;
}

function strArr(o: Raw, ...keys: string[]): string[] {
  for (const k of keys) {
    const v = o[k];
    if (!Array.isArray(v)) continue;
    const out: string[] = [];
    for (const item of v) if (typeof item === "string") out.push(item);
    return out;
  }
  return [];
}

function iso(o: Raw, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.length > 0) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
    if (typeof v === "number" && v > 0) {
      const d = new Date(v > 1e12 ? v : v * 1000);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
  }
  return null;
}

export function normalizeMarket(raw: unknown): NormalizedMarket | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Raw;
  const id = str(r, "marketId", "market_id", "id");
  if (!id) return null;
  const status = str(r, "status");
  return {
    jupiterMarketId: id,
    question: str(r, "title", "question", "name", "prompt") ?? "(no question)",
    status: status === "closed" ? "closed" : "open",
    outcomes: strArr(r, "outcomes"),
    outcomePrices: strArr(r, "outcomePrices", "outcome_prices"),
    imageUrl: str(r, "imageUrl", "image_url"),
    rulesPrimary: str(r, "rulesPrimary", "rules_primary"),
    closeTime: iso(r, "closeTime", "close_time"),
  };
}

export function normalizeEvent(raw: unknown): NormalizedEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Raw;
  const meta = obj(r, "metadata") ?? {};
  const id =
    str(r, "eventId", "event_id", "id") ?? str(meta, "eventId", "event_id", "id");
  if (!id) return null;

  const markets: NormalizedMarket[] = [];
  const rawMarkets = arr(r, "markets", "outcomes", "children") ?? [];
  for (const m of rawMarkets) {
    const mapped = normalizeMarket(m);
    if (mapped) markets.push(mapped);
  }

  return {
    jupiterEventId: id,
    title:
      str(meta, "title", "name") ??
      str(r, "title", "name", "question") ??
      "(no title)",
    subtitle: str(meta, "subtitle") ?? str(r, "subtitle"),
    category: str(r, "category"),
    tags: strArr(r, "tags"),
    imageUrl:
      str(meta, "imageUrl", "image_url") ?? str(r, "imageUrl", "image_url"),
    isLive:
      bool(r, "isLive", "is_live") ?? bool(meta, "isLive", "is_live") ?? false,
    volumeUsd: num(r, "volumeUsd", "volume_usd"),
    closesAt:
      iso(meta, "closeTime", "close_time", "closesAt", "closes_at", "endTime") ??
      iso(r, "closeTime", "close_time", "closesAt", "closes_at", "endTime", "resolveAt"),
    markets,
  };
}

export function normalizeEventsList(raw: unknown): NormalizedEvent[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? (arr(raw as Raw, "data", "events", "items") ?? [])
      : [];
  const out: NormalizedEvent[] = [];
  for (const item of list) {
    const mapped = normalizeEvent(item);
    if (mapped) out.push(mapped);
  }
  return out;
}

export function findMarketInEvent(
  event: NormalizedEvent | null | undefined,
  marketId: string
): NormalizedMarket | null {
  if (!event) return null;
  return event.markets.find((m) => m.jupiterMarketId === marketId) ?? null;
}
