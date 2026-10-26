// Web ve ileride mobil uygulamanın ortak kullanacağı tipler (React'ten bağımsız).

export type Visibility = "public" | "range" | "hidden";

export const MEASUREMENT_KEYS = [
  "height_cm",
  "weight_kg",
  "bust_cm",
  "waist_cm",
  "hip_cm",
  "inseam_cm",
  "shoe_size",
] as const;
export type MeasurementKey = (typeof MEASUREMENT_KEYS)[number];

// Maskelenmiş tek ölçü: ya tam değer ya aralık
export type MaskedValue = { value: number } | { min: number; max: number };
export type MaskedMeasurements = Partial<Record<MeasurementKey, MaskedValue>> & {
  body_type?: { value: string };
};

export type BodyMeasurements = {
  user_id: string;
  height_cm: number | null;
  weight_kg: number | null;
  bust_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  inseam_cm: number | null;
  shoe_size: number | null;
  usual_top_size: string | null;
  usual_bottom_size: string | null;
  body_type: string | null;
  visibility: Partial<Record<MeasurementKey | "body_type", Visibility>>;
};

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export type ProfilePrivate = {
  user_id: string;
  birth_year: number | null;
  kvkk_accepted_at: string | null;
  measurement_consent_at: string | null;
  onboarding_step: number;
  onboarding_done: boolean;
  completion_card_hidden_until: string | null;
};

export type PostCardData = {
  id: string;
  created_at: string;
  author_username: string;
  author_avatar: string | null;
  cover_path: string | null;
  photo_count: number;
  main_brand: string | null;
  main_size: string | null;
  main_category: string | null;
  height: MaskedValue | null;
  proximity: number | null;
  like_count: number;
  save_count: number;
  liked: boolean;
  saved: boolean;
};

export type FitRating = "tight" | "true" | "loose";
export type LengthRating = "short" | "true" | "long";

export type PostItem = {
  id: string;
  brand: string | null;
  brand_slug: string | null;
  product_name: string | null;
  category: string | null;
  category_label: string | null;
  size_bought: string;
  fit_rating: FitRating | null;
  length_rating: LengthRating | null;
  fit_note: string | null;
  fabric_note: string | null;
  product_url: string | null;
  attributes: ItemAttributes;
  attribute_labels: { key: string; label: string; values: { value: string; label: string; swatch: string | null }[] }[];
};

// Ürünün gelişmiş detayları: {"color": ["siyah"], "sleeve": ["uzun"]}
export type ItemAttributes = Record<string, string[]>;

export type AttributeOption = { value: string; label: string; swatch: string | null; position: number };
export type AttributeDef = {
  key: string;
  label: string;
  multi: boolean;
  max_select: number;
  categories: string[] | null;
  position: number;
  attribute_options: AttributeOption[];
};

export type PostDetail = {
  id: string;
  caption: string | null;
  status: "published" | "hidden" | "removed";
  created_at: string;
  is_owner: boolean;
  author: { id: string; username: string; display_name: string | null; avatar_url: string | null };
  measurements: MaskedMeasurements | null;
  usual_sizes: { top?: string; bottom?: string };
  proximity: number | null;
  photos: { path: string; pose: string | null }[];
  items: PostItem[];
  like_count: number;
  save_count: number;
  liked: boolean;
  saved: boolean;
};

export type PublicProfile = Profile & {
  created_at: string;
  is_me: boolean;
  measurements: MaskedMeasurements | null;
  usual_sizes: { top?: string; bottom?: string; shoe?: number };
  proximity: number | null;
  post_count: number;
};

export type Category = { slug: string; label: string; group_key: string; position: number };

export type SearchParams = {
  q?: string;
  brand?: string;
  category?: string;
  size?: string;
  heightMin?: number;
  heightMax?: number;
  weightMin?: number;
  weightMax?: number;
  nearMe?: boolean;
  minScore?: number;
  sort?: "new" | "near" | "popular";
  username?: string;
  saved?: boolean;
  attrs?: Record<string, string>;
  limit?: number;
  offset?: number;
};
