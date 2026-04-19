import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";
import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { migrate } from "drizzle-orm/bun-sql/migrator";

const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, "../../../.env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const migrationsFolder = resolve(here, "../migrations");

const client = new SQL(url);
const db = drizzle({ client });

console.log(`Applying migrations from ${migrationsFolder}`);
await migrate(db, { migrationsFolder });
console.log("Migrations applied.");
await client.end();
