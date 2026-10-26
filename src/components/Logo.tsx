import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-serif text-2xl italic tracking-tight text-ink ${className}`}>
      donna<span className="text-terracotta">.</span>
    </Link>
  );
}
