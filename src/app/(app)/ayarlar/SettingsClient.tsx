"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMyAccount } from "@/app/actions/account";
import { createClient } from "@/lib/supabase/client";

export function ConsentToggle({ initial }: { initial: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !on;
    if (!next && !confirm("Rızanı geri çekersen kayıtlı tüm ölçülerin ve paylaşımlarındaki ölçü bilgileri kalıcı olarak silinir. Emin misin?")) return;
    setBusy(true);
    const { error } = await createClient().rpc("set_measurement_consent", { p_consent: next });
    setBusy(false);
    if (!error) {
      setOn(next);
      router.refresh();
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
      <div>
        <p>Ölçü verisi için açık rıza</p>
        <p className="mt-0.5 text-xs text-muted">Kapatırsan ölçülerin silinir ve eşleştirmede kullanılmaz.</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={busy}
        onClick={toggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-terracotta" : "bg-placeholder"}`}
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-4 mb-6 w-full py-3 text-sm text-terracotta">
        Hesabımı ve tüm verilerimi sil
      </button>
    );
  }
  return (
    <div className="mt-4 mb-6 rounded-[var(--radius-card)] border border-terracotta bg-card p-4">
      <p className="font-semibold">Hesabını silmek üzeresin</p>
      <p className="mt-1 text-sm text-muted">
        Profilin, ölçülerin, tüm paylaşımların ve fotoğrafların kalıcı olarak silinir. Bu işlem geri alınamaz.
      </p>
      <p className="mt-3 text-sm">Onaylamak için <b>SİL</b> yaz:</p>
      <input value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-cream px-3 py-2" />
      {error && <p className="mt-2 text-sm text-terracotta">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-line py-2.5 text-sm">Vazgeç</button>
        <button
          type="button"
          disabled={text.trim().toLocaleUpperCase("tr-TR") !== "SİL" || pending}
          onClick={() =>
            start(async () => {
              try {
                await deleteMyAccount();
              } catch (e) {
                // redirect() bir istisna fırlatır; gerçek hataları göster
                if (!(e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) setError("Silinemedi, tekrar dener misin?");
                else throw e;
              }
            })
          }
          className="flex-1 rounded-full bg-terracotta py-2.5 text-sm font-semibold text-cream disabled:opacity-40"
        >
          {pending ? "Siliniyor…" : "Kalıcı olarak sil"}
        </button>
      </div>
    </div>
  );
}
