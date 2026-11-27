import { listLibraryImages } from "@lib/templates";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const images = await listLibraryImages();
    return Response.json(images);
  } catch (error) {
    console.error(error);
    return new Response("Failed to fetch images", { status: 500 });
  }
};
