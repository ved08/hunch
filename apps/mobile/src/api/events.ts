import { apiFetch } from "./client";
import {
  normalizeEventsList,
  normalizeEvent,
  type NormalizedEvent,
  type NormalizedMarket,
  normalizeMarket,
} from "./normalize";

export async function listEvents(): Promise<NormalizedEvent[]> {
  const raw = await apiFetch<unknown>("/events");
  return normalizeEventsList(raw);
}

export type MarketWithContext = {
  market: NormalizedMarket;
  event: NormalizedEvent | null;
};

export async function getMarket(marketId: string): Promise<MarketWithContext> {
  const raw = await apiFetch<unknown>(`/markets/${encodeURIComponent(marketId)}`);
  const market = normalizeMarket(raw);
  if (!market) {
    throw new Error("Market payload missing required fields");
  }
  // Market endpoint may include an embedded event object.
  const embedded =
    raw && typeof raw === "object" && "event" in (raw as Record<string, unknown>)
      ? normalizeEvent((raw as { event: unknown }).event)
      : null;
  return { market, event: embedded };
}
