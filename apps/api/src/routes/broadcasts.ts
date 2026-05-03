import { Hono } from "hono";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { broadcasts, markets, users } from "@hunch/db";
import type { Deps } from "../deps.js";

const ListQuery = z.object({
  marketId: z.string().min(1).optional(),
  wallet: z.string().min(32).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export function broadcastsRoutes(deps: Deps) {
  const app = new Hono();

  app.get("/broadcasts", async (c) => {
    const parsed = ListQuery.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json({ error: { code: "BAD_REQUEST", issues: parsed.error.issues } }, 400);
    }

    const limit = Math.min(parsed.data.limit ?? 50, 200);
    const conditions: SQL[] = [];
    if (parsed.data.marketId) {
      conditions.push(eq(markets.jupiterMarketId, parsed.data.marketId));
    }
    if (parsed.data.wallet) {
      conditions.push(eq(users.walletAddress, parsed.data.wallet));
    }

    const where =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const base = deps.db
      .select({
        id: broadcasts.id,
        side: broadcasts.side,
        amountNative: broadcasts.amountNative,
        entryPriceNative: broadcasts.entryPriceNative,
        depositMint: broadcasts.depositMint,
        orderPubkey: broadcasts.orderPubkey,
        txSig: broadcasts.txSig,
        kind: broadcasts.kind,
        createdAt: broadcasts.createdAt,
        marketId: markets.id,
        jupiterMarketId: markets.jupiterMarketId,
        question: markets.question,
        userId: users.id,
        walletAddress: users.walletAddress,
      })
      .from(broadcasts)
      .innerJoin(markets, eq(markets.id, broadcasts.marketId))
      .innerJoin(users, eq(users.id, broadcasts.userId));

    const filtered = where ? base.where(where) : base;
    const rows = await filtered.orderBy(desc(broadcasts.createdAt)).limit(limit);

    return c.json({
      data: rows.map((b) => ({
        id: b.id,
        side: b.side,
        amountNative: b.amountNative.toString(),
        entryPriceNative: b.entryPriceNative.toString(),
        depositMint: b.depositMint,
        orderPubkey: b.orderPubkey,
        txSig: b.txSig,
        kind: b.kind,
        createdAt: b.createdAt.toISOString(),
        market: {
          id: b.marketId,
          jupiterMarketId: b.jupiterMarketId,
          question: b.question,
        },
        user: {
          id: b.userId,
          walletAddress: b.walletAddress,
        },
      })),
    });
  });

  return app;
}
