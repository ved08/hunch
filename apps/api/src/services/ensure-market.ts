import type { Market } from "@hunch/db";
import type { Deps } from "../deps.js";
import * as marketsRepo from "../repos/markets.js";
import * as eventsRepo from "../repos/events.js";
import { mapJupiterMarket } from "./jupiter-mappers.js";
import { MappingError, UpstreamError } from "./errors.js";

export async function ensureMarketFromRaw(
  deps: Deps,
  jupiterMarketId: string,
  raw: unknown
): Promise<Market> {
  const mapped = mapJupiterMarket(raw);
  if (!mapped) {
    throw new MappingError("jupiter.market", "response did not contain a market id");
  }

  let eventId: string;
  if (mapped.event) {
    const event = await eventsRepo.upsert(deps.db, mapped.event);
    eventId = event.id;
  } else {
    const placeholder = await eventsRepo.upsert(deps.db, {
      jupiterEventId: `orphan:${jupiterMarketId}`,
      title: "(orphan market)",
      closesAt: null,
    });
    eventId = placeholder.id;
  }

  return marketsRepo.upsert(deps.db, { ...mapped.market, eventId });
}

export async function ensureMarket(
  deps: Deps,
  jupiterMarketId: string
): Promise<Market> {
  const cached = await marketsRepo.findByJupiterId(deps.db, jupiterMarketId);
  if (cached) return cached;

  const res = await deps.prediction.market(jupiterMarketId);
  if (!res.ok) throw new UpstreamError("jupiter.market", res.error);

  return ensureMarketFromRaw(deps, jupiterMarketId, res.result);
}
