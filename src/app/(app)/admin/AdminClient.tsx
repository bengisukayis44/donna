"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { photoUrl } from "@/lib/domain/posts";
import { createClient } from "@/lib/supabase/client";

export type ReportGroup = {
  post_id: string;
  status: "published" | "hidden" | "removed";
  caption: string | null;
  author_id: string;
  author_username: string;
  cover_path: string | null;
  open_count: number;
  last_report_at: string;
  reasons: { id: string; reason: string; created_at: string; resolved: boolean }[];
};

const STATUS = { published: "Yayında", hidden: "Gizli", removed: "Kaldırıldı" };

export function ReportList({ groups }: { groups: ReportGroup[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [showResolved, setShowResolved] = useState(false);
  const list = groups.filter((g) => showResolved || g.open_count > 0);

  async function call(fn: string, args: Record<string, unknown>) {
    const { error } = await supabase.rpc(fn, args);
    if (error) alert("İşlem başarısız: " + error.message);
    router.refresh();
  }

  async function warn(g: ReportGroup) {
    const message = prompt(`@${g.author_username} kullanıcısına gidecek uyarı:`, "Paylaşımın topluluk kurallarımıza aykırı bulundu. Lütfen kuralları gözden geçir.");
    if (message) await call("admin_warn_user", { p_user: g.author_id, p_message: message });
  }

  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} /> Çözülmüşleri de göster
      </label>
      {list.length === 0 && <p className="py-10 text-center text-sm text-muted">Bekleyen şikayet yok. 🎉</p>}
      <ul className="mt-3 space-y-3">
        {list.map((g) => (
          <li key={g.post_id} className="rounded-[var(--radius-card)] border border-line bg-card p-3">
            <div className="flex gap-3">
              <Link href={`/p/${g.post_id}`} className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg bg-placeholder">
                {g.cover_path && <Image src={photoUrl(g.cover_path)!} alt="" fill sizes="80px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1 text-sm">
                <p><Link href={`/u/${g.author_username}`} className="font-semibold">@{g.author_username}</Link> · <span className="text-muted">{STATUS[g.status]}</span></p>
                <p className="text-terracotta">{g.open_count} açık şikayet</p>
                <ul className="mt-1 space-y-0.5 text-xs text-muted">
                  {g.reasons.slice(0, 4).map((r) => <li key={r.id} className={r.resolved ? "line-through" : ""}>• {r.reason}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {g.status !== "hidden" && <Btn onClick={() => call("admin_set_post_status", { p_post: g.post_id, p_status: "hidden" })}>Gizle</Btn>}
              {g.status !== "removed" && <Btn danger onClick={() => confirm("Paylaşım kaldırılsın mı?") && call("admin_set_post_status", { p_post: g.post_id, p_status: "removed" })}>Kaldır</Btn>}
              {g.status !== "published" && <Btn onClick={() => call("admin_set_post_status", { p_post: g.post_id, p_status: "published" })}>Yayına al</Btn>}
              {g.open_count > 0 && <Btn onClick={() => call("admin_dismiss_reports", { p_post: g.post_id })}>Şikayeti yok say</Btn>}
              <Btn onClick={() => warn(g)}>Kullanıcıyı uyar</Btn>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Btn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => unknown; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 ${danger ? "border-terracotta text-terracotta" : "border-line"}`}>
      {children}
    </button>
  );
}

type Brand = { id: string; name: string; slug: string; aliases: string[]; post_count: number };

export function BrandAdmin({ brands }: { brands: Brand[] }) {
  const [filter, setFilter] = useState("");
  const norm = (s: string) => s.toLocaleLowerCase("tr-TR");
  const list = brands.filter((b) => norm(b.name).includes(norm(filter)) || b.aliases.some((a) => norm(a).includes(norm(filter))));
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Marka ara" className="w-full rounded-xl border border-line bg-card px-3 py-2" />
      <p className="mt-2 text-xs text-muted">Birleştir: soldaki markanın tüm ürünleri seçilen markaya taşınır, eski ad takma ad olarak saklanır.</p>
      <ul className="mt-3 space-y-2">
        {list.map((b) => <BrandRow key={b.id} brand={b} all={brands} />)}
      </ul>
    </div>
  );
}

function BrandRow({ brand, all }: { brand: Brand; all: Brand[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(brand.name);
  const [aliases, setAliases] = useState(brand.aliases.join(", "));
  const [target, setTarget] = useState("");
  const supabase = createClient();

  async function save() {
    const { error } = await supabase.rpc("admin_update_brand", {
      p_id: brand.id,
      p_name: name,
      p_aliases: aliases.split(",").map((a) => a.trim()).filter(Boolean),
    });
    if (error) return alert(error.message);
    setEdit(false);
    router.refresh();
  }

  async function merge() {
    const t = all.find((b) => b.id === target);
    if (!t || !confirm(`"${brand.name}" → "${t.name}" ile birleştirilsin mi?`)) return;
    const { error } = await supabase.rpc("admin_merge_brands", { p_source: brand.id, p_target: target });
    if (error) return alert(error.message);
    router.refresh();
  }

  return (
    <li className="rounded-xl border border-line bg-card p-3 text-sm">
      {edit ? (
        <div className="space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-line px-2 py-1.5" />
          <input value={aliases} onChange={(e) => setAliases(e.target.value)} placeholder="Takma adlar (virgülle)" className="w-full rounded-lg border border-line px-2 py-1.5" />
          <div className="flex gap-2">
            <button type="button" onClick={save} className="rounded-full bg-ink px-3 py-1 text-cream">Kaydet</button>
            <button type="button" onClick={() => setEdit(false)} className="rounded-full border border-line px-3 py-1">Vazgeç</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold">{brand.name} <span className="font-normal text-muted">· {brand.post_count}</span></p>
            {brand.aliases.length > 0 && <p className="truncate text-xs text-muted">{brand.aliases.join(", ")}</p>}
          </div>
          <button type="button" onClick={() => setEdit(true)} className="shrink-0 text-terracotta">Düzenle</button>
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <select value={target} onChange={(e) => setTarget(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-line bg-cream px-2 py-1 text-xs">
          <option value="">Şununla birleştir…</option>
          {all.filter((b) => b.id !== brand.id).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button type="button" disabled={!target} onClick={merge} className="rounded-full border border-line px-3 text-xs disabled:opacity-40">Birleştir</button>
      </div>
    </li>
  );
}
