// Fotoğrafı tarayıcıda küçültür ve yeniden kodlar. Canvas'tan çıkan dosyada EXIF (konum dahil) bulunmaz.
export async function prepareImage(file: File, maxSide = 1600, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  // Eski Safari WebP üretemez; o durumda JPEG
  const webp = await toBlob("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await toBlob("image/jpeg");
  if (!jpeg) throw new Error("encode");
  return jpeg;
}

export const extFor = (blob: Blob) => (blob.type === "image/webp" ? "webp" : "jpg");
