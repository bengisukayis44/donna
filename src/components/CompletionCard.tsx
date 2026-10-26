"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CloseIcon } from "./Icons";

// "Profilin %X tamam" kartı. Kapatılınca 14 gün gösterilmez.
export function CompletionCard({ userId, percent, href }: { userId: string; percent: number; href: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  async function dismiss() {
    setHidden(true);
    const until = new Date(Date.now() + 14 * 86400_000).toISOString();
    await createClient().from("profile_private").update({ completion_card_hidden_until: until }).eq("user_id", userId);
  }
  return (
    <div className="relative rounded-[var(--radius-card)] bg-ink p-4 text-cream">
      <button type="button" onClick={dismiss} className="absolute right-3 top-3 text-cream/60" aria-label="Kapat">
        <CloseIcon className="h-4 w-4" />
      </button>
      <p className="font-serif text-lg">Profilin %{percent} tamam</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream/15">
        <div className="h-full rounded-full bg-peach" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-sm text-cream/70">Birkaç bilgi daha ekle, sana benzeyenleri daha iyi bulalım.</p>
      <Link href={href} className="mt-3 inline-block rounded-full bg-peach px-4 py-1.5 text-sm font-semibold text-ink">Tamamla</Link>
    </div>
  );
}
