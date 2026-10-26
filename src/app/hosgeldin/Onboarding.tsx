"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteMyAccount } from "@/app/actions/account";
import { Avatar } from "@/components/Avatar";
import { BodyDiagram, ChipSelect, NumberField, VisibilitySelect } from "@/components/forms";
import { BackIcon } from "@/components/Icons";
import {
  BOTTOM_SIZES,
  MEASUREMENT_META,
  SHOE_SIZES,
  TOP_SIZES,
  VISIBILITY_LABELS,
} from "@/lib/domain/measurements";
import type { BodyMeasurements, MeasurementKey, Profile, ProfilePrivate, Visibility } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";

const TOTAL = 9;
const MIN_AGE = 18;
const VIS_KEYS: MeasurementKey[] = ["height_cm", "weight_kg", "bust_cm", "waist_cm", "hip_cm", "inseam_cm", "shoe_size"];

type M = Omit<BodyMeasurements, "user_id">;
const emptyM: M = {
  height_cm: null, weight_kg: null, bust_cm: null, waist_cm: null, hip_cm: null, inseam_cm: null,
  shoe_size: null, usual_top_size: null, usual_bottom_size: null, body_type: null, visibility: {},
};

export function Onboarding({
  userId,
  startStep,
  profile,
  priv,
  measurements,
  returnTo,
}: {
  userId: string;
  startStep: number;
  profile: Profile;
  priv: ProfilePrivate;
  measurements: BodyMeasurements | null;
  returnTo: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(startStep);
  const [history, setHistory] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(!!priv.measurement_consent_at);

  // Adım verileri
  const [birthYear, setBirthYear] = useState(priv.birth_year ? String(priv.birth_year) : "");
  const [kvkk, setKvkk] = useState(false);
  const [username, setUsername] = useState(profile.username.startsWith("u_") ? "" : profile.username);
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [avatar, setAvatar] = useState(profile.avatar_url);
  const [m, setM] = useState<M>(measurements ? { ...emptyM, ...measurements } : emptyM);

  const go = (to: number) => {
    setError(null);
    setHistory((h) => [...h, step]);
    setStep(to);
    window.scrollTo(0, 0);
  };
  const back = () => {
    setError(null);
    setHistory((h) => {
      const prev = h.at(-1);
      if (prev) setStep(prev);
      return h.slice(0, -1);
    });
  };

  // Her adımın cevabı anında kaydedilir; onboarding_step bir sonraki adımı tutar
  async function saveStep(next: number) {
    await supabase.from("profile_private").update({ onboarding_step: next }).eq("user_id", userId);
  }

  async function run(fn: () => Promise<number | void>) {
    setBusy(true);
    setError(null);
    try {
      const next = await fn();
      if (typeof next === "number") {
        await saveStep(next);
        go(next);
      }
    } catch (e) {
      setError((e as Error).message || "Kaydedilemedi, tekrar dener misin?");
    } finally {
      setBusy(false);
    }
  }

  async function saveMeasurements(patch: Partial<M>) {
    const merged = { ...m, ...patch };
    setM(merged);
    const { error } = await supabase
      .from("body_measurements")
      .upsert({ user_id: userId, ...merged, updated_at: new Date().toISOString() });
    if (error) throw new Error("Ölçüler kaydedilemedi. Değerleri kontrol eder misin?");
  }

  const skipBtn = (to: number) => (
    <button type="button" onClick={() => run(async () => to)} disabled={busy} className="w-full py-3 text-sm font-medium text-muted">
      Şimdilik atla
    </button>
  );

  const progress = Math.round((Math.min(step, TOTAL) / TOTAL) * 100);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-cream px-6 pb-8 pt-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={back}
          disabled={history.length === 0}
          className="-ml-2 rounded-full p-2 text-ink disabled:invisible"
          aria-label="Geri"
        >
          <BackIcon className="h-5 w-5" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
          <div className="h-full rounded-full bg-terracotta transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="w-9 text-right text-xs tabular-nums text-muted">{Math.min(step, TOTAL)}/{TOTAL}</span>
      </div>

      <div key={step} className="animate-step flex flex-1 flex-col pt-8">
        {step === 1 && (
          <Step eyebrow="Hesap" title="Önce küçük bir kontrol" why={`Donna'da vücut ölçüsü ve fotoğraf paylaşıldığı için ${MIN_AGE} yaş sınırı var.`}>
            <label className="block text-sm text-muted">Doğum yılın</label>
            <input
              inputMode="numeric"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="1998"
              className="mt-2 w-full border-b-2 border-line bg-transparent pb-2 font-serif text-5xl outline-none focus:border-terracotta"
            />
            <label className="mt-8 flex items-start gap-3 text-sm leading-relaxed">
              <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#A8432C]" />
              <span>
                <Link href="/kvkk" target="_blank" className="underline">KVKK Aydınlatma Metni</Link>&apos;ni ve{" "}
                <Link href="/kurallar" target="_blank" className="underline">Topluluk Kuralları</Link>&apos;nı okudum.
              </span>
            </label>
            <Footer>
              <Primary
                busy={busy}
                onClick={() =>
                  run(async () => {
                    const y = Number(birthYear);
                    const now = new Date().getFullYear();
                    if (!y || y < 1900 || y > now) throw new Error("Doğum yılını kontrol eder misin?");
                    if (!kvkk) throw new Error("Devam etmek için aydınlatma metnini onaylaman gerekiyor.");
                    if (now - y < MIN_AGE) {
                      setStep(-1);
                      return;
                    }
                    const { error } = await supabase.rpc("accept_terms", { p_birth_year: y, p_kvkk: true });
                    if (error) throw new Error("Kaydedilemedi, tekrar dener misin?");
                    return 2;
                  })
                }
              >
                Devam
              </Primary>
            </Footer>
          </Step>
        )}

        {step === -1 && <Underage />}

        {step === 2 && (
          <UsernameStep
            username={username}
            setUsername={setUsername}
            displayName={displayName}
            setDisplayName={setDisplayName}
            busy={busy}
            onSubmit={() =>
              run(async () => {
                const { error } = await supabase
                  .from("profiles")
                  .update({ username, display_name: displayName.trim() || null })
                  .eq("id", userId);
                if (error) throw new Error(error.code === "23505" ? "Bu kullanıcı adı az önce alındı, başka bir tane dener misin?" : "Kaydedilemedi.");
                return 3;
              })
            }
          />
        )}

        {step === 3 && (
          <Step eyebrow="Profil fotoğrafı" title="Bir de yüzünü görelim" why="Profil fotoğrafı, paylaşımlarının kime ait olduğunu tanımayı kolaylaştırır. Zorunlu değil.">
            <AvatarPicker
              current={avatar}
              name={displayName || username || "?"}
              onPick={(file) =>
                run(async () => {
                  const path = await uploadImage(supabase, "avatars", userId, file, { prefix: "avatar-" });
                  const { error } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", userId);
                  if (error) throw new Error("Fotoğraf kaydedilemedi.");
                  setAvatar(path);
                })
              }
              busy={busy}
            />
            <Footer>
              <Primary busy={busy} onClick={() => run(async () => 4)} disabled={!avatar}>Devam</Primary>
              {skipBtn(4)}
            </Footer>
          </Step>
        )}

        {step === 4 && (
          <Step eyebrow="Ölçüler" title="Ölçülerin neden önemli?" why="">
            <ul className="space-y-4 text-[15px] leading-relaxed">
              <li><b>Sana benzeyenleri buluruz.</b> Boyu, kilosu, ölçüleri sana yakın kişilerin aldığı bedeni görürsün.</li>
              <li><b>Kontrol sende.</b> Her ölçüyü herkese açık, aralık olarak (ör. 60–65 kg) ya da tamamen gizli tutabilirsin. Gizli ölçüler sadece eşleştirmede kullanılır, kimse göremez.</li>
              <li><b>İstediğin zaman silebilirsin.</b> Rızanı geri çektiğinde ölçülerin tamamen silinir.</li>
            </ul>
            <label className="mt-8 flex items-start gap-3 rounded-[var(--radius-card)] border border-line bg-card p-4 text-sm leading-relaxed">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#A8432C]" />
              <span>
                Vücut ölçülerimin, bana benzeyen kullanıcıları eşleştirmek amacıyla işlenmesine{" "}
                <Link href="/kvkk#acik-riza" target="_blank" className="underline">açık rıza</Link> veriyorum.
              </span>
            </label>
            <Footer>
              <Primary
                busy={busy}
                disabled={!consent}
                onClick={() =>
                  run(async () => {
                    const { error } = await supabase.rpc("set_measurement_consent", { p_consent: true });
                    if (error) throw new Error("Kaydedilemedi.");
                    return 5;
                  })
                }
              >
                Onaylıyorum, devam
              </Primary>
              {/* Rıza yoksa ölçü adımları (5–8) atlanır */}
              {skipBtn(9)}
            </Footer>
          </Step>
        )}

        {step === 5 && (
          <Step eyebrow="Boy ve kilo" title="Boyun ve kilon" why="Sana benzeyen insanları bulmak için en önemli iki bilgi.">
            <div className="space-y-8">
              <div>
                <p className="mb-2 text-sm text-muted">Boy</p>
                <NumberField big field="height_cm" value={m.height_cm} onChange={(v) => setM({ ...m, height_cm: v })} />
              </div>
              <div>
                <p className="mb-2 text-sm text-muted">Kilo</p>
                <NumberField big field="weight_kg" value={m.weight_kg} onChange={(v) => setM({ ...m, weight_kg: v })} />
              </div>
            </div>
            <Footer>
              <Primary busy={busy} disabled={m.height_cm == null && m.weight_kg == null} onClick={() => run(async () => { await saveMeasurements({}); return 6; })}>Devam</Primary>
              {skipBtn(6)}
            </Footer>
          </Step>
        )}

        {step === 6 && (
          <Step eyebrow="Ölçüler" title="Biraz daha detay" why="Pantolonda bel ve kalça, üstte göğüs belirleyici. Bilmediğini boş bırak; tek tek atlanabilir.">
            <div className="space-y-6">
              {(["bust_cm", "waist_cm", "hip_cm", "inseam_cm"] as const).map((f) => (
                <div key={f} className="flex gap-3 rounded-[var(--radius-card)] border border-line bg-card p-3">
                  <BodyDiagram field={f} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{MEASUREMENT_META[f].label}</p>
                    <p className="mb-2 text-xs leading-snug text-muted">{MEASUREMENT_META[f].how}</p>
                    <NumberField field={f} value={m[f]} onChange={(v) => setM({ ...m, [f]: v })} />
                  </div>
                </div>
              ))}
            </div>
            <Footer>
              <Primary busy={busy} onClick={() => run(async () => { await saveMeasurements({}); return 7; })}>Devam</Primary>
              {skipBtn(7)}
            </Footer>
          </Step>
        )}

        {step === 7 && (
          <Step eyebrow="Bedenler" title="Genelde hangi bedeni giyersin?" why="Markadan markaya değişir, biliyoruz. Çoğunlukla aldığın beden yeterli.">
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-semibold">Üst</p>
                <ChipSelect options={TOP_SIZES} value={m.usual_top_size} onChange={(v) => setM({ ...m, usual_top_size: v })} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Alt</p>
                <ChipSelect options={BOTTOM_SIZES} value={m.usual_bottom_size} onChange={(v) => setM({ ...m, usual_bottom_size: v })} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Ayakkabı</p>
                <ChipSelect
                  options={SHOE_SIZES}
                  value={m.shoe_size != null ? String(m.shoe_size) : null}
                  onChange={(v) => setM({ ...m, shoe_size: v ? Number(v) : null })}
                />
              </div>
            </div>
            <Footer>
              <Primary busy={busy} onClick={() => run(async () => { await saveMeasurements({}); return 8; })}>Devam</Primary>
              {skipBtn(8)}
            </Footer>
          </Step>
        )}

        {step === 8 && (
          <PrivacyStep
            visibility={m.visibility}
            filled={VIS_KEYS.filter((k) => m[k] != null)}
            busy={busy}
            onSubmit={(visibility) => run(async () => { await saveMeasurements({ visibility }); return 9; })}
            skip={skipBtn(9)}
          />
        )}

        {step === 9 && <Done onMount={() => supabase.from("profile_private").update({ onboarding_done: true, onboarding_step: 9 }).eq("user_id", userId)} returnTo={returnTo} onGo={(href) => { router.replace(href); router.refresh(); }} />}

        {error && <p className="mt-4 rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{error}</p>}
      </div>
    </main>
  );
}

function Step({ eyebrow, title, why, children }: { eyebrow: string; title: string; why: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-[2rem] leading-tight">{title}</h1>
      {why && <p className="mt-2 text-[15px] text-muted">{why}</p>}
      <div className="mt-8 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return <div className="mt-auto space-y-1 pt-10">{children}</div>;
}

function Primary({ children, busy, disabled, onClick }: { children: React.ReactNode; busy: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="w-full rounded-full bg-terracotta py-4 text-base font-semibold text-cream transition-opacity disabled:opacity-40"
    >
      {busy ? "Kaydediliyor…" : children}
    </button>
  );
}

function UsernameStep({
  username, setUsername, displayName, setDisplayName, busy, onSubmit,
}: {
  username: string; setUsername: (v: string) => void; displayName: string; setDisplayName: (v: string) => void;
  busy: boolean; onSubmit: () => void;
}) {
  const [check, setCheck] = useState<{ name: string; available: boolean } | null>(null);
  const valid = /^[a-z0-9_.]{3,30}$/.test(username);

  useEffect(() => {
    if (!valid) return;
    const t = setTimeout(async () => {
      const { data } = await createClient().rpc("username_available", { p_username: username });
      setCheck({ name: username, available: !!data });
    }, 350);
    return () => clearTimeout(t);
  }, [username, valid]);

  const status = !username
    ? "idle"
    : !valid
      ? "invalid"
      : check?.name !== username
        ? "checking"
        : check.available
          ? "ok"
          : "taken";

  const hint = {
    idle: "Küçük harf, rakam, nokta ve alt çizgi.",
    checking: "Kontrol ediliyor…",
    ok: "Müsait ✓",
    taken: "Bu kullanıcı adı alınmış.",
    invalid: "3–30 karakter; küçük harf, rakam, . ve _ kullanılabilir.",
  }[status];

  return (
    <Step eyebrow="Seni tanıyalım" title="Sana ne diyelim?" why="Kullanıcı adın profil linkinde görünür; görünen adın paylaşımlarında.">
      <label className="text-sm text-muted">Kullanıcı adı</label>
      <div className="mt-1 flex items-baseline border-b-2 border-line focus-within:border-terracotta">
        <span className="font-serif text-3xl text-muted">@</span>
        <input
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/\s/g, ""))}
          className="w-full bg-transparent pb-2 font-serif text-3xl outline-none"
          placeholder="kullaniciadi"
        />
      </div>
      <p className={`mt-1 text-xs ${status === "ok" ? "text-green-700" : status === "taken" || status === "invalid" ? "text-terracotta" : "text-muted"}`}>{hint}</p>

      <label className="mt-8 text-sm text-muted">Görünen ad</label>
      <input
        value={displayName}
        maxLength={50}
        onChange={(e) => setDisplayName(e.target.value)}
        className="mt-1 w-full border-b-2 border-line bg-transparent pb-2 font-serif text-3xl outline-none focus:border-terracotta"
        placeholder="Adın"
      />
      <Footer>
        <Primary busy={busy} disabled={status !== "ok" || !displayName.trim()} onClick={onSubmit}>Devam</Primary>
      </Footer>
    </Step>
  );
}

