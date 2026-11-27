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
    CREATE TABLE IF NOT EXISTS "user" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "email" text NOT NULL UNIQUE,
      "email_verified" boolean DEFAULT false NOT NULL,
      "image" text,
      "username" text,
      "role" text DEFAULT 'user' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );

    ALTER TABLE "user"
    ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user' NOT NULL;

    CREATE TABLE IF NOT EXISTS "session" (
      "id" text PRIMARY KEY NOT NULL,
      "expires_at" timestamp NOT NULL,
      "token" text NOT NULL UNIQUE,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      "ip_address" text,
      "user_agent" text,
      "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "account" (
      "id" text PRIMARY KEY NOT NULL,
      "account_id" text NOT NULL,
      "provider_id" text NOT NULL,
      "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "access_token" text,
      "refresh_token" text,
      "id_token" text,
      "access_token_expires_at" timestamp,
      "refresh_token_expires_at" timestamp,
      "scope" text,
      "password" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "verification" (
      "id" text PRIMARY KEY NOT NULL,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expires_at" timestamp NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );

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

    CREATE TABLE IF NOT EXISTS "quote" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "prompt" text NOT NULL,
      "tag" text NOT NULL,
      "image" text,
      "template_id" text REFERENCES "template"("id") ON DELETE SET NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );

    ALTER TABLE "quote"
    ADD COLUMN IF NOT EXISTS "image" text;

    ALTER TABLE "quote"
    ADD COLUMN IF NOT EXISTS "template_id" text REFERENCES "template"("id") ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("user_id");
    CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("user_id");
    CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");
    CREATE INDEX IF NOT EXISTS "quote_userId_idx" ON "quote" ("user_id");
    CREATE INDEX IF NOT EXISTS "quote_templateId_idx" ON "quote" ("template_id");
    CREATE INDEX IF NOT EXISTS "template_slug_idx" ON "template" ("slug");
  `);

  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  console.log(
    "tables=" + tables.rows.map((row) => row.table_name).join(", ")
  );

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
