import { desc, eq } from "drizzle-orm";
import { db } from "@lib/db";
import { quote, template, user } from "@lib/schema";

export function mapQuoteRow(row) {
  return {
    _id: row.quote.id,
    prompt: row.quote.prompt,
    tag: row.quote.tag,
    image: row.quote.image || null,
    templateId: row.quote.templateId || null,
    template: row.template
      ? {
          id: row.template.id,
          name: row.template.name,
          slug: row.template.slug,
          layoutKey: row.template.layoutKey,
          description: row.template.description,
        }
      : null,
    creator: {
      _id: row.user.id,
      email: row.user.email,
      username: row.user.username,
      image: row.user.image,
    },
  };
}

export async function listQuotes({ userId } = {}) {
  const base = db
    .select({
      quote,
      user,
      template,
    })
    .from(quote)
    .innerJoin(user, eq(quote.userId, user.id))
    .leftJoin(template, eq(quote.templateId, template.id));

  const rows = userId
    ? await base
        .where(eq(quote.userId, userId))
        .orderBy(desc(quote.createdAt))
    : await base.orderBy(desc(quote.createdAt));

  return rows.map(mapQuoteRow);
}

export async function getQuoteById(id) {
  const rows = await db
    .select({
      quote,
      user,
      template,
    })
    .from(quote)
    .innerJoin(user, eq(quote.userId, user.id))
    .leftJoin(template, eq(quote.templateId, template.id))
    .where(eq(quote.id, id))
    .limit(1);

  return rows[0] ? mapQuoteRow(rows[0]) : null;
}

export async function createQuote({
  id,
  userId,
  prompt,
  tag,
  image,
  templateId,
}) {
  const [created] = await db
    .insert(quote)
    .values({
      id,
      userId,
      prompt,
      tag,
      image: image || null,
      templateId: templateId || null,
    })
    .returning();

  return getQuoteById(created.id);
}

export async function updateQuote({
  id,
  prompt,
  tag,
  image,
  templateId,
}) {
  const values = {
    prompt,
    tag,
    updatedAt: new Date(),
  };

  if (image !== undefined) {
    values.image = image || null;
  }

  if (templateId !== undefined) {
    values.templateId = templateId || null;
  }

  const [updated] = await db
    .update(quote)
    .set(values)
    .where(eq(quote.id, id))
    .returning();

  return updated ? getQuoteById(id) : null;
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