function AvatarPicker({ current, name, onPick, busy }: { current: string | null; name: string; onPick: (f: File) => void; busy: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col items-center gap-4 pt-4">
      <button type="button" onClick={() => input.current?.click()} disabled={busy} className="rounded-full ring-4 ring-sand">
        <Avatar path={current} name={name} size={144} />
      </button>
      <button type="button" onClick={() => input.current?.click()} disabled={busy} className="rounded-full border border-ink px-5 py-2 text-sm font-semibold">
        {busy ? "Yükleniyor…" : current ? "Değiştir" : "Fotoğraf seç"}
      </button>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
    </div>
  );
}

function PrivacyStep({
  visibility, filled, busy, onSubmit, skip,
}: {
  visibility: Partial<Record<string, Visibility>>;
  filled: MeasurementKey[];
  busy: boolean;
  onSubmit: (v: Record<string, Visibility>) => void;
  skip: React.ReactNode;
}) {
  const keys = filled.length ? filled : (["height_cm", "weight_kg"] as MeasurementKey[]);
  const [vis, setVis] = useState<Record<string, Visibility>>(
    Object.fromEntries(keys.map((k) => [k, visibility[k] ?? "range"])),
  );
  const setAll = (v: Visibility) => setVis(Object.fromEntries(keys.map((k) => [k, v])));
  return (
    <Step eyebrow="Gizlilik" title="Ölçülerin nasıl görünsün?" why="Varsayılan: aralık olarak (ör. 60–65 kg). Ne seçersen seç, eşleştirme yine çalışır.">
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(VISIBILITY_LABELS) as Visibility[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAll(v)}
            className={`rounded-xl border p-3 text-left text-xs leading-snug ${keys.every((k) => vis[k] === v) ? "border-terracotta bg-terracotta/5" : "border-line bg-card"}`}
          >
            <span className="block text-sm font-semibold">{v === "public" ? "Açık" : v === "range" ? "Aralık" : "Gizli"}</span>
            {VISIBILITY_LABELS[v]}
          </button>
        ))}
      </div>
      <div className="mt-6 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card">
        {keys.map((k) => (
          <div key={k} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <span className="text-sm">{MEASUREMENT_META[k].label}</span>
            <div className="w-48"><VisibilitySelect value={vis[k]} onChange={(v) => setVis({ ...vis, [k]: v })} /></div>
          </div>
        ))}
      </div>
      <Footer>
        <Primary busy={busy} onClick={() => onSubmit(vis)}>Kaydet</Primary>
        {skip}
      </Footer>
    </Step>
  );
}

