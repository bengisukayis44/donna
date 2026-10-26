import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth (Google), e-posta doğrulama ve şifre sıfırlama bağlantıları buraya döner.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  const next = nextParam.startsWith("/") ? nextParam : "/";

  if (!code) return NextResponse.redirect(`${origin}/giris`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/giris?hata=1`);

  if (next === "/sifre-yenile") return NextResponse.redirect(`${origin}${next}`);

  const { data: priv } = await supabase
    .from("profile_private")
    .select("onboarding_done")
    .eq("user_id", data.user.id)
    .single();
  return NextResponse.redirect(`${origin}${priv?.onboarding_done ? next : "/hosgeldin"}`);
}
