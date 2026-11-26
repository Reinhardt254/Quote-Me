import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@lib/schema";

function env(name) {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

const connectionString = env("DATABASE_URL");

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const globalForDb = globalThis;

if (!globalForDb._quoteMePool) {
  globalForDb._quoteMePool = new Pool({
    connectionString,
  });
}

export const pool = globalForDb._quoteMePool;

export const db = drizzle(pool, { schema });
