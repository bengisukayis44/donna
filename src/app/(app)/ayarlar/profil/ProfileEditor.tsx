"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { BodyDiagram, ChipSelect, NumberField, VisibilitySelect } from "@/components/forms";
import { BODY_TYPES, BOTTOM_SIZES, MEASUREMENT_META, TOP_SIZES } from "@/lib/domain/measurements";
import { MEASUREMENT_KEYS, type BodyMeasurements, type Profile, type Visibility } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";

type M = Omit<BodyMeasurements, "user_id">;
const emptyM: M = {
  height_cm: null, weight_kg: null, bust_cm: null, waist_cm: null, hip_cm: null, inseam_cm: null,
  shoe_size: null, usual_top_size: null, usual_bottom_size: null, body_type: null, visibility: {},
};

export function ProfileEditor({
  userId, profile, consent: initialConsent, measurements,
}: {
  userId: string; profile: Profile; consent: boolean; measurements: BodyMeasurements | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [p, setP] = useState(profile);
  const [m, setM] = useState<M>(measurements ? { ...emptyM, ...measurements } : emptyM);
  const [consent, setConsent] = useState(initialConsent);
  const [consentBox, setConsentBox] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const field = "w-full rounded-xl border border-line bg-card px-3 py-2.5 text-[15px]";
  const vis = (k: string): Visibility => (m.visibility as Record<string, Visibility>)[k] ?? (k === "body_type" ? "hidden" : "range");

  async function save() {
    setBusy(true);
    setMsg(null);
    const { error: pErr } = await supabase
      .from("profiles")
      .update({ username: p.username, display_name: p.display_name?.trim() || null, bio: p.bio?.trim() || null })
      .eq("id", userId);
    if (pErr) {
      setBusy(false);
      return setMsg({ ok: false, text: pErr.code === "23505" ? "Bu kullanıcı adı alınmış." : "Kullanıcı adı 3–30 karakter olmalı; küçük harf, rakam, . ve _." });
    }
    if (consent) {
      const { error } = await supabase.from("body_measurements").upsert({ user_id: userId, ...m, updated_at: new Date().toISOString() });
      if (error) {
        setBusy(false);
        return setMsg({ ok: false, text: "Ölçüler kaydedilemedi; değerlerin mantıklı aralıkta olduğundan emin ol." });
      }
    }
    setBusy(false);
    setMsg({ ok: true, text: "Kaydedildi." });
    router.refresh();
  }

  async function pickAvatar(file: File) {
    setBusy(true);
    try {
      const path = await uploadImage(supabase, "avatars", userId, file, { prefix: "avatar-" });
      const old = p.avatar_url;
      await supabase.from("profiles").update({ avatar_url: path }).eq("id", userId);
      if (old && !old.startsWith("http")) await supabase.storage.from("avatars").remove([old]);
      setP({ ...p, avatar_url: path });
    } finally {
      setBusy(false);
    }
  }

  async function giveConsent() {
    const { error } = await supabase.rpc("set_measurement_consent", { p_consent: true });
    if (!error) setConsent(true);
  }

  return (
    <div className="pb-6">
      <section className="mt-6 flex items-center gap-4">
        <button type="button" onClick={() => fileInput.current?.click()} aria-label="Profil fotoğrafını değiştir">
          <Avatar path={p.avatar_url} name={p.display_name ?? p.username} size={72} />
        </button>
        <button type="button" onClick={() => fileInput.current?.click()} className="text-sm font-semibold text-terracotta">Fotoğrafı değiştir</button>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && pickAvatar(e.target.files[0])} />
      </section>

      <section className="mt-6 space-y-3">
        <label className="block text-sm text-muted">Görünen ad
          <input value={p.display_name ?? ""} maxLength={50} onChange={(e) => setP({ ...p, display_name: e.target.value })} className={`${field} mt-1 text-ink`} />
        </label>
        <label className="block text-sm text-muted">Kullanıcı adı
          <input value={p.username} autoCapitalize="none" onChange={(e) => setP({ ...p, username: e.target.value.toLowerCase().replace(/\s/g, "") })} className={`${field} mt-1 text-ink`} />
        </label>
        <label className="block text-sm text-muted">Bio
          <textarea value={p.bio ?? ""} maxLength={300} rows={3} onChange={(e) => setP({ ...p, bio: e.target.value })} className={`${field} mt-1 text-ink`} />
        </label>
      </section>

      <section id="gizlilik" className="mt-8 scroll-mt-4">
        <h2 className="font-serif text-xl">Ölçüler</h2>
        <p className="mt-1 text-sm text-muted">Hepsi opsiyonel. Her ölçünün yanında kimlerin ne göreceğini seçebilirsin: <b>Açık</b> tam değer, <b>Aralık</b> ör. 60–65 kg, <b>Gizli</b> sadece eşleştirmede kullanılır.</p>

        {!consent ? (
          <div className="mt-4 rounded-[var(--radius-card)] border border-line bg-card p-4">
            <label className="flex items-start gap-3 text-sm leading-relaxed">
              <input type="checkbox" checked={consentBox} onChange={(e) => setConsentBox(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#A8432C]" />
              <span>Vücut ölçülerimin, bana benzeyen kullanıcıları eşleştirmek amacıyla işlenmesine <Link href="/kvkk#acik-riza" className="underline">açık rıza</Link> veriyorum.</span>
            </label>
            <button type="button" disabled={!consentBox} onClick={giveConsent} className="mt-3 rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-cream disabled:opacity-40">Ölçü eklemeye başla</button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {MEASUREMENT_KEYS.map((k) => (
              <div key={k} className="rounded-[var(--radius-card)] border border-line bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{MEASUREMENT_META[k].label}</p>
                  <div className="w-44"><VisibilitySelect value={vis(k)} onChange={(v) => setM({ ...m, visibility: { ...m.visibility, [k]: v } })} /></div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  {k !== "weight_kg" && k !== "shoe_size" && <BodyDiagram field={k} />}
                  <div className="min-w-0 flex-1">
                    <NumberField field={k} value={m[k]} onChange={(v) => setM({ ...m, [k]: v })} />
                    <p className="mt-1 text-xs text-muted">{MEASUREMENT_META[k].how}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-[var(--radius-card)] border border-line bg-card p-3">
              <p className="mb-2 font-semibold">Genelde üstte</p>
              <ChipSelect options={TOP_SIZES} value={m.usual_top_size} onChange={(v) => setM({ ...m, usual_top_size: v })} />
              <p className="mb-2 mt-4 font-semibold">Genelde altta</p>
              <ChipSelect options={BOTTOM_SIZES} value={m.usual_bottom_size} onChange={(v) => setM({ ...m, usual_bottom_size: v })} />
            </div>

            <div className="rounded-[var(--radius-card)] border border-line bg-card p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-semibold">Vücut tipi</p>
                <div className="w-44"><VisibilitySelect value={vis("body_type") === "range" ? "hidden" : vis("body_type")} onChange={(v) => setM({ ...m, visibility: { ...m.visibility, body_type: v === "range" ? "hidden" : v } })} /></div>
              </div>
              <ChipSelect options={BODY_TYPES} value={m.body_type} onChange={(v) => setM({ ...m, body_type: v })} />
            </div>
          </div>
        )}
      </section>

      {msg && <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-sand" : "bg-terracotta/10 text-terracotta"}`}>{msg.text}</p>}
      <div className="sticky bottom-20 mt-6">
        <button type="button" disabled={busy} onClick={save} className="w-full rounded-full bg-terracotta py-4 font-semibold text-cream shadow-lg disabled:opacity-50">
          {busy ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
