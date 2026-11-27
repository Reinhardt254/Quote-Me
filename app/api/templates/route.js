import { listTemplates } from "@lib/templates";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "1";
    const templates = await listTemplates({ activeOnly: !all });
    return Response.json(templates);
  } catch (error) {
    console.error(error);
    return new Response("Failed to fetch templates", { status: 500 });
  }
};
