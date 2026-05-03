import { eq } from "drizzle-orm";
import { users, type User, type NewUser } from "@hunch/db";
import type { Db } from "@hunch/db";

export async function findByWallet(db: Db, walletAddress: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.walletAddress, walletAddress)).limit(1);
  return rows[0] ?? null;
}

export async function upsert(db: Db, values: NewUser): Promise<User> {
  const inserted = await db
    .insert(users)
    .values(values)
    .onConflictDoNothing({ target: users.walletAddress })
    .returning();
  if (inserted[0]) return inserted[0];

  const existing = await findByWallet(db, values.walletAddress);
  if (!existing) throw new Error(`users.upsert: failed to insert or find ${values.walletAddress}`);
  return existing;
}
