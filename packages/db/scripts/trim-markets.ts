import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";
import { SQL } from "bun";

const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, "../../../.env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const statements = [
  `ALTER TABLE "markets" DROP COLUMN IF EXISTS "status";`,
  `ALTER TABLE "markets" DROP COLUMN IF EXISTS "result";`,
  `ALTER TABLE "markets" DROP COLUMN IF EXISTS "resolution";`,
  `ALTER TABLE "markets" DROP COLUMN IF EXISTS "open_time";`,
  `ALTER TABLE "markets" DROP COLUMN IF EXISTS "resolve_at";`,
  `ALTER TABLE "markets" DROP COLUMN IF EXISTS "rules_primary";`,
  `ALTER TABLE "markets" DROP COLUMN IF EXISTS "outcomes";`,
  `ALTER TABLE "markets" DROP COLUMN IF EXISTS "outcome_prices";`,
  `ALTER TABLE "markets" DROP COLUMN IF EXISTS "market_result_pubkey";`,
  `ALTER TABLE "markets" DROP COLUMN IF EXISTS "cached_at";`,
  `ALTER TABLE "markets" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;`,

  `ALTER TABLE "events" DROP COLUMN IF EXISTS "subtitle";`,
  `ALTER TABLE "events" DROP COLUMN IF EXISTS "subcategory";`,
  `ALTER TABLE "events" DROP COLUMN IF EXISTS "tags";`,
  `ALTER TABLE "events" DROP COLUMN IF EXISTS "is_live";`,
  `ALTER TABLE "events" DROP COLUMN IF EXISTS "volume_usd";`,
  `ALTER TABLE "events" DROP COLUMN IF EXISTS "volume_24hr";`,
  `ALTER TABLE "events" DROP COLUMN IF EXISTS "begin_at";`,
  `ALTER TABLE "events" DROP COLUMN IF EXISTS "close_condition";`,
  `ALTER TABLE "events" DROP COLUMN IF EXISTS "rules_pdf";`,
  `ALTER TABLE "events" DROP COLUMN IF EXISTS "status";`,
  `ALTER TABLE "events" DROP COLUMN IF EXISTS "cached_at";`,
  `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;`,
  `DROP INDEX IF EXISTS "events_status_idx";`,
  `DROP INDEX IF EXISTS "markets_status_idx";`,

  `DROP TYPE IF EXISTS "public"."event_status";`,
  `DROP TYPE IF EXISTS "public"."market_status";`,
];

const sql = new SQL(url);

for (const stmt of statements) {
  try {
    await sql.unsafe(stmt);
    console.log(`✓ ${stmt.slice(0, 80)}${stmt.length > 80 ? "…" : ""}`);
  } catch (err) {
    console.error(`✗ ${stmt}`);
    console.error(`  ${(err as Error).message ?? String(err)}`);
    process.exit(1);
  }
}

await sql.end();
console.log("\nMarkets/events trim applied.");
