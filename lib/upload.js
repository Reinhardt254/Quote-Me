import { randomUUID } from "crypto";

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function extensionForType(contentType) {
  return EXT_BY_TYPE[contentType] || "bin";
}

export function buildObjectKey({ kind, userId, contentType }) {
  const folder = kind === "avatar" ? "avatars" : "quotes";
  const ext = extensionForType(contentType);
  return `${folder}/${userId}/${randomUUID()}.${ext}`;
}

export async function readUploadFile(formData) {
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return { error: "No file provided", status: 400 };
  }

  const contentType = file.type || "";
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return {
      error: "Unsupported image type. Use jpeg, png, webp, or gif.",
      status: 415,
    };
  }

  if (typeof file.size === "number" && file.size > MAX_IMAGE_BYTES) {
    return { error: "Image must be 5MB or smaller", status: 413 };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length > MAX_IMAGE_BYTES) {
    return { error: "Image must be 5MB or smaller", status: 413 };
  }

  return {
    buffer,
    contentType,
    size: buffer.length,
  };
}
