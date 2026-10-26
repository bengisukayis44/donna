import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/brand-mark";

export async function GET(_req: Request, ctx: RouteContext<"/icons/[size]">) {
  const { size } = await ctx.params;
  const s = size === "512" ? 512 : 192;
  return new ImageResponse(<BrandMark size={s} />, {
    width: s,
    height: s,
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
