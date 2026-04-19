import { Hono } from "hono";
import { z } from "zod";
import type { PredictionApi } from "@hunch/jupiter";
import type { SolanaRpc } from "../rpc.js";

const BuildBody = z.object({
  marketId: z.string().min(1),
  side: z.enum(["YES", "NO"]),
  amountNative: z.string().regex(/^\d+$/, "amountNative must be an integer string (1,000,000 = $1)"),
  depositMint: z.enum(["USDC", "JUPUSD"]),
  walletAddress: z.string().min(32),
});

const SubmitBody = z.object({
  signedTx: z.string().min(1),
});

export function betRoutes(prediction: PredictionApi, rpc: SolanaRpc) {
  const app = new Hono();

  app.post("/bet/build", async (c) => {
    const parsed = BuildBody.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) {
      return c.json({ error: { code: "BAD_REQUEST", issues: parsed.error.issues } }, 400);
    }
    const res = await prediction.placeOrder(parsed.data);
    if (!res.ok) {
      const status = res.error.code === "RATE_LIMITED" ? 429 : 502;
      return c.json({ error: res.error }, status);
    }
    return c.json(res.result);
  });

  app.post("/bet/submit", async (c) => {
    const parsed = SubmitBody.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) {
      return c.json({ error: { code: "BAD_REQUEST", issues: parsed.error.issues } }, 400);
    }
    const res = await rpc.sendTransaction(parsed.data.signedTx);
    if (!res.ok) return c.json({ error: res.error }, 502);
    return c.json({ sig: res.result });
  });

  return app;
}
