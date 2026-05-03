import { eq } from "drizzle-orm";
import { events, type Event, type NewEvent } from "@hunch/db";
import type { Db } from "@hunch/db";

export async function findByJupiterId(
  db: Db,
  jupiterEventId: string
): Promise<Event | null> {
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.jupiterEventId, jupiterEventId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsert(db: Db, values: NewEvent): Promise<Event> {
  const rows = await db
    .insert(events)
    .values(values)
    .onConflictDoUpdate({
      target: events.jupiterEventId,
      set: {
        title: values.title,
        slug: values.slug ?? null,
        category: values.category ?? null,
        imageUrl: values.imageUrl ?? null,
        closesAt: values.closesAt ?? null,
      },
    })
    .returning();

  if (!rows[0]) {
    throw new Error(`events.upsert: no row returned for ${values.jupiterEventId}`);
  }
  return rows[0];
}
