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
    ALTER TABLE "quote"
    ADD COLUMN IF NOT EXISTS "image" text
  `);

  const columns = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'quote'
    ORDER BY ordinal_position
  `);

  console.log(
    "quote_columns=" + columns.rows.map((row) => row.column_name).join(", ")
  );

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
