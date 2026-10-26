import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { loadAttributeDefs } from "@/lib/attributes";
import type { Category, PostDetail } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

export const metadata = { title: "Paylaşımı düzenle" };

export default async function EditPostPage(props: PageProps<"/p/[id]/duzenle">) {
  const { id } = await props.params;
  const viewer = await getViewer();
  if (!viewer) redirect(`/giris?next=/p/${id}/duzenle`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const [{ data }, { data: categories }, attributeDefs] = await Promise.all([
    supabase.rpc("get_post", { p_id: id }),
    supabase.from("categories").select("*").order("position"),
    loadAttributeDefs(supabase),
  ]);
  const post = data as PostDetail | null;
  if (!post) notFound();
  if (!post.is_owner) redirect(`/p/${id}`);

  return (
    <PostForm
      userId={viewer.id}
      categories={(categories ?? []) as Category[]}
      attributeDefs={attributeDefs}
      initial={{ id: post.id, caption: post.caption, photos: post.photos, items: post.items }}
    />
  );
}
