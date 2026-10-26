import { createClient } from "@supabase/supabase-js";

// Gizli anahtarla çalışan istemci: sadece sunucuda, sadece hesap silme gibi işlemler için.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
