import { randomUUID } from "crypto";
import { createQuote } from "@lib/quotes";
import { getCurrentUser } from "@lib/session";

export const dynamic = "force-dynamic";

export const POST = async (req) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { prompt, tag, image } = await req.json();

  try {
    const newPrompt = await createQuote({
      id: randomUUID(),
      userId: currentUser.id,
      prompt,
      tag,
      image: typeof image === "string" ? image : null,
    });

    return new Response(JSON.stringify(newPrompt), {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return new Response("Failed to create a new prompt", {
      status: 500,
    });
  }
};
