import { PostCardSkeleton } from "@/components/PostCard";

// Sayfa verisi gelene kadar anında gösterilen iskelet (geçişler donmuş hissettirmesin)
export default function Loading() {
  return (
    <main className="px-4 pt-4" aria-busy="true">
      <div className="h-8 w-28 animate-pulse rounded-full bg-sand" />
      <div className="mt-4 h-9 w-full animate-pulse rounded-full bg-sand/70" />
      <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4">
        {Array.from({ length: 6 }, (_, i) => <PostCardSkeleton key={i} />)}
      </div>
    </main>
  );
}
