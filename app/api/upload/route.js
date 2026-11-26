import { getCurrentUser } from "@lib/session";
import { uploadObject } from "@lib/s3";
import { buildObjectKey, readUploadFile } from "@lib/upload";

export const dynamic = "force-dynamic";

export const POST = async (req) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const formData = await req.formData();
    const kind = String(formData.get("kind") || "").trim();

    if (kind !== "avatar" && kind !== "quote") {
      return new Response(JSON.stringify({ error: "Invalid upload kind" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fileResult = await readUploadFile(formData);

    if (fileResult.error) {
      return new Response(JSON.stringify({ error: fileResult.error }), {
        status: fileResult.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const key = buildObjectKey({
      kind,
      userId: currentUser.id,
      contentType: fileResult.contentType,
    });

    const uploaded = await uploadObject({
      key,
      body: fileResult.buffer,
      contentType: fileResult.contentType,
    });

    return new Response(JSON.stringify(uploaded), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
