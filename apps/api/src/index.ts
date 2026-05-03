import { Hono } from "hono";
import { cors } from "hono/cors";
import { loadConfig } from "./config.js";
import { createDeps } from "./deps.js";
import { eventsRoutes } from "./routes/events.js";
import { betRoutes } from "./routes/bet.js";
import { broadcastsRoutes } from "./routes/broadcasts.js";

const config = loadConfig();
const deps = createDeps(config);

const app = new Hono();

app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"] }));

app.get("/health", (c) => c.json({ ok: true }));

app.route("/", eventsRoutes(deps));
app.route("/", betRoutes(deps));
app.route("/", broadcastsRoutes(deps));

app.onError((err, c) => {
  console.error(JSON.stringify({ level: "error", message: err.message, stack: err.stack }));
  return c.json({ error: { code: "INTERNAL", message: "Internal error" } }, 500);
});

console.log(`hunch.api listening on http://0.0.0.0:${config.port}`);

export default {
  port: config.port,
  hostname: "0.0.0.0",
  fetch: app.fetch,
};
