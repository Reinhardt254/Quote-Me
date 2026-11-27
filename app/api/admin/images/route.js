import { randomUUID } from "crypto";
import { requireAdmin } from "@lib/admin";
import { createLibraryImage, listLibraryImages } from "@lib/templates";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const admin = await requireAdmin();
  if (!admin) return new Response("Not found", { status: 404 });

  try {
    const images = await listLibraryImages();
    return Response.json(images);
  } catch (error) {
    console.error(error);
    return new Response("Failed to fetch images", { status: 500 });
  }
};

export const POST = async (req) => {
  const admin = await requireAdmin();
  if (!admin) return new Response("Not found", { status: 404 });

  try {
    const body = await req.json();
    const created = await createLibraryImage({
      id: randomUUID(),
      title: body.title || "Library image",
      url: body.url,
      alt: body.alt || body.title || "Library image",
    });
    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response("Failed to create image", { status: 500 });
  }
};
