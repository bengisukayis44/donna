import { redirect } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { loadAttributeDefs } from "@/lib/attributes";
import type { Category } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

export const metadata = { title: "Kombinini paylaş" };

export default async function NewPostPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/giris?mod=kayit&next=/yeni");
  const supabase = await createClient();
  const [{ data: categories }, attributeDefs] = await Promise.all([
    supabase.from("categories").select("*").order("position"),
    loadAttributeDefs(supabase),
  ]);
  return <PostForm userId={viewer.id} categories={(categories ?? []) as Category[]} attributeDefs={attributeDefs} />;
}
