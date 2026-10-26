import { redirect } from "next/navigation";
import { BackButton } from "@/components/BackButton";
import { getMyMeasurements, getViewer } from "@/lib/viewer";
import { ProfileEditor } from "./ProfileEditor";

export const metadata = { title: "Profili düzenle" };

export default async function EditProfilePage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/giris?next=/ayarlar/profil");
  const measurements = await getMyMeasurements();
  return (
    <main className="px-4 pt-3">
      <header className="flex items-center gap-3">
        <BackButton fallback="/ayarlar" />
        <h1 className="font-serif text-2xl">Profili düzenle</h1>
      </header>
      <ProfileEditor
        userId={viewer.id}
        profile={viewer.profile}
        consent={!!viewer.priv.measurement_consent_at}
        measurements={measurements}
      />
    </main>
  );
}
