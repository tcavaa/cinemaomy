"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const MAX_EDGE = 2400;
const BUCKET = "media";

export type UploadedImage = { url: string; width: number; height: number };

/** Downscales large photos in the browser before upload (phones produce 12-megapixel files). */
async function prepare(file: File): Promise<{ blob: Blob; width: number; height: number; ext: string }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const keepOriginal = scale === 1 && file.size < 2_500_000 && /jpe?g|webp|avif/.test(file.type);
  if (keepOriginal || file.type === "image/gif") {
    bitmap.close();
    return { blob: file, width, height, ext: file.name.split(".").pop()?.toLowerCase() || "jpg" };
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process image"))), "image/webp", 0.86),
  );
  return { blob, width: canvas.width, height: canvas.height, ext: "webp" };
}

/** Uploads an image to the public `media` bucket using the admin's session. */
export async function uploadImage(file: File, folder: string): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) throw new Error("That file is not an image.");
  const { blob, width, height, ext } = await prepare(file);
  const supabase = createSupabaseBrowserClient();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: blob.type || file.type,
    upsert: false,
  });
  if (error) {
    throw new Error(
      /row-level security|unauthorized|jwt/i.test(error.message)
        ? "Upload refused — make sure you are signed in with an admin account."
        : error.message,
    );
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, width, height };
}
