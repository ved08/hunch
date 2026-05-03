import { eq } from "drizzle-orm";
import { markets, type Market, type NewMarket } from "@hunch/db";
import type { Db } from "@hunch/db";

export async function findByJupiterId(
  db: Db,
  jupiterMarketId: string
): Promise<Market | null> {
  const rows = await db
    .select()
    .from(markets)
    .where(eq(markets.jupiterMarketId, jupiterMarketId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsert(db: Db, values: NewMarket): Promise<Market> {
  const rows = await db
    .insert(markets)
    .values(values)
    .onConflictDoUpdate({
      target: markets.jupiterMarketId,
      set: {
        question: values.question,
        eventId: values.eventId,
        imageUrl: values.imageUrl ?? null,
        closeTime: values.closeTime ?? null,
      },
    })
    .returning();

  if (!rows[0]) {
    throw new Error(`markets.upsert: no row returned for ${values.jupiterMarketId}`);
  }
  return rows[0];
}
