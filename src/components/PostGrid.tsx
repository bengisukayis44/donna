"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PAGE_SIZE, toRpcParams } from "@/lib/domain/posts";
import type { PostCardData, SearchParams } from "@/lib/domain/types";
import { PostCard, PostCardSkeleton } from "./PostCard";

// İlk sayfa sunucudan gelir; aşağı kaydırdıkça aynı RPC ile devamı çekilir.
export function PostGrid({
  initial,
  params,
  empty,
}: {
  initial: PostCardData[];
  params: SearchParams;
  empty?: React.ReactNode;
}) {
  const [posts, setPosts] = useState(initial);
  const [done, setDone] = useState(initial.length < PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(params);

  // Sunucudan yeni ilk sayfa gelince (filtre değişti / yenilendi) listeyi sıfırla
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setPosts(initial);
    setDone(initial.length < PAGE_SIZE);
  }

  useEffect(() => {
    if (done) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || loading) return;
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.rpc("search_posts", toRpcParams({ ...params, offset: posts.length }));
      const next = (data ?? []) as PostCardData[];
      setPosts((prev) => [...prev, ...next.filter((n) => !prev.some((p) => p.id === n.id))]);
      if (next.length < PAGE_SIZE) setDone(true);
      setLoading(false);
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, loading, posts.length, key]);

  if (posts.length === 0 && empty) return <>{empty}</>;

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        {posts.map((p, i) => (
          <PostCard key={p.id} post={p} priority={i < 4} />
        ))}
        {loading && [0, 1].map((i) => <PostCardSkeleton key={`s${i}`} />)}
      </div>
      {!done && <div ref={sentinel} className="h-10" />}
    </>
  );
}
