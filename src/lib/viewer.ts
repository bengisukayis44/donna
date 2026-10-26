import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { BodyMeasurements, Profile, ProfilePrivate } from "@/lib/domain/types";

export type Viewer = {
  id: string;
  email: string | undefined;
  profile: Profile;
  priv: ProfilePrivate;
  isAdmin: boolean;
};

// Oturumdaki kullanıcı. JWT yerelde doğrulanır (Supabase'e ağ isteği yok). İstek başına bir kez çalışır.
const getAuth = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  return { supabase, userId: claims?.sub ?? null, email: claims?.email as string | undefined };
});

// Giriş yapmış kullanıcı (yoksa null). Aynı istek içinde bir kez çalışır.
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const { supabase, userId, email } = await getAuth();
  if (!userId) return null;
  const [{ data: profile }, { data: priv }, { data: isAdmin }] = await Promise.all([
    supabase.from("profiles").select("id, username, display_name, avatar_url, bio").eq("id", userId).single(),
    supabase.from("profile_private").select("*").eq("user_id", userId).single(),
    supabase.rpc("is_admin"),
  ]);
  if (!profile || !priv) return null;
  return { id: userId, email, profile, priv, isAdmin: !!isAdmin };
});

export const getMyMeasurements = cache(async (): Promise<BodyMeasurements | null> => {
  const { supabase, userId } = await getAuth();
  if (!userId) return null;
  const { data } = await supabase.from("body_measurements").select("*").eq("user_id", userId).maybeSingle();
  return data;
});

// Zorunlu onboarding adımları (1: hesap/KVKK, 2: kullanıcı adı) bitmiş mi
export const mandatoryStepsDone = (v: Viewer) => v.priv.onboarding_step > 2 || v.priv.onboarding_done;
