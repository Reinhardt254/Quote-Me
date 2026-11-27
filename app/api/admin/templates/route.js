import { randomUUID } from "crypto";
import { requireAdmin } from "@lib/admin";
import { createTemplate, listTemplates } from "@lib/templates";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const admin = await requireAdmin();
  if (!admin) return new Response("Not found", { status: 404 });

  try {
    const templates = await listTemplates({ activeOnly: false });
    return Response.json(templates);
  } catch (error) {
    console.error(error);
    return new Response("Failed to fetch templates", { status: 500 });
  }
};

export const POST = async (req) => {
  const admin = await requireAdmin();
  if (!admin) return new Response("Not found", { status: 404 });

  try {
    const body = await req.json();
    const created = await createTemplate({
      id: randomUUID(),
      name: body.name,
      slug: body.slug,
      layoutKey: body.layoutKey,
      description: body.description || "",
      active: body.active !== false,
      sortOrder: Number(body.sortOrder) || 0,
      defaultImageId: body.defaultImageId || null,
    });
    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response("Failed to create template", { status: 500 });
  }
};
