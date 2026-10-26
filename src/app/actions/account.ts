"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Hesabı ve tüm verileri siler: Storage'daki fotoğraflar + auth kullanıcısı
// (profil, ölçüler, paylaşımlar, beğeniler vb. veritabanında cascade ile silinir).
export async function deleteMyAccount(reason: "user" | "underage" = "user") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const admin = createAdminClient();
  for (const bucket of ["post-photos", "avatars"]) {
    // Her kullanıcının dosyaları "<id>/" klasöründe
    for (;;) {
      const { data: files, error } = await admin.storage.from(bucket).list(user.id, { limit: 1000 });
      if (error) throw new Error(`storage list: ${error.message}`);
      if (!files?.length) break;
      const { error: rmError } = await admin.storage.from(bucket).remove(files.map((f) => `${user.id}/${f.name}`));
      if (rmError) throw new Error(`storage remove: ${rmError.message}`);
      if (files.length < 1000) break;
    }
  }
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(`delete user: ${error.message}`);

  await supabase.auth.signOut();
  redirect(reason === "underage" ? "/giris?yas=1" : "/giris?silindi=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/giris");
}
