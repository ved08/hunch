import { Hono } from "hono";
import { z } from "zod";
import type { Deps } from "../deps.js";
import { statusFor } from "../http.js";
import { ensureUser } from "../services/ensure-user.js";
import { ensureMarket } from "../services/ensure-market.js";
import * as broadcastsRepo from "../repos/broadcasts.js";

const IntegerString = z.string().regex(/^\d+$/, "must be an integer string");

const BuildBody = z.object({
  marketId: z.string().min(1),
  side: z.enum(["YES", "NO"]),
  amountNative: IntegerString,
  depositMint: z.enum(["USDC", "JUPUSD"]),
  walletAddress: z.string().min(32),
});

const SubmitBody = z.object({
  signedTx: z.string().min(1),
  marketId: z.string().min(1),
  side: z.enum(["YES", "NO"]),
  amountNative: IntegerString,
  entryPriceNative: IntegerString,
  depositMint: z.enum(["USDC", "JUPUSD"]),
  orderPubkey: z.string().min(1),
  walletAddress: z.string().min(32),
  skipPreflight: z.boolean().optional(),
});

export function betRoutes(deps: Deps) {
  const app = new Hono();

  app.post("/bet/build", async (c) => {
    const parsed = BuildBody.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) {
      return c.json({ error: { code: "BAD_REQUEST", issues: parsed.error.issues } }, 400);
    }

    try {
      await ensureUser(deps, parsed.data.walletAddress);
    } catch (err) {
      console.error(
        JSON.stringify({
          level: "error",
          event: "ensure-user-failed",
          wallet: parsed.data.walletAddress,
          message: (err as Error)?.message ?? String(err),
        })
      );
      return c.json({ error: { code: "DB_ERROR", message: "Could not ensure user" } }, 500);
    }

    ensureMarket(deps, parsed.data.marketId).catch((err: unknown) =>
      console.error(
        JSON.stringify({
          level: "warn",
          event: "ensure-market-failed",
          jupiterMarketId: parsed.data.marketId,
          message: (err as Error)?.message ?? String(err),
        })
      )
    );

    const res = await deps.prediction.placeOrder(parsed.data);
    if (!res.ok) {
      return c.json({ error: res.error }, statusFor(res.error));
    }
    return c.json(res.result);
  });

  app.post("/bet/submit", async (c) => {
    const parsed = SubmitBody.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) {
      return c.json({ error: { code: "BAD_REQUEST", issues: parsed.error.issues } }, 400);
    }

    const existing = await broadcastsRepo
      .findByOrderPubkey(deps.db, parsed.data.orderPubkey)
      .catch(() => null);
    if (existing) {
      return c.json({
        sig: existing.txSig,
        broadcastId: existing.id,
        confirmation: "confirmed",
        idempotent: true,
      });
    }

    const sent = await deps.rpc.sendTransaction(parsed.data.signedTx, {
      skipPreflight: parsed.data.skipPreflight ?? false,
    });
    if (!sent.ok) {
      console.error(
        JSON.stringify({
          level: "error",
          event: "send-tx-failed",
          orderPubkey: parsed.data.orderPubkey,
          message: sent.error.message,
          data: sent.error.data,
        })
      );
      return c.json(
        {
          error: {
            code: "SEND_FAILED",
            message: sent.error.message,
            data: sent.error.data,
          },
        },
        502
      );
    }
    const sig = sent.result;

    const conf = await deps.rpc.confirmTransaction(sig, {
      commitment: "confirmed",
      timeoutMs: 15_000,
    });

    if (!conf.ok && conf.reason === "failed") {
      console.error(
        JSON.stringify({
          level: "error",
          event: "tx-on-chain-failure",
          orderPubkey: parsed.data.orderPubkey,
          sig,
          err: conf.err,
        })
      );
      return c.json(
        {
          error: {
            code: "TX_FAILED",
            message: "Transaction failed on chain",
            sig,
            data: conf.err,
          },
        },
        502
      );
    }

    if (!conf.ok && conf.reason === "timeout") {
      console.warn(
        JSON.stringify({
          level: "warn",
          event: "tx-confirm-timeout",
          orderPubkey: parsed.data.orderPubkey,
          sig,
        })
      );
      return c.json({
        sig,
        broadcastId: null,
        confirmation: "pending",
        warning: "CONFIRM_TIMEOUT",
      });
    }

    try {
      const [user, market] = await Promise.all([
        ensureUser(deps, parsed.data.walletAddress),
        ensureMarket(deps, parsed.data.marketId),
      ]);

      const broadcast = await broadcastsRepo.insertConfirmed(deps.db, {
        userId: user.id,
        marketId: market.id,
        side: parsed.data.side,
        amountNative: BigInt(parsed.data.amountNative),
        entryPriceNative: BigInt(parsed.data.entryPriceNative),
        depositMint: parsed.data.depositMint,
        orderPubkey: parsed.data.orderPubkey,
        txSig: sig,
      });

      return c.json({
        sig,
        broadcastId: broadcast.id,
        confirmation: "confirmed",
      });
    } catch (err) {
      console.error(
        JSON.stringify({
          level: "error",
          event: "broadcast-persist-failed",
          orderPubkey: parsed.data.orderPubkey,
          sig,
          message: (err as Error)?.message ?? String(err),
        })
      );
      return c.json({
        sig,
        broadcastId: null,
        confirmation: "confirmed",
        warning: "PERSIST_FAILED",
      });
    }
  });

  return app;
}
