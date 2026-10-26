import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { CompletionCard } from "@/components/CompletionCard";
import { GearIcon } from "@/components/Icons";
import { MeasurementChips } from "@/components/MeasurementChips";
import { PostGrid } from "@/components/PostGrid";
import { profileCompletion } from "@/lib/domain/measurements";
import { proximityLabel, toRpcParams } from "@/lib/domain/posts";
import type { BodyMeasurements, PostCardData, PublicProfile, SearchParams } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/server";
import { getMyMeasurements, getViewer, type Viewer } from "@/lib/viewer";

export async function generateMetadata(props: PageProps<"/u/[username]">) {
  const { username } = await props.params;
  return { title: `@${decodeURIComponent(username)}` };
}

export default async function ProfilePage(props: PageProps<"/u/[username]">) {
  const { username: raw } = await props.params;
  const { sekme } = await props.searchParams;
  const username = decodeURIComponent(raw).toLowerCase();
  const supabase = await createClient();
  const [{ data }, viewer] = await Promise.all([supabase.rpc("get_profile", { p_username: username }), getViewer()]);
  const profile = data as PublicProfile | null;
  if (!profile) notFound();

  const savedTab = profile.is_me && sekme === "kaydedilenler";
  const params: SearchParams = savedTab ? { saved: true } : { username };
  const { data: posts } = await supabase.rpc("search_posts", toRpcParams(params));
  const near = proximityLabel(profile.proximity);

  let completion: React.ReactNode = null;
  if (profile.is_me && viewer) {
    const mine = await getMyMeasurements();
    const percent = profileCompletion(viewer.profile, mine);
    const hiddenUntil = viewer.priv.completion_card_hidden_until;
    if (percent < 100 && (!hiddenUntil || new Date(hiddenUntil) < new Date())) {
      completion = <CompletionCard userId={viewer.id} percent={percent} href={nextStepHref(viewer, mine)} />;
    }
  }

  const { data: warnings } = profile.is_me
    ? await supabase.from("user_warnings").select("id, message, created_at").is("seen_at", null)
    : { data: null };

  return (
    <main className="px-4 pt-4">
      <header className="flex items-start gap-4">
        <Avatar path={profile.avatar_url} name={profile.display_name ?? profile.username} size={76} />
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="truncate font-serif text-2xl leading-tight">{profile.display_name ?? profile.username}</h1>
          <p className="text-sm text-muted">@{profile.username} · {profile.post_count} paylaşım</p>
          {near && <span className="mt-1.5 inline-block rounded-full bg-terracotta/10 px-2.5 py-0.5 text-xs font-semibold text-terracotta">{near}</span>}
        </div>
        {profile.is_me && (
          <Link href="/ayarlar" className="rounded-full p-2 text-muted" aria-label="Ayarlar"><GearIcon className="h-6 w-6" /></Link>
        )}
      </header>
      {profile.bio && <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">{profile.bio}</p>}

      {warnings?.map((w) => (
        <div key={w.id} className="mt-4 rounded-[var(--radius-card)] border border-terracotta bg-terracotta/5 p-3 text-sm">
          <p className="eyebrow mb-1">Ekipten uyarı</p>
          {w.message}
        </div>
      ))}

      {completion && <div className="mt-4">{completion}</div>}

      <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-card p-4">
        <p className="eyebrow mb-2">Ölçüler</p>
        <MeasurementChips
          m={profile.measurements}
          extra={[
            ["Genelde üst", profile.usual_sizes.top],
            ["Genelde alt", profile.usual_sizes.bottom],
          ]}
        />
        {profile.is_me && (
          <Link href="/ayarlar/profil" className="mt-3 inline-block text-sm font-semibold text-terracotta">Profili düzenle →</Link>
        )}
      </section>

      {profile.is_me && (
        <div className="mt-5 flex gap-6 border-b border-line text-sm">
          <Link href={`/u/${profile.username}`} className={`-mb-px border-b-2 pb-2 ${!savedTab ? "border-terracotta font-semibold" : "border-transparent text-muted"}`}>Paylaşımlarım</Link>
          <Link href={`/u/${profile.username}?sekme=kaydedilenler`} className={`-mb-px border-b-2 pb-2 ${savedTab ? "border-terracotta font-semibold" : "border-transparent text-muted"}`}>Kaydettiklerim</Link>
        </div>
      )}

      <div className="mt-4">
        <PostGrid
          initial={(posts ?? []) as PostCardData[]}
          params={params}
          empty={
            <p className="py-10 text-center text-sm text-muted">
              {savedTab ? "Kaydettiğin paylaşımlar burada görünecek." : profile.is_me ? "İlk kombinini paylaşmaya ne dersin?" : "Henüz paylaşım yok."}
            </p>
          }
        />
      </div>
    </main>
  );
}

// Kart dokununca ilk eksik adıma götürür
function nextStepHref(viewer: Viewer, m: BodyMeasurements | null) {
  if (!viewer.priv.measurement_consent_at) return "/hosgeldin?adim=4";
  if (m?.height_cm == null || m?.weight_kg == null) return "/hosgeldin?adim=5";
  if ([m.bust_cm, m.waist_cm, m.hip_cm, m.inseam_cm].some((v) => v == null)) return "/hosgeldin?adim=6";
  if (!m.usual_top_size || !m.usual_bottom_size) return "/hosgeldin?adim=7";
  return "/ayarlar/profil";
}
