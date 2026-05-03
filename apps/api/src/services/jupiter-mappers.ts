import type { NewEvent, NewMarket } from "@hunch/db";

type Raw = Record<string, unknown>;

function pickString(obj: Raw, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "number") return String(v);
  }
  return null;
}

function pickObject(obj: Raw, ...keys: string[]): Raw | null {
  for (const k of keys) {
    const v = obj[k];
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Raw;
  }
  return null;
}

function pickDate(obj: Raw, ...keys: string[]): Date | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d;
    }
    if (typeof v === "number" && v > 0) {
      const d = new Date(v > 1e12 ? v : v * 1000);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

export function mapJupiterEvent(raw: unknown): NewEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Raw;
  const meta = pickObject(r, "metadata") ?? {};

  const jupiterEventId =
    pickString(r, "eventId", "event_id", "id") ??
    pickString(meta, "eventId", "event_id", "id");
  if (!jupiterEventId) return null;

  return {
    jupiterEventId,
    title:
      pickString(meta, "title", "name") ??
      pickString(r, "title", "name", "question") ??
      "(no title)",
    slug: pickString(meta, "slug") ?? pickString(r, "slug"),
    category: pickString(r, "category"),
    imageUrl:
      pickString(meta, "imageUrl", "image_url") ??
      pickString(r, "imageUrl", "image_url"),
    closesAt:
      pickDate(meta, "closeTime", "close_time", "closesAt", "closes_at", "endTime") ??
      pickDate(r, "closeTime", "close_time", "closesAt", "closes_at", "endTime", "resolveAt"),
  };
}

type MarketCore = Omit<NewMarket, "eventId">;

function extractMarket(raw: Raw): MarketCore | null {
  const jupiterMarketId = pickString(raw, "marketId", "market_id", "id");
  if (!jupiterMarketId) return null;

  return {
    jupiterMarketId,
    question:
      pickString(raw, "title", "question", "name", "prompt") ?? "(no question)",
    imageUrl: pickString(raw, "imageUrl", "image_url"),
    closeTime: pickDate(raw, "closeTime", "close_time"),
  };
}

export type MappedMarket = {
  market: MarketCore;
  event: NewEvent | null;
};

export function mapJupiterMarket(raw: unknown): MappedMarket | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Raw;

  const market = extractMarket(r);
  if (!market) return null;

  const rawEvent = pickObject(r, "event", "parentEvent", "parent_event");
  const eventIdOnMarket = pickString(r, "eventId", "event_id", "parentEventId");

  let event: NewEvent | null = null;
  if (rawEvent) {
    event = mapJupiterEvent(rawEvent);
  } else if (eventIdOnMarket) {
    event = {
      jupiterEventId: eventIdOnMarket,
      title: "(uncached event)",
      closesAt: null,
    };
  }

  return { market, event };
}
