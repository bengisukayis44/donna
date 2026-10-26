"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookmarkIcon, CloseIcon, FlagIcon, HeartIcon } from "./Icons";

const REASONS = [
  "Uygunsuz / müstehcen içerik",
  "Başkasının fotoğrafı",
  "Taciz veya nefret söylemi",
  "Spam / reklam",
  "Yanıltıcı bilgi",
  "Diğer",
];

export function PostActions({
  postId,
  loggedIn,
  isOwner,
  initial,
}: {
  postId: string;
  loggedIn: boolean;
  isOwner: boolean;
  initial: { liked: boolean; saved: boolean; like_count: number; save_count: number };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [state, setState] = useState(initial);
  const [reporting, setReporting] = useState(false);

  const requireLogin = () => {
    if (loggedIn) return false;
    router.push(`/giris?mod=kayit&next=/p/${postId}`);
    return true;
  };

  async function toggle(kind: "likes" | "saves") {
    if (requireLogin()) return;
    const flag = kind === "likes" ? "liked" : "saved";
    const count = kind === "likes" ? "like_count" : "save_count";
    const on = !state[flag];
    setState((s) => ({ ...s, [flag]: on, [count]: s[count] + (on ? 1 : -1) }));
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = on
      ? await supabase.from(kind).insert({ post_id: postId, user_id: user!.id })
      : await supabase.from(kind).delete().eq("post_id", postId).eq("user_id", user!.id);
    if (error && error.code !== "23505") {
      setState((s) => ({ ...s, [flag]: !on, [count]: s[count] + (on ? -1 : 1) }));
    }
  }

  async function remove() {
    if (!confirm("Bu paylaşımı silmek istediğine emin misin?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) {
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => toggle("likes")} className={`flex items-center gap-1 rounded-full px-2 py-1.5 ${state.liked ? "text-terracotta" : ""}`} aria-label="Beğen">
          <HeartIcon filled={state.liked} className="h-6 w-6" />
          <span className="text-sm tabular-nums">{state.like_count || ""}</span>
        </button>
        <button type="button" onClick={() => toggle("saves")} className={`flex items-center gap-1 rounded-full px-2 py-1.5 ${state.saved ? "text-terracotta" : ""}`} aria-label="Kaydet">
          <BookmarkIcon filled={state.saved} className="h-6 w-6" />
          <span className="text-sm tabular-nums">{state.save_count || ""}</span>
        </button>
        <div className="ml-auto">
          {isOwner ? (
            <button type="button" onClick={remove} className="px-2 py-1.5 text-sm text-muted">Sil</button>
          ) : (
            <button type="button" onClick={() => !requireLogin() && setReporting(true)} className="px-2 py-1.5 text-muted" aria-label="Şikayet et">
              <FlagIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      {reporting && <ReportSheet postId={postId} onClose={() => setReporting(false)} />}
    </>
  );
}

function ReportSheet({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!reason) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("reports").insert({
      post_id: postId,
      reporter_id: user!.id,
      reason: [reason, detail.trim()].filter(Boolean).join(" — ").slice(0, 500),
    });
    setBusy(false);
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/40" onClick={onClose}>
      <div className="mx-auto w-full max-w-md rounded-t-3xl bg-card p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">{sent ? "Teşekkürler" : "Şikayet et"}</h2>
          <button type="button" onClick={onClose} aria-label="Kapat"><CloseIcon className="h-5 w-5" /></button>
        </div>
        {sent ? (
          <p className="mt-3 text-sm text-muted">Bildirimin ekibimize ulaştı. En kısa sürede inceleyeceğiz.</p>
        ) : (
          <>
            <div className="mt-4 space-y-2">
              {REASONS.map((r) => (
                <label key={r} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${reason === r ? "border-terracotta" : "border-line"}`}>
                  <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-[#A8432C]" />
                  {r}
                </label>
              ))}
            </div>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Eklemek istediğin bir şey var mı? (opsiyonel)"
              maxLength={300}
              className="mt-3 w-full rounded-xl border border-line bg-cream p-3 text-sm"
              rows={2}
            />
            <button type="button" disabled={!reason || busy} onClick={send} className="mt-3 w-full rounded-full bg-terracotta py-3 font-semibold text-cream disabled:opacity-40">
              Gönder
            </button>
          </>
        )}
      </div>
    </div>
  );
}
