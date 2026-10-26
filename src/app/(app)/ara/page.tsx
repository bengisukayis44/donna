import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { PostGrid } from "@/components/PostGrid";
import { toRpcParams } from "@/lib/domain/posts";
import type { Category, PostCardData, SearchParams } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { SearchControls } from "./SearchControls";

export const metadata = { title: "Ara" };

const str = (v: string | string[] | undefined) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: string | string[] | undefined) => {
  const n = Number(str(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export default async function SearchPage(props: PageProps<"/ara">) {
  const sp = await props.searchParams;
  const tab = str(sp.sekme) ?? "paylasimlar";
  const q = str(sp.q);
  const supabase = await createClient();

  const params: SearchParams = {
    q,
    brand: str(sp.marka),
    category: str(sp.kategori),
    size: str(sp.beden),
    heightMin: num(sp.boymin),
    heightMax: num(sp.boymax),
    weightMin: num(sp.kilomin),
    weightMax: num(sp.kilomax),
    nearMe: sp.yakin === "1", // misafirde yakınlık puanı olmadığından sonuç boş döner
    sort: (["new", "near", "popular"] as const).find((s) => s === sp.sirala) ?? "new",
    attrs: str(sp.renk) ? { color: str(sp.renk)! } : undefined,
  };

  // Sonuçlar, kullanıcı ve filtre seçenekleri aynı anda çekilir
  const resultsQuery =
    tab === "markalar"
      ? supabase.rpc("search_brands", { p_q: q ?? "", p_limit: 30 })
      : tab === "kullanicilar"
        ? q ? supabase.rpc("search_users", { p_q: q }) : Promise.resolve({ data: [] })
        : supabase.rpc("search_posts", toRpcParams(params));
  const [viewer, { data: resultData }, { data: categories }, { data: colors }, brandName] = await Promise.all([
    getViewer(),
    resultsQuery,
    supabase.from("categories").select("*").order("position"),
    supabase.from("attribute_options").select("value, label, swatch").eq("attr_key", "color").order("position"),
    params.brand ? supabase.from("brands").select("name").eq("slug", params.brand).maybeSingle().then((r) => r.data?.name) : null,
  ]);

  let results: React.ReactNode;
  if (tab === "markalar") {
    const data = resultData;
    results = (
      <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card">
        {(data ?? []).map((b: { id: string; name: string; slug: string; post_count: number }) => (
          <li key={b.id}>
            <Link href={`/ara?marka=${b.slug}`} className="flex items-center justify-between px-4 py-3">
              <span className="font-semibold">{b.name}</span>
              <span className="text-sm text-muted">{b.post_count} paylaşım</span>
            </Link>
          </li>
        ))}
        {!data?.length && <li className="px-4 py-6 text-center text-sm text-muted">Marka bulunamadı.</li>}
      </ul>
    );
  } else if (tab === "kullanicilar") {
    const data = resultData;
    results = (
      <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card">
        {(data ?? []).map((u: { username: string; display_name: string | null; avatar_url: string | null }) => (
          <li key={u.username}>
            <Link href={`/u/${u.username}`} className="flex items-center gap-3 px-4 py-3">
              <Avatar path={u.avatar_url} name={u.display_name ?? u.username} size={36} />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{u.display_name ?? u.username}</span>
                <span className="block text-xs text-muted">@{u.username}</span>
              </span>
            </Link>
          </li>
        ))}
        {!data?.length && <li className="px-4 py-6 text-center text-sm text-muted">{q ? "Kullanıcı bulunamadı." : "Bir isim ya da kullanıcı adı yaz."}</li>}
      </ul>
    );
  } else {
    const data = resultData;
    results = (
      <PostGrid
        initial={(data ?? []) as PostCardData[]}
        params={params}
        empty={<p className="py-10 text-center text-sm text-muted">Bu aramaya uygun paylaşım yok. Filtreleri biraz gevşetmeyi dene.</p>}
      />
    );
  }

  return (
    <main className="px-4 pt-4">
      <SearchControls
        tab={tab}
        categories={(categories ?? []) as Category[]}
        loggedIn={!!viewer}
        brandName={brandName ?? null}
        colors={colors ?? []}
      />
      <div className="mt-4">{results}</div>
    </main>
  );
}
