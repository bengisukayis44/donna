import Link from "next/link";
import { Callout } from "@/components/Callout";
import { Logo } from "@/components/Logo";
import { PostGrid } from "@/components/PostGrid";
import { createClient } from "@/lib/supabase/server";
import { toRpcParams } from "@/lib/domain/posts";
import type { PostCardData, SearchParams } from "@/lib/domain/types";
import { getMyMeasurements, getViewer } from "@/lib/viewer";

export default async function FeedPage(props: PageProps<"/">) {
  const { tab } = await props.searchParams;
  const near = tab === "yakin";
  const viewer = await getViewer();

  let content: React.ReactNode;
  if (near && !viewer) {
    content = (
      <Callout
        title="Sana benzeyen vücutları gör"
        text="Ölçülerine yakın kişilerin ne giydiğini ve hangi bedeni aldığını görmek için ücretsiz kaydol."
        href="/giris?mod=kayit&next=/?tab=yakin"
        cta="Kayıt ol"
      />
    );
  } else if (near && !hasAnyMeasurement(await getMyMeasurements())) {
    content = (
      <Callout
        title="Ölçülerini ekle, sana benzeyenleri görelim"
        text="Boy ve kilo bile yeterli. Ölçülerin istediğin kadar gizli kalır."
        href="/hosgeldin?adim=4"
        cta="Ölçülerimi ekle"
      />
    );
  } else {
    const params: SearchParams = near ? { nearMe: true, minScore: 0, sort: "near" } : { sort: "new" };
    const supabase = await createClient();
    const { data } = await supabase.rpc("search_posts", toRpcParams(params));
    content = (
      <PostGrid
        initial={(data ?? []) as PostCardData[]}
        params={params}
        empty={
          <Callout
            title={near ? "Henüz sana yakın paylaşım yok" : "Henüz paylaşım yok"}
            text="İlk kombini sen paylaş; senin gibi biri tam bunu arıyor olabilir."
            href={viewer ? "/yeni" : "/giris?mod=kayit"}
            cta="Kombinini paylaş"
          />
        }
      />
    );
  }

  return (
    <main>
      <header className="sticky top-0 z-30 bg-cream/95 px-4 pt-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Logo />
          {!viewer && (
            <Link href="/giris" className="rounded-full border border-ink px-3 py-1 text-sm">Giriş yap</Link>
          )}
        </div>
        <div className="mt-2 flex gap-6 border-b border-line text-sm">
          <TabLink href="/" active={!near}>Keşfet</TabLink>
          <TabLink href="/?tab=yakin" active={near}>Bana yakın</TabLink>
        </div>
      </header>
      <div className="px-4 pt-4">{content}</div>
    </main>
  );
}

function hasAnyMeasurement(m: Awaited<ReturnType<typeof getMyMeasurements>>) {
  return !!m && [m.height_cm, m.weight_kg, m.bust_cm, m.waist_cm, m.hip_cm, m.inseam_cm].filter((v) => v != null).length >= 2;
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`-mb-px border-b-2 pb-2 ${active ? "border-terracotta font-semibold text-ink" : "border-transparent text-muted"}`}
    >
      {children}
    </Link>
  );
}
