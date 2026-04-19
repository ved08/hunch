import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, "../../.env") });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is required for drizzle-kit (checked repo root .env and process env)"
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
