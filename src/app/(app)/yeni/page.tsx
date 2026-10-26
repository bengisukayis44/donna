import { redirect } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import type { Category } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

export const metadata = { title: "Kombinini paylaş" };

export default async function NewPostPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/giris?mod=kayit&next=/yeni");
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("position");
  return <PostForm userId={viewer.id} categories={(categories ?? []) as Category[]} />;
}
