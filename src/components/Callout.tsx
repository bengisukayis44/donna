import Link from "next/link";

export function Callout({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-card p-6 text-center">
      <h2 className="font-serif text-xl">{title}</h2>
      <p className="mt-2 text-sm text-muted">{text}</p>
      <Link href={href} className="mt-4 inline-block rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream">
        {cta}
      </Link>
    </div>
  );
}
