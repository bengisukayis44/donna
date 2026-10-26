import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { BackButton } from "@/components/BackButton";
import { Gallery } from "@/components/Gallery";
import { MeasurementChips } from "@/components/MeasurementChips";
import { PostActions } from "@/components/PostActions";
import { FIT_LABELS, LENGTH_LABELS, proximityLabel } from "@/lib/domain/posts";
import type { PostDetail, PostItem } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

const UUID = /^[0-9a-f-]{36}$/i;

async function load(id: string) {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_post", { p_id: id });
  return data as PostDetail | null;
}

export async function generateMetadata(props: PageProps<"/p/[id]">) {
  const post = await load((await props.params).id);
  const item = post?.items[0];
  return { title: item ? `${item.brand ?? ""} ${item.product_name ?? ""} · ${item.size_bought} beden`.trim() : "Paylaşım" };
}

export default async function PostPage(props: PageProps<"/p/[id]">) {
  const { id } = await props.params;
  const [post, viewer] = await Promise.all([load(id), getViewer()]);
  if (!post) notFound();
  const near = proximityLabel(post.proximity);

  return (
    <main>
      <div className="relative">
        <BackButton className="absolute left-3 top-3 z-10" />
        <Gallery photos={post.photos} />
      </div>

      {post.status !== "published" && (
        <p className="bg-terracotta px-4 py-2 text-sm text-cream">
          Bu paylaşım {post.status === "hidden" ? "gizlendi" : "kaldırıldı"}; sadece sen{viewer?.isAdmin ? " ve ekip" : ""} görebilirsin.
        </p>
      )}

      <div className="space-y-6 px-4 pt-3">
        <PostActions
          postId={post.id}
          loggedIn={!!viewer}
          isOwner={post.is_owner}
          initial={{ liked: post.liked, saved: post.saved, like_count: post.like_count, save_count: post.save_count }}
        />

        <section className="rounded-[var(--radius-card)] border border-line bg-card p-4">
          <div className="flex items-center gap-3">
            <Link href={`/u/${post.author.username}`} className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar path={post.author.avatar_url} name={post.author.display_name ?? post.author.username} size={40} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{post.author.display_name ?? post.author.username}</p>
                <p className="truncate text-xs text-muted">@{post.author.username}</p>
              </div>
            </Link>
            {near && <span className="shrink-0 rounded-full bg-terracotta/10 px-2.5 py-1 text-xs font-semibold text-terracotta">{near}</span>}
          </div>
          <p className="eyebrow mt-4 mb-2">Paylaşırkenki ölçüleri</p>
          <MeasurementChips
            m={post.measurements}
            extra={[["Genelde üst", post.usual_sizes.top], ["Genelde alt", post.usual_sizes.bottom]]}
          />
        </section>

        {post.caption && <p className="whitespace-pre-line text-[15px] leading-relaxed">{post.caption}</p>}

        <section>
          <h2 className="eyebrow mb-3">Üzerindekiler</h2>
          <ul className="space-y-3">
            {post.items.map((item) => <ItemCard key={item.id} item={item} />)}
          </ul>
        </section>

        <p className="pb-4 text-center text-xs text-muted">
          {new Date(post.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </main>
  );
}

function ItemCard({ item }: { item: PostItem }) {
  return (
    <li className="rounded-[var(--radius-card)] border border-line bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {item.brand_slug ? (
            <Link href={`/ara?marka=${item.brand_slug}`} className="font-semibold underline-offset-4 hover:underline">{item.brand}</Link>
          ) : (
            <span className="font-semibold">{item.brand ?? "Marka belirtilmemiş"}</span>
          )}
          {item.product_name && (
            <Link href={`/ara?q=${encodeURIComponent([item.brand, item.product_name].filter(Boolean).join(" "))}`} className="block text-[15px] leading-snug">
              {item.product_name}
            </Link>
          )}
          {item.category_label && (
            <Link href={`/ara?kategori=${item.category}`} className="mt-1 inline-block text-xs text-muted">{item.category_label}</Link>
          )}
        </div>
        <div className="shrink-0 rounded-xl bg-terracotta px-3 py-1.5 text-center text-cream">
          <span className="block text-[9px] uppercase tracking-widest opacity-80">Aldığı beden</span>
          <span className="block text-2xl font-bold leading-tight">{item.size_bought}</span>
        </div>
      </div>
      {(item.fit_rating || item.length_rating) && (
        <div className="mt-3 flex gap-2 text-xs">
          {item.fit_rating && <Rating label="Kalıp" value={FIT_LABELS[item.fit_rating]} />}
          {item.length_rating && <Rating label="Boy" value={LENGTH_LABELS[item.length_rating]} />}
        </div>
      )}
      {item.fit_note && <p className="mt-3 text-sm leading-relaxed"><span className="text-muted">Fit: </span>{item.fit_note}</p>}
      {item.fabric_note && <p className="mt-1 text-sm leading-relaxed"><span className="text-muted">Kumaş: </span>{item.fabric_note}</p>}
      {item.product_url && (
        <a href={item.product_url} target="_blank" rel="noopener noreferrer nofollow" className="mt-3 inline-block rounded-full border border-ink px-4 py-1.5 text-sm font-semibold">
          Ürüne git ↗
        </a>
      )}
    </li>
  );
}

function Rating({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-sand px-2.5 py-1">
      <span className="text-muted">{label}:</span> <b>{value}</b>
    </span>
  );
}
