import type { BodyMeasurements, MaskedValue, MeasurementKey, Profile } from "./types";

export const MEASUREMENT_META: Record<
  MeasurementKey,
  { label: string; unit: string; min: number; max: number; step: number; how: string }
> = {
  height_cm: { label: "Boy", unit: "cm", min: 100, max: 230, step: 1, how: "Duvara yaslan, topuklar bitişik; başının en üst noktasından yere kadar ölç." },
  weight_kg: { label: "Kilo", unit: "kg", min: 30, max: 250, step: 1, how: "Sabah, ayakkabısız tartıldığın değer yeterli." },
  bust_cm: { label: "Göğüs", unit: "cm", min: 50, max: 200, step: 1, how: "Mezurayı göğsün en dolgun yerinden, yere paralel geçir." },
  waist_cm: { label: "Bel", unit: "cm", min: 40, max: 200, step: 1, how: "Belin en ince yerinden, nefesini tutmadan ölç." },
  hip_cm: { label: "Kalça", unit: "cm", min: 50, max: 200, step: 1, how: "Kalçanın en geniş yerinden, ayaklar bitişikken ölç." },
  inseam_cm: { label: "Bacak iç boyu", unit: "cm", min: 40, max: 120, step: 1, how: "Kasık birleşiminden ayak bileğine kadar, bacağın iç tarafından ölç." },
  shoe_size: { label: "Ayakkabı", unit: "", min: 30, max: 50, step: 0.5, how: "En sık aldığın numara." },
};

export const VISIBILITY_LABELS = {
  public: "Herkese açık",
  range: "Aralık olarak göster",
  hidden: "Gizli (sadece eşleştirmede)",
} as const;

export const TOP_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
export const BOTTOM_SIZES = ["32", "34", "36", "38", "40", "42", "44", "46", "48", "XS", "S", "M", "L", "XL", "XXL"];
export const SHOE_SIZES = ["35", "35.5", "36", "36.5", "37", "37.5", "38", "38.5", "39", "39.5", "40", "40.5", "41", "42", "43", "44", "45"];
export const BODY_TYPES = ["Düz", "Kum saati", "Armut", "Elma", "Ters üçgen", "Belirtmek istemiyorum"];

export function formatMasked(key: MeasurementKey, v: MaskedValue | null | undefined): string | null {
  if (!v) return null;
  const unit = MEASUREMENT_META[key].unit;
  if (key === "height_cm") {
    const m = (n: number) => (n / 100).toFixed(2);
    return "value" in v ? m(v.value) : `${m(v.min)}–${m(v.max)}`;
  }
  const s = "value" in v ? `${trim(v.value)}` : `${trim(v.min)}–${trim(v.max)}`;
  return unit ? `${s} ${unit}` : s;
}

function trim(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// Profil tamamlanma yüzdesi (kart için)
export function profileCompletion(profile: Profile | null, m: BodyMeasurements | null): number {
  const checks = [
    !!profile?.avatar_url,
    !!profile?.display_name,
    m?.height_cm != null,
    m?.weight_kg != null,
    m?.bust_cm != null,
    m?.waist_cm != null,
    m?.hip_cm != null,
    m?.inseam_cm != null,
    !!m?.usual_top_size,
    !!m?.usual_bottom_size,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
