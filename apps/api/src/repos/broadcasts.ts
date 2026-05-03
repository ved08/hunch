import { eq } from "drizzle-orm";
import { broadcasts, type Broadcast, type NewBroadcast } from "@hunch/db";
import type { Db } from "@hunch/db";

export async function findByOrderPubkey(
  db: Db,
  orderPubkey: string
): Promise<Broadcast | null> {
  const rows = await db
    .select()
    .from(broadcasts)
    .where(eq(broadcasts.orderPubkey, orderPubkey))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertConfirmed(
  db: Db,
  values: NewBroadcast
): Promise<Broadcast> {
  const inserted = await db
    .insert(broadcasts)
    .values(values)
    .onConflictDoNothing({ target: broadcasts.orderPubkey })
    .returning();
  if (inserted[0]) return inserted[0];

  const existing = await findByOrderPubkey(db, values.orderPubkey);
  if (!existing) {
    throw new Error(
      `broadcasts.insertConfirmed: failed to insert or find ${values.orderPubkey}`
    );
  }
  return existing;
}
