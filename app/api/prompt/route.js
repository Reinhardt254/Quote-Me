import { listQuotes } from "@lib/quotes";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const prompts = await listQuotes();

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
