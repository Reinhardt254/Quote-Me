import { asc, eq } from "drizzle-orm";
import { db } from "@lib/db";
import { libraryImage, template } from "@lib/schema";

export function mapTemplateRow(row) {
  const image = row.defaultImage || row.library_image || null;
  return {
    id: row.template.id,
    name: row.template.name,
    slug: row.template.slug,
    layoutKey: row.template.layoutKey,
    description: row.template.description,
    active: row.template.active,
    sortOrder: row.template.sortOrder,
    defaultImageId: row.template.defaultImageId,
    defaultImage: image
      ? {
          id: image.id,
          title: image.title,
          url: image.url,
          alt: image.alt,
        }
      : null,
  };
}

export async function listTemplates({ activeOnly = false } = {}) {
  const base = db
    .select({
      template,
      library_image: libraryImage,
    })
    .from(template)
    .leftJoin(libraryImage, eq(template.defaultImageId, libraryImage.id));

  const rows = activeOnly
    ? await base.where(eq(template.active, true)).orderBy(asc(template.sortOrder))
    : await base.orderBy(asc(template.sortOrder));

  return rows.map(mapTemplateRow);
}

export async function getTemplateById(id) {
  const rows = await db
    .select({
      template,
      library_image: libraryImage,
    })
    .from(template)
    .leftJoin(libraryImage, eq(template.defaultImageId, libraryImage.id))
    .where(eq(template.id, id))
    .limit(1);

  return rows[0] ? mapTemplateRow(rows[0]) : null;
}

export async function createTemplate(values) {
  const [created] = await db.insert(template).values(values).returning();
  return getTemplateById(created.id);
}

export async function updateTemplate(id, values) {
  const [updated] = await db
    .update(template)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(template.id, id))
    .returning();

  return updated ? getTemplateById(id) : null;
}

export async function deleteTemplate(id) {
  const [deleted] = await db
    .delete(template)
    .where(eq(template.id, id))
    .returning({ id: template.id });

  return Boolean(deleted);
}

export async function listLibraryImages() {
  const rows = await db
    .select()
    .from(libraryImage)
    .orderBy(asc(libraryImage.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    url: row.url,
    alt: row.alt,
    createdAt: row.createdAt,
  }));
}

export async function createLibraryImage(values) {
  const [created] = await db.insert(libraryImage).values(values).returning();
  return {
    id: created.id,
    title: created.title,
    url: created.url,
    alt: created.alt,
    createdAt: created.createdAt,
  };
}

export async function deleteLibraryImage(id) {
  const [deleted] = await db
    .delete(libraryImage)
    .where(eq(libraryImage.id, id))
    .returning({ id: libraryImage.id });

  return Boolean(deleted);
}

export async function getLibraryImageById(id) {
  const row = await db.query.libraryImage.findFirst({
    where: eq(libraryImage.id, id),
  });

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    url: row.url,
    alt: row.alt,
    createdAt: row.createdAt,
  };
}
