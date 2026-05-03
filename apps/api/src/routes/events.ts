import { Hono } from "hono";
import { z } from "zod";
import type { Deps } from "../deps.js";
import { statusFor } from "../http.js";

const EventsQuerySchema = z.object({
  category: z.string().min(1).optional(),
  subcategory: z.string().min(1).optional(),
  filter: z.enum(["new", "live", "trending"]).optional(),
  provider: z.enum(["kalshi", "polymarket"]).optional(),
  sortBy: z.enum(["volume", "beginAt"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  start: z.coerce.number().int().min(0).optional(),
  end: z.coerce.number().int().min(0).optional(),
  includeMarkets: z
    .union([z.literal("true"), z.literal("false")])
    .transform((v) => v === "true")
    .optional(),
});

export function eventsRoutes(deps: Deps) {
  const app = new Hono();

  app.get("/events", async (c) => {
    const parsed = EventsQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json({ error: { code: "BAD_REQUEST", issues: parsed.error.issues } }, 400);
    }

    const res = await deps.prediction.events(parsed.data);
    if (!res.ok) {
      return c.json({ error: res.error }, statusFor(res.error));
    }
    return c.json(res.result);
  });

  app.get("/markets/:id", async (c) => {
    const id = c.req.param("id");
    const res = await deps.prediction.market(id);
    if (!res.ok) {
      return c.json({ error: res.error }, statusFor(res.error));
    }
    return c.json(res.result);
  });

  app.get("/orderbook/:id", async (c) => {
    const id = c.req.param("id");
    const res = await deps.prediction.orderbook(id);
    if (!res.ok) {
      return c.json({ error: res.error }, statusFor(res.error));
    }
    return c.json(res.result);
  });

  return app;
}
