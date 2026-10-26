import Image from "next/image";
import Link from "next/link";
import { formatMasked } from "@/lib/domain/measurements";
import { photoUrl, proximityLabel } from "@/lib/domain/posts";
import type { PostCardData } from "@/lib/domain/types";

export function PostCard({ post, priority = false }: { post: PostCardData; priority?: boolean }) {
  const url = photoUrl(post.cover_path);
  const height = formatMasked("height_cm", post.height);
  const near = proximityLabel(post.proximity);
  return (
    <Link href={`/p/${post.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-placeholder">
        {url && (
          <Image
            src={url}
            alt={post.main_brand ? `${post.main_brand} kombini` : "Kombin"}
            fill
            sizes="(max-width: 448px) 50vw, 224px"
            className="object-cover transition-transform duration-500 group-active:scale-[0.98]"
            priority={priority}
          />
        )}
        {near && (
          <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-terracotta backdrop-blur">
            {near}
          </span>
        )}
        {post.photo_count > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-ink/50 px-1.5 text-[10px] text-cream">1/{post.photo_count}</span>
        )}
        {post.main_size && (
          <span className="absolute bottom-2 right-2 rounded-lg bg-terracotta px-2 py-0.5 text-sm font-bold text-cream shadow">
            {post.main_size}
          </span>
        )}
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="truncate text-[13px] font-semibold">{post.main_brand ?? "—"}</p>
        <p className="truncate text-xs text-muted">
          {[height, post.main_size].filter(Boolean).join(" · ") || `@${post.author_username}`}
        </p>
      </div>
    </Link>
  );
}

export function PostCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] animate-pulse rounded-[var(--radius-card)] bg-placeholder/60" />
      <div className="mt-2 h-3 w-2/3 rounded bg-sand" />
    </div>
  );
}
