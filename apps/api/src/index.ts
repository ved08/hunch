import { Hono } from "hono";
import { JupiterClient, PredictionApi } from "@hunch/jupiter";
import { loadConfig } from "./config.js";
import { SolanaRpc } from "./rpc.js";
import { eventsRoutes } from "./routes/events.js";
import { betRoutes } from "./routes/bet.js";

const config = loadConfig();

const jupiter = new JupiterClient({
  apiKey: config.jupiterApiKey,
  baseUrl: config.jupiterApiUrl,
});
const prediction = new PredictionApi(jupiter);
const rpc = new SolanaRpc(config.solanaRpcUrl);

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

app.route("/", eventsRoutes(prediction));
app.route("/", betRoutes(prediction, rpc));

app.onError((err, c) => {
  console.error(JSON.stringify({ level: "error", message: err.message, stack: err.stack }));
  return c.json({ error: { code: "INTERNAL", message: "Internal error" } }, 500);
});

console.log(`hunch.api listening on http://localhost:${config.port}`);

export default {
  port: config.port,
  fetch: app.fetch,
};
