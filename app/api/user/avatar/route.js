import { eq } from "drizzle-orm";
import { db } from "@lib/db";
import { user } from "@lib/schema";
import { getCurrentUser } from "@lib/session";

export const dynamic = "force-dynamic";

export const PATCH = async (req) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const image = typeof body?.image === "string" ? body.image.trim() : "";

    if (!image) {
      return new Response(JSON.stringify({ error: "Image URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [updated] = await db
      .update(user)
      .set({
        image,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        username: user.username,
      });

    return new Response(JSON.stringify({ user: updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to update avatar" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
