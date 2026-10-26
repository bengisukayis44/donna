import { redirect } from "next/navigation";
import type { Category } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { NewPostForm } from "./NewPostForm";

export const metadata = { title: "Kombinini paylaş" };

export default async function NewPostPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/giris?mod=kayit&next=/yeni");
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("position");
  return <NewPostForm userId={viewer.id} categories={(categories ?? []) as Category[]} />;
}
