import { eq } from "drizzle-orm";
import { db } from "@lib/db";
import { quote, user } from "@lib/schema";

export function mapQuoteRow(row) {
  return {
    _id: row.quote.id,
    prompt: row.quote.prompt,
    tag: row.quote.tag,
    image: row.quote.image || null,
    creator: {
      _id: row.user.id,
      email: row.user.email,
      username: row.user.username,
      image: row.user.image,
    },
  };
}

export async function listQuotes({ userId } = {}) {
  const query = db
    .select({
      quote,
      user,
    })
    .from(quote)
    .innerJoin(user, eq(quote.userId, user.id));

  const rows = userId
    ? await query.where(eq(quote.userId, userId))
    : await query;

  return rows.map(mapQuoteRow);
}

export async function getQuoteById(id) {
  const rows = await db
    .select({
      quote,
      user,
    })
    .from(quote)
    .innerJoin(user, eq(quote.userId, user.id))
    .where(eq(quote.id, id))
    .limit(1);

  return rows[0] ? mapQuoteRow(rows[0]) : null;
}

export async function createQuote({ id, userId, prompt, tag, image }) {
  const [created] = await db
    .insert(quote)
    .values({
      id,
      userId,
      prompt,
      tag,
      image: image || null,
    })
    .returning();

  const creator = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  return {
    _id: created.id,
    prompt: created.prompt,
    tag: created.tag,
    image: created.image || null,
    creator: {
      _id: creator.id,
      email: creator.email,
      username: creator.username,
      image: creator.image,
    },
  };
}

export async function updateQuote({ id, prompt, tag, image }) {
  const values = {
    prompt,
    tag,
    updatedAt: new Date(),
  };

  if (image !== undefined) {
    values.image = image || null;
  }

  const [updated] = await db
    .update(quote)
    .set(values)
    .where(eq(quote.id, id))
    .returning();

  return updated || null;
}

export async function deleteQuote(id) {
  const [deleted] = await db
    .delete(quote)
    .where(eq(quote.id, id))
    .returning({ id: quote.id });

  return Boolean(deleted);
}

export async function getQuoteOwnerId(id) {
  const rows = await db
    .select({ userId: quote.userId })
    .from(quote)
    .where(eq(quote.id, id))
    .limit(1);

  return rows[0]?.userId || null;
}
