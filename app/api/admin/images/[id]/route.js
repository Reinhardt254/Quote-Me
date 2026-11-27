import { requireAdmin } from "@lib/admin";
import { deleteLibraryImage } from "@lib/templates";

export const dynamic = "force-dynamic";

export const DELETE = async (_req, { params }) => {
  const admin = await requireAdmin();
  if (!admin) return new Response("Not found", { status: 404 });

  try {
    const { id } = await params;
    const ok = await deleteLibraryImage(id);
    if (!ok) return new Response("Not found", { status: 404 });
    return new Response("Deleted", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Failed to delete image", { status: 500 });
  }
};
