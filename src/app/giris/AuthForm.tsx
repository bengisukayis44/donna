"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "forgot";
const MIN_AGE = 18;
const thisYear = new Date().getFullYear();

export function AuthForm({ initialMode, next }: { initialMode: Mode; next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const supabase = createClient();

  const callback = (to: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}`;

  async function google() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback(next) } });
    if (error) {
      setError("Google ile giriş şu an kullanılamıyor. E-posta ile devam edebilirsin.");
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback("/sifre-yenile") });
        if (error) throw error;
        setInfo("Şifre sıfırlama bağlantısı e-postana gönderildi.");
        return;
      }
      if (mode === "signup") {
        const y = Number(birthYear);
        if (!y || y < 1900 || y > thisYear) return setError("Doğum yılını kontrol eder misin?");
        if (thisYear - y < MIN_AGE) return setError(`Donna'ya ${MIN_AGE} yaşından itibaren katılabilirsin.`);
        if (!kvkk) return setError("Devam etmek için aydınlatma metnini onaylaman gerekiyor.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { birth_year: String(y), kvkk: "true" }, emailRedirectTo: callback("/hosgeldin") },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo("E-postana bir doğrulama bağlantısı gönderdik. Onayladıktan sonra devam edebilirsin.");
          return;
        }
        router.replace("/hosgeldin");
        router.refresh();
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: priv } = await supabase.from("profile_private").select("onboarding_done").eq("user_id", data.user.id).single();
      router.replace(priv?.onboarding_done ? next : "/hosgeldin");
      router.refresh();
    } catch (err) {
      setError(translate((err as Error).message));
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-cream/20 bg-cream/10 px-4 py-3 text-base text-cream placeholder:text-cream/40 focus:border-peach focus:outline-none";

  return (
    <div className="mt-6">
      {mode !== "forgot" && (
        <div className="mb-4 grid grid-cols-2 rounded-full bg-cream/10 p-1 text-sm">
          {(["signup", "login"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null); setInfo(null); }}
              className={`rounded-full py-2 font-semibold ${mode === m ? "bg-cream text-ink" : "text-cream/70"}`}
            >
              {m === "signup" ? "Kayıt ol" : "Giriş yap"}
            </button>
          ))}
        </div>
      )}

      {mode !== "forgot" && (
        <>
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cream py-3 font-semibold text-ink disabled:opacity-60"
          >
            <GoogleMark /> Google ile devam et
          </button>
          <div className="my-4 flex items-center gap-3 text-xs text-cream/40">
            <span className="h-px flex-1 bg-cream/15" /> veya e-posta ile <span className="h-px flex-1 bg-cream/15" />
          </div>
        </>
      )}

      <form onSubmit={submit} className="space-y-3">
        {mode === "forgot" && <p className="text-sm text-cream/80">E-postanı yaz, şifreni sıfırlaman için bir bağlantı gönderelim.</p>}
        <input className={input} type="email" required autoComplete="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
        {mode !== "forgot" && (
          <input
            className={input}
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder={mode === "signup" ? "Şifre (en az 8 karakter)" : "Şifre"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        {mode === "signup" && (
          <>
            <input
              className={input}
              inputMode="numeric"
              pattern="[0-9]{4}"
              required
              placeholder="Doğum yılın (ör. 1998)"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
            <label className="flex items-start gap-3 text-xs leading-relaxed text-cream/80">
              <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#E8A48A]" />
              <span>
                <Link href="/kvkk" target="_blank" className="underline">KVKK Aydınlatma Metni</Link>&apos;ni ve{" "}
                <Link href="/kurallar" target="_blank" className="underline">Topluluk Kuralları</Link>&apos;nı okudum, {MIN_AGE} yaşından büyüğüm.
              </span>
            </label>
          </>
        )}
        {error && <p className="rounded-lg bg-terracotta/30 px-3 py-2 text-sm">{error}</p>}
        {info && <p className="rounded-lg bg-cream/15 px-3 py-2 text-sm">{info}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-terracotta py-3 font-semibold text-cream disabled:opacity-60">
          {busy ? "Bir saniye…" : mode === "signup" ? "Kayıt ol" : mode === "login" ? "Giriş yap" : "Bağlantı gönder"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => { setMode(mode === "forgot" ? "login" : "forgot"); setError(null); setInfo(null); }}
        className="mt-3 w-full text-center text-sm text-cream/60"
      >
        {mode === "forgot" ? "← Girişe dön" : mode === "login" ? "Şifremi unuttum" : ""}
      </button>
    </div>
  );
}

function translate(msg: string) {
  if (/invalid login credentials/i.test(msg)) return "E-posta ya da şifre hatalı.";
  if (/already registered|already exists/i.test(msg)) return "Bu e-postayla zaten bir hesap var. Giriş yapmayı dene.";
  if (/password/i.test(msg) && /characters|weak|short/i.test(msg)) return "Şifre en az 8 karakter olmalı.";
  if (/rate limit|too many/i.test(msg)) return "Çok fazla deneme yapıldı, birkaç dakika sonra tekrar dene.";
  if (/database error/i.test(msg)) return "Kayıt tamamlanamadı. Yaş sınırını ve bilgilerini kontrol et.";
  if (/email not confirmed/i.test(msg)) return "E-postanı henüz doğrulamamışsın; gelen kutunu kontrol et.";
  return "Bir şeyler ters gitti, tekrar dener misin?";
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}