function Done({ onMount, returnTo, onGo }: { onMount: () => unknown; returnTo: string | null; onGo: (href: string) => void }) {
  useEffect(() => {
    onMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="animate-pop text-7xl">🎉</div>
      <h1 className="mt-6 font-serif text-4xl">Hazırsın!</h1>
      <p className="mt-3 max-w-xs text-muted">Profilin oluştu. Eksik kalan ne varsa istediğin zaman profilinden tamamlayabilirsin.</p>
      <div className="mt-auto w-full space-y-2 pt-10">
        <button type="button" onClick={() => onGo("/yeni")} className="w-full rounded-full bg-terracotta py-4 font-semibold text-cream">
          İlk kombinini paylaş
        </button>
        <button type="button" onClick={() => onGo(returnTo ?? "/")} className="w-full rounded-full border border-ink py-4 font-semibold">
          Keşfetmeye başla
        </button>
      </div>
    </div>
  );
}

function Underage() {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="font-serif text-3xl">Şimdilik erken</h1>
      <p className="mt-3 max-w-xs text-muted">
        Donna&apos;ya {MIN_AGE} yaşından itibaren katılabilirsin. Hesabın ve girdiğin bilgiler silinecek.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => deleteMyAccount("underage"))}
        className="mt-8 rounded-full bg-ink px-6 py-3 font-semibold text-cream"
      >
        {pending ? "Siliniyor…" : "Tamam"}
      </button>
    </div>
  );
}
