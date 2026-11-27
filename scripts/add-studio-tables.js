const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  const text = fs.readFileSync(envPath, "utf8");
  const values = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    values[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }

  return values;
}

async function main() {
  const env = loadEnv();
  const client = new Client({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });

  await client.connect();

  await client.query(`
    ALTER TABLE "user"
    ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user' NOT NULL;

    CREATE TABLE IF NOT EXISTS "library_image" (
      "id" text PRIMARY KEY NOT NULL,
      "title" text NOT NULL,
      "url" text NOT NULL,
      "alt" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "template" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "slug" text NOT NULL UNIQUE,
      "layout_key" text NOT NULL,
      "description" text NOT NULL,
      "active" boolean DEFAULT true NOT NULL,
      "sort_order" integer DEFAULT 0 NOT NULL,
      "default_image_id" text REFERENCES "library_image"("id") ON DELETE SET NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );

    ALTER TABLE "quote"
    ADD COLUMN IF NOT EXISTS "template_id" text REFERENCES "template"("id") ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS "quote_templateId_idx" ON "quote" ("template_id");
    CREATE INDEX IF NOT EXISTS "template_slug_idx" ON "template" ("slug");
  `);

  console.log("studio tables ready");
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
