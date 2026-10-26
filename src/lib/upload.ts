import type { SupabaseClient } from "@supabase/supabase-js";
import { extFor, prepareImage } from "./image";

// Dosyayı küçültüp EXIF'ten arındırır, "<userId>/..." yoluna yükler ve yolu döndürür.
export async function uploadImage(
  supabase: SupabaseClient,
  bucket: "post-photos" | "avatars",
  userId: string,
  file: File,
  opts: { maxSide?: number; prefix?: string } = {},
): Promise<string> {
  const blob = await prepareImage(file, opts.maxSide ?? (bucket === "avatars" ? 600 : 1600));
  const path = `${userId}/${opts.prefix ?? ""}${crypto.randomUUID()}.${extFor(blob)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: blob.type,
    cacheControl: "31536000",
  });
  if (error) throw error;
  return path;
}
