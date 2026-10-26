import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-6xl italic text-terracotta">404</p>
      <h1 className="mt-4 font-serif text-2xl">Burada bir şey yok</h1>
      <p className="mt-2 text-muted">Aradığın sayfa kaldırılmış ya da hiç var olmamış olabilir.</p>
      <Link href="/" className="mt-6 rounded-full bg-terracotta px-5 py-2.5 font-semibold text-cream">Akışa dön</Link>
    </main>
  );
}
