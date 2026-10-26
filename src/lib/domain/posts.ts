import type { FitRating, LengthRating, SearchParams } from "./types";

export const FIT_LABELS: Record<FitRating, string> = { tight: "Dar", true: "Tam", loose: "Bol" };
export const LENGTH_LABELS: Record<LengthRating, string> = { short: "Kısa", true: "Tam", long: "Uzun" };
export const POSE_LABELS: Record<string, string> = { front: "Önden", side: "Yandan", sitting: "Otururken", other: "Diğer" };

export const MAX_PHOTOS = 6;
export const MAX_ITEMS = 8;
export const PAGE_SIZE = 20;

// Puan → arayüz etiketi. Ham sayı gösterilmez.
export function proximityLabel(score: number | null | undefined): string | null {
  if (score == null) return null;
  if (score >= 85) return "Sana çok yakın";
  if (score >= 70) return "Sana yakın";
  return null;
}

export function photoUrl(path: string | null | undefined, bucket = "post-photos"): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

// search_posts RPC parametreleri (web ve mobil aynı fonksiyonu kullanır)
export function toRpcParams(p: SearchParams) {
  return {
    p_q: p.q || null,
    p_brand: p.brand || null,
    p_category: p.category || null,
    p_size: p.size || null,
    p_height_min: p.heightMin ?? null,
    p_height_max: p.heightMax ?? null,
    p_weight_min: p.weightMin ?? null,
    p_weight_max: p.weightMax ?? null,
    p_near_me: p.nearMe ?? false,
    p_min_score: p.minScore ?? 70,
    p_sort: p.sort ?? "new",
    p_username: p.username || null,
    p_saved: p.saved ?? false,
    p_limit: p.limit ?? PAGE_SIZE,
    p_offset: p.offset ?? 0,
    p_attrs: p.attrs && Object.keys(p.attrs).length ? p.attrs : null,
  };
}

// Türkçe büyük harf
export const upperTr = (s: string) => s.toLocaleUpperCase("tr-TR");

// Bu kategoride sorulan özellikler
export function attributesFor<T extends { categories: string[] | null }>(defs: T[], category: string): T[] {
  return defs.filter((d) => !d.categories || (!!category && d.categories.includes(category)));
}
