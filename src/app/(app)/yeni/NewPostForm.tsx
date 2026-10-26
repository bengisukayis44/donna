"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, BackIcon, CloseIcon, PlusIcon } from "@/components/Icons";
import { BOTTOM_SIZES, SHOE_SIZES, TOP_SIZES } from "@/lib/domain/measurements";
import { FIT_LABELS, LENGTH_LABELS, MAX_ITEMS, MAX_PHOTOS, POSE_LABELS } from "@/lib/domain/posts";
import type { Category, FitRating, LengthRating } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";

type Photo = { key: string; preview: string; path: string | null; pose: string | null; failed?: boolean };
type Item = {
  key: string;
  brand: string;
  product_name: string;
  category: string;
  size_bought: string;
  fit_rating: FitRating | "";
  length_rating: LengthRating | "";
  fit_note: string;
  fabric_note: string;
  product_url: string;
};

const newItem = (): Item => ({
  key: crypto.randomUUID(), brand: "", product_name: "", category: "", size_bought: "",
  fit_rating: "", length_rating: "", fit_note: "", fabric_note: "", product_url: "",
});

const POSE_ORDER = ["front", "side", "sitting"];

export function NewPostForm({ userId, categories }: { userId: string; categories: Category[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [items, setItems] = useState<Item[]>([newItem()]);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const uploading = photos.some((p) => !p.path && !p.failed);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).slice(0, room);
    const fresh: Photo[] = picked.map((f, i) => ({
      key: crypto.randomUUID(),
      preview: URL.createObjectURL(f),
      path: null,
      pose: POSE_ORDER[photos.length + i] ?? null,
    }));
    setPhotos((p) => [...p, ...fresh]);
    await Promise.all(
      picked.map(async (file, i) => {
        const key = fresh[i].key;
        try {
          const path = await uploadImage(supabase, "post-photos", userId, file);
          setPhotos((p) => p.map((x) => (x.key === key ? { ...x, path } : x)));
        } catch {
          setPhotos((p) => p.map((x) => (x.key === key ? { ...x, failed: true } : x)));
        }
      }),
    );
  }

  function removePhoto(key: string) {
    const ph = photos.find((p) => p.key === key);
    if (ph?.path) supabase.storage.from("post-photos").remove([ph.path]);
    setPhotos((p) => p.filter((x) => x.key !== key));
  }

  function movePhoto(i: number, d: -1 | 1) {
    setPhotos((p) => {
      const j = i + d;
      if (j < 0 || j >= p.length) return p;
      const copy = [...p];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  const updateItem = (key: string, patch: Partial<Item>) => setItems((list) => list.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  const itemsValid = items.every((it) => it.brand.trim() && it.size_bought.trim() && it.category);
  const photosValid = photos.length > 0 && !uploading && photos.every((p) => p.path);

  async function share() {
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.rpc("create_post", {
      p_caption: caption,
      p_photos: photos.map((p) => ({ path: p.path, pose: p.pose })),
      p_items: items.map((it) => ({ ...it, key: undefined, product_url: normalizeUrl(it.product_url) })),
    });
    setBusy(false);
    if (error || !data) return setError("Paylaşılamadı. Bilgileri kontrol edip tekrar dener misin?");
    router.replace(`/p/${data}`);
    router.refresh();
  }

  async function cancel() {
    if ((photos.length || items.some((i) => i.brand)) && !confirm("Paylaşımdan vazgeçilsin mi?")) return;
    const paths = photos.map((p) => p.path).filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("post-photos").remove(paths);
    router.back();
  }

  return (
    <main className="px-4 pt-3">
      <header className="flex items-center justify-between">
        <button type="button" onClick={step === 1 ? cancel : () => setStep(step - 1)} className="-ml-2 rounded-full p-2" aria-label="Geri">
          {step === 1 ? <CloseIcon className="h-5 w-5" /> : <BackIcon className="h-5 w-5" />}
        </button>
        <p className="text-sm font-semibold">Kombinini paylaş · {step}/3</p>
        <span className="w-9" />
      </header>

      {step === 1 && (
        <section className="animate-step pt-4">
          <h1 className="font-serif text-3xl">Fotoğraflar</h1>
          <p className="mt-1 text-sm text-muted">1–{MAX_PHOTOS} fotoğraf. Önden, yandan ve otururken çekilmiş pozlar en çok işe yarar.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div key={p.key} className="relative">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-placeholder">
                  <Image src={p.preview} alt="" fill unoptimized className={`object-cover ${p.path ? "" : "opacity-50"}`} />
                  {!p.path && !p.failed && <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">Yükleniyor…</span>}
                  {p.failed && <span className="absolute inset-0 flex items-center justify-center bg-terracotta/70 p-2 text-center text-xs text-cream">Yüklenemedi</span>}
                  {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-ink/60 px-1.5 text-[10px] text-cream">Kapak</span>}
                  <button type="button" onClick={() => removePhoto(p.key)} className="absolute right-1.5 top-1.5 rounded-full bg-ink/60 p-1 text-cream" aria-label="Kaldır">
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
                    <button type="button" disabled={i === 0} onClick={() => movePhoto(i, -1)} className="rounded-full bg-card/90 p-1 disabled:invisible" aria-label="Sola taşı"><ArrowLeftIcon className="h-3.5 w-3.5" /></button>
                    <button type="button" disabled={i === photos.length - 1} onClick={() => movePhoto(i, 1)} className="rounded-full bg-card/90 p-1 disabled:invisible" aria-label="Sağa taşı"><ArrowRightIcon className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <select
                  value={p.pose ?? ""}
                  onChange={(e) => setPhotos((list) => list.map((x) => (x.key === p.key ? { ...x, pose: e.target.value || null } : x)))}
                  className="mt-1 w-full rounded-lg border border-line bg-card px-1 py-1 text-xs"
                >
                  <option value="">Poz</option>
                  {Object.entries(POSE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-placeholder text-muted"
              >
                <PlusIcon className="h-7 w-7" />
                <span className="text-xs">{photos.length ? "Ekle" : "Fotoğraf seç"}</span>
              </button>
            )}
          </div>
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <p className="mt-4 text-xs text-muted">Fotoğraflar yüklenmeden önce küçültülür ve konum bilgisi gibi gizli veriler silinir.</p>
          <Next disabled={!photosValid} onClick={() => setStep(2)}>{uploading ? "Yükleniyor…" : "Devam"}</Next>
        </section>
      )}

      {step === 2 && (
        <section className="animate-step pt-4">
          <h1 className="font-serif text-3xl">Üzerindekiler</h1>
          <p className="mt-1 text-sm text-muted">Her parça için marka ve aldığın bedeni yaz. Gerisi opsiyonel.</p>
          <div className="mt-5 space-y-4">
            {items.map((it, i) => (
              <ItemForm
                key={it.key}
                index={i}
                item={it}
                categories={categories}
                onChange={(patch) => updateItem(it.key, patch)}
                onRemove={items.length > 1 ? () => setItems((l) => l.filter((x) => x.key !== it.key)) : undefined}
              />
            ))}
          </div>
          {items.length < MAX_ITEMS && (
            <button type="button" onClick={() => setItems((l) => [...l, newItem()])} className="mt-4 w-full rounded-[var(--radius-card)] border-2 border-dashed border-placeholder py-3 text-sm font-semibold text-muted">
              + Bir parça daha ekle
            </button>
          )}
          <Next disabled={!itemsValid} onClick={() => setStep(3)}>Devam</Next>
        </section>
      )}

      {step === 3 && (
        <section className="animate-step pt-4">
          <h1 className="font-serif text-3xl">Son dokunuş</h1>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Açıklama ekle (opsiyonel) — ör. düğün için aldım, gün boyu rahattı"
            className="mt-4 w-full rounded-[var(--radius-card)] border border-line bg-card p-3 text-[15px]"
          />
          <p className="eyebrow mt-6 mb-2">Önizleme</p>
          <div className="flex gap-3 rounded-[var(--radius-card)] border border-line bg-card p-3">
            <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-lg bg-placeholder">
              {photos[0] && <Image src={photos[0].preview} alt="" fill unoptimized className="object-cover" />}
            </div>
            <ul className="min-w-0 flex-1 space-y-2 text-sm">
              {items.map((it) => (
                <li key={it.key} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate"><b>{it.brand}</b> {it.product_name}</span>
                  <span className="shrink-0 rounded-md bg-terracotta px-1.5 font-bold text-cream">{it.size_bought.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-xs text-muted">Profilindeki güncel ölçüler bu paylaşıma kaydedilir (gizlilik ayarlarınla birlikte), böylece ileride ölçülerin değişse de bu kombin anlamlı kalır.</p>
          {error && <p className="mt-3 rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{error}</p>}
          <Next disabled={busy} onClick={share}>{busy ? "Paylaşılıyor…" : "Paylaş"}</Next>
        </section>
      )}
    </main>
  );
}

function Next({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <div className="sticky bottom-20 mt-8 pb-2">
      <button type="button" disabled={disabled} onClick={onClick} className="w-full rounded-full bg-terracotta py-4 font-semibold text-cream shadow-lg disabled:opacity-40">
        {children}
      </button>
    </div>
  );
}

function normalizeUrl(u: string) {
  const t = u.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function ItemForm({
  index, item, categories, onChange, onRemove,
}: {
  index: number; item: Item; categories: Category[]; onChange: (p: Partial<Item>) => void; onRemove?: () => void;
}) {
  const [more, setMore] = useState(false);
  const group = categories.find((c) => c.slug === item.category)?.group_key;
  const sizeHints = group === "shoe" ? SHOE_SIZES : group === "bottom" ? BOTTOM_SIZES : TOP_SIZES;
  const field = "w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-[15px]";

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="eyebrow">Parça {index + 1}</p>
        {onRemove && <button type="button" onClick={onRemove} className="text-xs text-muted">Kaldır</button>}
      </div>
      <div className="space-y-3">
        <BrandInput value={item.brand} onChange={(brand) => onChange({ brand })} className={field} />
        <input value={item.product_name} onChange={(e) => onChange({ product_name: e.target.value })} maxLength={120} placeholder="Ürün adı / model (ör. Straight Fit Jean)" className={field} />
        <select value={item.category} onChange={(e) => onChange({ category: e.target.value })} className={`${field} ${item.category ? "" : "text-muted"}`}>
          <option value="">Kategori seç *</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
        <div>
          <label className="text-sm font-semibold">Aldığın beden *</label>
          <input
            value={item.size_bought}
            onChange={(e) => onChange({ size_bought: e.target.value.slice(0, 12) })}
            placeholder="ör. 38, M, 28/32"
            className={`${field} mt-1 text-lg font-bold`}
          />
          <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
            {sizeHints.map((s) => (
              <button key={s} type="button" onClick={() => onChange({ size_bought: s })} className={`shrink-0 rounded-full border px-3 py-1 text-xs ${item.size_bought.toUpperCase() === s ? "border-terracotta bg-terracotta text-cream" : "border-line"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <Segment label="Kalıp" options={FIT_LABELS} value={item.fit_rating} onChange={(v) => onChange({ fit_rating: v as FitRating | "" })} />
        <Segment label="Boy" options={LENGTH_LABELS} value={item.length_rating} onChange={(v) => onChange({ length_rating: v as LengthRating | "" })} />
        {more ? (
          <>
            <textarea value={item.fit_note} onChange={(e) => onChange({ fit_note: e.target.value })} maxLength={500} rows={2} placeholder="Fit notu (ör. belde tam, boyu biraz uzun)" className={field} />
            <textarea value={item.fabric_note} onChange={(e) => onChange({ fabric_note: e.target.value })} maxLength={500} rows={2} placeholder="Kumaş notu (ör. kalın, esnemiyor, terletmiyor)" className={field} />
            <input value={item.product_url} onChange={(e) => onChange({ product_url: e.target.value })} inputMode="url" placeholder="Ürün linki (opsiyonel)" className={field} />
          </>
        ) : (
          <button type="button" onClick={() => setMore(true)} className="text-sm font-semibold text-terracotta">+ Fit notu, kumaş notu, link ekle</button>
        )}
      </div>
    </div>
  );
}

function Segment({ label, options, value, onChange }: { label: string; options: Record<string, string>; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-sm text-muted">{label}</span>
      <div className="grid flex-1 grid-cols-3 gap-1 rounded-xl bg-sand p-1 text-sm">
        {Object.entries(options).map(([k, v]) => (
          <button key={k} type="button" onClick={() => onChange(value === k ? "" : k)} className={`rounded-lg py-1.5 ${value === k ? "bg-card font-semibold shadow-sm" : "text-muted"}`}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

// Marka: yazdıkça mevcut markalar önerilir, listede yoksa yazılan yeni marka olarak eklenir
function BrandInput({ value, onChange, className }: { value: string; onChange: (v: string) => void; className: string }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      const { data } = await createClient().rpc("search_brands", { p_q: value, p_limit: 6 });
      setOptions(data ?? []);
    }, 200);
    return () => clearTimeout(t);
  }, [value, open]);

  const exact = options.some((o) => o.name.toLocaleLowerCase("tr-TR") === value.trim().toLocaleLowerCase("tr-TR"));
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        maxLength={60}
        placeholder="Marka * (ör. Zara)"
        className={`${className} font-semibold`}
        autoComplete="off"
      />
      {open && (options.length > 0 || value.trim()) && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-line bg-card shadow-lg">
          {options.map((o) => (
            <li key={o.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(o.name); setOpen(false); }} className="w-full px-3 py-2.5 text-left text-sm hover:bg-sand">
                {o.name}
              </button>
            </li>
          ))}
          {value.trim() && !exact && (
            <li>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen(false)} className="w-full px-3 py-2.5 text-left text-sm text-muted hover:bg-sand">
                &ldquo;{value.trim()}&rdquo; yeni marka olarak ekle
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
