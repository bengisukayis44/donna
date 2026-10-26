import { Logo } from "@/components/Logo";

export default function StaticLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 py-6">
      <Logo />
      <article className="mt-6 space-y-4 text-[15px] leading-relaxed [&_h1]:font-serif [&_h1]:text-3xl [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </article>
    </div>
  );
}
