import { redirect } from "next/navigation";
import { getMyMeasurements, getViewer } from "@/lib/viewer";
import { Onboarding } from "./Onboarding";

export const metadata = { title: "Hoş geldin" };

export default async function WelcomePage(props: PageProps<"/hosgeldin">) {
  const { adim } = await props.searchParams;
  const viewer = await getViewer();
  if (!viewer) redirect("/giris?mod=kayit");
  const measurements = await getMyMeasurements();

  let start = Number(adim) || (viewer.priv.onboarding_done ? 9 : viewer.priv.onboarding_step);
  // Zorunlu adımlar bitmeden ileri atlanamaz
  if (!viewer.priv.kvkk_accepted_at || !viewer.priv.birth_year) start = 1;
  else if (start < 2) start = 2;
  // Ölçü adımlarına doğrudan gelindiyse ve rıza varsa rıza ekranını geç
  if (start === 4 && Number(adim) === 4 && viewer.priv.measurement_consent_at) start = 5;

  return (
    <Onboarding
      userId={viewer.id}
      startStep={Math.min(Math.max(start, 1), 9)}
      profile={viewer.profile}
      priv={viewer.priv}
      measurements={measurements}
      returnTo={adim ? "/" : null}
    />
  );
}
