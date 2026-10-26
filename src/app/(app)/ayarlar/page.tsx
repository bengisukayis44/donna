import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/account";
import { BackButton } from "@/components/BackButton";
import { getViewer } from "@/lib/viewer";
import { ConsentToggle, DeleteAccount } from "./SettingsClient";

export const metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/giris?next=/ayarlar");

  const row = "flex items-center justify-between px-4 py-3.5";
  return (
    <main className="px-4 pt-3">
      <header className="flex items-center gap-3">
        <BackButton fallback={`/u/${viewer.profile.username}`} />
        <h1 className="font-serif text-2xl">Ayarlar</h1>
      </header>

      <Section title="Hesap">
        <Link href="/ayarlar/profil" className={row}>Profil ve ölçüler <span className="text-muted">→</span></Link>
        <div className={row}><span>E-posta</span><span className="truncate pl-4 text-sm text-muted">{viewer.email}</span></div>
        <Link href="/giris?mod=sifre" className={row}>Şifre değiştir <span className="text-muted">→</span></Link>
      </Section>

      <Section title="Gizlilik">
        <Link href="/ayarlar/profil#gizlilik" className={row}>Ölçülerin kimlere nasıl görünsün <span className="text-muted">→</span></Link>
        <ConsentToggle initial={!!viewer.priv.measurement_consent_at} />
      </Section>

      <Section title="Bildirimler">
        <p className="px-4 py-3.5 text-sm text-muted">Şimdilik sadece hesabınla ilgili e-postalar (şifre sıfırlama gibi) gönderiyoruz.</p>
      </Section>

      <Section title="Donna">
        <Link href="/kurallar" className={row}>Topluluk kuralları <span className="text-muted">→</span></Link>
        <Link href="/kvkk" className={row}>KVKK aydınlatma metni <span className="text-muted">→</span></Link>
        {viewer.isAdmin && <Link href="/admin" className={row}>Admin paneli <span className="text-muted">→</span></Link>}
      </Section>

      <form action={signOut} className="mt-6">
        <button className="w-full rounded-full border border-ink py-3 font-semibold">Çıkış yap</button>
      </form>

      <DeleteAccount />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="eyebrow mb-2 px-1">{title}</h2>
      <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card">{children}</div>
    </section>
  );
}
