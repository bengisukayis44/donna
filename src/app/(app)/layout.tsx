import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { getViewer, mandatoryStepsDone } from "@/lib/viewer";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const viewer = await getViewer();
  if (viewer && !mandatoryStepsDone(viewer)) redirect("/hosgeldin");
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-cream pb-24">
      {children}
      <BottomNav username={viewer?.profile.username ?? null} />
    </div>
  );
}
