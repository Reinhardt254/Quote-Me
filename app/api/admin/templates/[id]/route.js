import { requireAdmin } from "@lib/admin";
import { deleteTemplate, updateTemplate } from "@lib/templates";

export const dynamic = "force-dynamic";

export const PATCH = async (req, { params }) => {
  const admin = await requireAdmin();
  if (!admin) return new Response("Not found", { status: 404 });

  try {
    const { id } = await params;
    const body = await req.json();
    const values = {};

    if (body.name !== undefined) values.name = body.name;
    if (body.slug !== undefined) values.slug = body.slug;
    if (body.layoutKey !== undefined) values.layoutKey = body.layoutKey;
    if (body.description !== undefined) values.description = body.description;
    if (body.active !== undefined) values.active = Boolean(body.active);
    if (body.sortOrder !== undefined) values.sortOrder = Number(body.sortOrder);
    if (body.defaultImageId !== undefined) {
      values.defaultImageId = body.defaultImageId || null;
    }

    const updated = await updateTemplate(id, values);
    if (!updated) return new Response("Not found", { status: 404 });
    return Response.json(updated);
  } catch (error) {
    console.error(error);
    return new Response("Failed to update template", { status: 500 });
  }
};

export const DELETE = async (_req, { params }) => {
  const admin = await requireAdmin();
  if (!admin) return new Response("Not found", { status: 404 });

  try {
    const { id } = await params;
    const ok = await deleteTemplate(id);
    if (!ok) return new Response("Not found", { status: 404 });
    return new Response("Deleted", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Failed to delete template", { status: 500 });
  }
};
