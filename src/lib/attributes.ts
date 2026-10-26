import type { AttributeDef } from "@/lib/domain/types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Gelişmiş detay tanımları (seçenekleriyle, sıralı)
export async function loadAttributeDefs(supabase: SupabaseClient): Promise<AttributeDef[]> {
  const { data } = await supabase
    .from("item_attributes")
    .select("*, attribute_options(*)")
    .order("position")
    .order("position", { referencedTable: "attribute_options" });
  return (data ?? []) as AttributeDef[];
}
