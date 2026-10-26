"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError("Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir; tekrar iste.");
    router.replace("/");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <h1 className="font-serif text-3xl">Yeni şifre</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="En az 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-line bg-card px-4 py-3 text-base"
        />
        {error && <p className="text-sm text-terracotta">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-terracotta py-3 font-semibold text-cream">Kaydet</button>
      </form>
    </main>
  );
}
