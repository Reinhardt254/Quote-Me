import {
  deleteQuote,
  getQuoteById,
  getQuoteOwnerId,
  updateQuote,
} from "@lib/quotes";
import { getCurrentUser } from "@lib/session";

export const dynamic = "force-dynamic";

export const GET = async (_request, { params }) => {
  try {
    const { id } = await params;
    const prompt = await getQuoteById(id);

    if (!prompt) {
      return new Response("prompt not found", { status: 404 });
    }

    return new Response(JSON.stringify(prompt), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Failed to fetch prompt", { status: 500 });
  }
};

export const PATCH = async (req, { params }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { prompt, tag, image } = await req.json();

  try {
    const { id } = await params;
    const ownerId = await getQuoteOwnerId(id);

    if (!ownerId) {
      return new Response("prompt not found", { status: 404 });
    }

    if (ownerId !== currentUser.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const payload = {
      id,
      prompt,
      tag,
    };

    if (image !== undefined) {
      payload.image = typeof image === "string" ? image : null;
    }

    await updateQuote(payload);
    const updated = await getQuoteById(id);

    return new Response(JSON.stringify(updated), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Failed to update prompt", { status: 500 });
  }
};

export const DELETE = async (_request, { params }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const ownerId = await getQuoteOwnerId(id);

    if (!ownerId) {
      return new Response("prompt not found", { status: 404 });
    }

    if (ownerId !== currentUser.id) {
      return new Response("Forbidden", { status: 403 });
    }

    await deleteQuote(id);

    return new Response("Prompt deleted successfully", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Failed to delete prompt", { status: 500 });
  }
};
