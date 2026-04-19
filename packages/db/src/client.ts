import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema.js";

export function createDb(url: string) {
  if (!url) throw new Error("createDb: DATABASE_URL is required");
  const client = new SQL(url);
  return drizzle({ client, schema });
}

export type Db = ReturnType<typeof createDb>;