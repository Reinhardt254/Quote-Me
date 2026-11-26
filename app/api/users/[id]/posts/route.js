import { listQuotes } from "@lib/quotes";

export const dynamic = "force-dynamic";

export const GET = async (_request, { params }) => {
  try {
    const { id } = await params;
    const prompts = await listQuotes({ userId: id });

    return new Response(JSON.stringify(prompts), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Failed to fetch all prompts", {
      status: 500,
    });
  }
};
