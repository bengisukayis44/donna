import Image from "next/image";
import { photoUrl } from "@/lib/domain/posts";

export function Avatar({ path, name, size = 36 }: { path: string | null | undefined; name: string; size?: number }) {
  const url = path?.startsWith("http") ? path : photoUrl(path, "avatars");
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sand font-serif text-muted"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {url ? (
        <Image src={url} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        name.slice(0, 1).toLocaleUpperCase("tr-TR")
      )}
    </span>
  );
}
