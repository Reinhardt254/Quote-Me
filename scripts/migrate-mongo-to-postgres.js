const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { MongoClient } = require("mongodb");

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

function usernameFromName(name, email) {
  const source = (name || email?.split("@")[0] || "user")
    .replace(/\s+/g, "")
    .toLowerCase();
  return source || "user";
}

async function main() {
  const env = loadEnv();

  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const mongo = new MongoClient(env.MONGODB_URI);
  const pg = new Client({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });

  await mongo.connect();
  await pg.connect();

  const mongoDb = mongo.db("quote_me");
  const users = await mongoDb.collection("users").find({}).toArray();
  const prompts = await mongoDb.collection("prompts").find({}).toArray();

  console.log(`mongo_users=${users.length}`);
  console.log(`mongo_prompts=${prompts.length}`);

  let usersInserted = 0;
  let usersSkipped = 0;
  let quotesInserted = 0;
  let quotesSkipped = 0;
  let quotesMissingUser = 0;

  for (const mongoUser of users) {
    const id = String(mongoUser._id);
    const email = String(mongoUser.email || "").trim().toLowerCase();
    const username =
      mongoUser.username || usernameFromName(mongoUser.name, email);
    const name = mongoUser.name || username || email.split("@")[0] || "User";
    const image = mongoUser.image || null;
    const now = new Date();

    const existing = await pg.query(
      `SELECT id FROM "user" WHERE id = $1 OR lower(email) = $2 LIMIT 1`,
      [id, email]
    );

    if (existing.rowCount > 0) {
      usersSkipped += 1;
      continue;
    }

    await pg.query(
      `INSERT INTO "user" (
        id, name, email, email_verified, image, username, created_at, updated_at
      ) VALUES ($1, $2, $3, true, $4, $5, $6, $7)`,
      [id, name, email, image, username, now, now]
    );
    usersInserted += 1;
  }

  const userIdByOldId = new Map();
  const allUsers = await pg.query(`SELECT id, email FROM "user"`);
  for (const row of allUsers.rows) {
    userIdByOldId.set(row.id, row.id);
  }

  for (const mongoUser of users) {
    const oldId = String(mongoUser._id);
    if (userIdByOldId.has(oldId)) continue;

    const email = String(mongoUser.email || "").trim().toLowerCase();
    const match = allUsers.rows.find(
      (row) => String(row.email).toLowerCase() === email
    );
    if (match) {
      userIdByOldId.set(oldId, match.id);
    }
  }

  for (const mongoPrompt of prompts) {
    const id = String(mongoPrompt._id);
    const oldCreatorId = String(mongoPrompt.creator);
    const userId = userIdByOldId.get(oldCreatorId);

    if (!userId) {
      quotesMissingUser += 1;
      continue;
    }

    const existing = await pg.query(
      `SELECT id FROM "quote" WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (existing.rowCount > 0) {
      quotesSkipped += 1;
      continue;
    }

    const now = new Date();
    await pg.query(
      `INSERT INTO "quote" (
        id, user_id, prompt, tag, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        userId,
        mongoPrompt.prompt,
        mongoPrompt.tag,
        now,
        now,
      ]
    );
    quotesInserted += 1;
  }

  const counts = await pg.query(`
    SELECT
      (SELECT COUNT(*)::int FROM "user") AS users,
      (SELECT COUNT(*)::int FROM "quote") AS quotes
  `);

  console.log(`users_inserted=${usersInserted}`);
  console.log(`users_skipped=${usersSkipped}`);
  console.log(`quotes_inserted=${quotesInserted}`);
  console.log(`quotes_skipped=${quotesSkipped}`);
  console.log(`quotes_missing_user=${quotesMissingUser}`);
  console.log(`postgres_users=${counts.rows[0].users}`);
  console.log(`postgres_quotes=${counts.rows[0].quotes}`);

  await pg.end();
  await mongo.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
