"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "./Icons";

export function BackButton({ className = "", fallback = "/" }: { className?: string; fallback?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Geri"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-ink shadow-sm backdrop-blur ${className}`}
    >
      <BackIcon className="h-5 w-5" />
    </button>
  );
}
