// DEPRECATED — superseded by scripts/trim-markets.ts. Re-running this after
// trim-markets will re-add the columns the schema no longer references and
// break inserts. Kept only for reference until a consolidated drizzle-kit
// migration replaces both scripts.
//
// Migration order on an existing DB:
//   1. apply-enrichment.ts (legacy bootstrap)
//   2. trim-markets.ts     (this branch)
// Fresh DBs should run drizzle-kit push / generate against the current schema
// instead of either script.

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
  `CREATE TYPE "public"."market_status" AS ENUM('open', 'closed');`,
  `ALTER TABLE "events" ADD COLUMN "subtitle" text;`,
  `ALTER TABLE "events" ADD COLUMN "slug" text;`,
  `ALTER TABLE "events" ADD COLUMN "category" text;`,
  `ALTER TABLE "events" ADD COLUMN "subcategory" text;`,
  `ALTER TABLE "events" ADD COLUMN "tags" text[];`,
  `ALTER TABLE "events" ADD COLUMN "image_url" text;`,
  `ALTER TABLE "events" ADD COLUMN "is_live" boolean DEFAULT false NOT NULL;`,
  `ALTER TABLE "events" ADD COLUMN "volume_usd" bigint;`,
  `ALTER TABLE "events" ADD COLUMN "volume_24hr" bigint;`,
  `ALTER TABLE "events" ADD COLUMN "begin_at" timestamp with time zone;`,
  `ALTER TABLE "events" ADD COLUMN "close_condition" text;`,
  `ALTER TABLE "events" ADD COLUMN "rules_pdf" text;`,
  `ALTER TABLE "markets" ADD COLUMN "status" "market_status" DEFAULT 'open' NOT NULL;`,
  `ALTER TABLE "markets" ADD COLUMN "result" text;`,
  `ALTER TABLE "markets" ADD COLUMN "resolution" text;`,
  `ALTER TABLE "markets" ADD COLUMN "open_time" timestamp with time zone;`,
  `ALTER TABLE "markets" ADD COLUMN "close_time" timestamp with time zone;`,
  `ALTER TABLE "markets" ADD COLUMN "resolve_at" timestamp with time zone;`,
  `ALTER TABLE "markets" ADD COLUMN "image_url" text;`,
  `ALTER TABLE "markets" ADD COLUMN "rules_primary" text;`,
  `ALTER TABLE "markets" ADD COLUMN "outcomes" text[];`,
  `ALTER TABLE "markets" ADD COLUMN "outcome_prices" text[];`,
  `ALTER TABLE "markets" ADD COLUMN "market_result_pubkey" text;`,
  `CREATE INDEX IF NOT EXISTS "events_category_idx" ON "events" USING btree ("category");`,
  `CREATE INDEX IF NOT EXISTS "markets_status_idx" ON "markets" USING btree ("status");`,
  `CREATE INDEX IF NOT EXISTS "markets_close_time_idx" ON "markets" USING btree ("close_time");`,
];

const sql = new SQL(url);

for (const stmt of statements) {
  try {
    await sql.unsafe(stmt);
    console.log(`✓ ${stmt.slice(0, 80)}${stmt.length > 80 ? "…" : ""}`);
  } catch (err) {
    const msg = (err as Error).message ?? String(err);
    if (msg.includes("already exists")) {
      console.log(`· skipped (already exists): ${stmt.slice(0, 60)}…`);
    } else {
      console.error(`✗ ${stmt}`);
      console.error(`  ${msg}`);
      process.exit(1);
    }
  }
}

await sql.end();
console.log("\nEnrichment migration applied.");
