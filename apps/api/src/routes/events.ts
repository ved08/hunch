import { Hono } from "hono";
import type { PredictionApi } from "@hunch/jupiter";

export function eventsRoutes(prediction: PredictionApi) {
  const app = new Hono();

  app.get("/events", async (c) => {
    const res = await prediction.events();
    if (!res.ok) return c.json({ error: res.error }, 502);
    return c.json(res.result);
  });

  app.get("/markets/:id", async (c) => {
    const id = c.req.param("id");
    const res = await prediction.market(id);
    if (!res.ok) {
      const status = res.error.code === "RATE_LIMITED" ? 429 : 502;
      return c.json({ error: res.error }, status);
    }
    return c.json(res.result);
  });

  return app;
}
