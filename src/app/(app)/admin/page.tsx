import { notFound } from "next/navigation";
import { BackButton } from "@/components/BackButton";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";
import { BrandAdmin, ReportList, type ReportGroup } from "./AdminClient";

export const metadata = { title: "Admin" };

export default async function AdminPage(props: PageProps<"/admin">) {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) notFound();
  const { sekme } = await props.searchParams;
  const tab = sekme === "markalar" ? "markalar" : "sikayetler";
  const supabase = await createClient();

  let content: React.ReactNode;
  if (tab === "markalar") {
    const { data } = await supabase.rpc("search_brands", { p_q: "", p_limit: 50 });
    const { data: all } = await supabase.from("brands").select("id, name, slug, aliases").order("name");
    const counts = Object.fromEntries((data ?? []).map((b: { id: string; post_count: number }) => [b.id, b.post_count]));
    content = <BrandAdmin brands={(all ?? []).map((b) => ({ ...b, post_count: counts[b.id] ?? 0 }))} />;
  } else {
    const { data } = await supabase.rpc("admin_reports");
    content = <ReportList groups={(data ?? []) as ReportGroup[]} />;
  }

  return (
    <main className="px-4 pt-3">
      <header className="flex items-center gap-3">
        <BackButton fallback="/ayarlar" />
        <h1 className="font-serif text-2xl">Admin</h1>
      </header>
      <nav className="mt-4 flex gap-5 border-b border-line text-sm">
        <a href="/admin" className={`-mb-px border-b-2 pb-2 ${tab === "sikayetler" ? "border-terracotta font-semibold" : "border-transparent text-muted"}`}>Şikayetler</a>
        <a href="/admin?sekme=markalar" className={`-mb-px border-b-2 pb-2 ${tab === "markalar" ? "border-terracotta font-semibold" : "border-transparent text-muted"}`}>Markalar</a>
      </nav>
      <div className="mt-4">{content}</div>
    </main>
  );
}
