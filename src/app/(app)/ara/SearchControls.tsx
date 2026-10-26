"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/Icons";
import type { Category } from "@/lib/domain/types";

const TABS = [
  ["paylasimlar", "Paylaşımlar"],
  ["markalar", "Markalar"],
  ["kullanicilar", "Kullanıcılar"],
] as const;

export function SearchControls({
  tab, categories, loggedIn, brandName, colors,
}: {
  tab: string; categories: Category[]; loggedIn: boolean; brandName: string | null;
  colors: { value: string; label: string; swatch: string | null }[];
}) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [open, setOpen] = useState(false);

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.replace(`${path}?${next.toString()}`, { scroll: false });
  };

  const filterCount = ["kategori", "beden", "renk", "boymin", "boymax", "kilomin", "kilomax", "yakin"].filter((k) => sp.get(k)).length;
  const field = "w-full rounded-xl border border-line bg-card px-3 py-2 text-[15px]";

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          set({ q: q.trim() || null });
        }}
        className="flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2.5"
      >
        <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          enterKeyHint="search"
          placeholder="Marka, ürün, beden… ör. zara jean 38"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); set({ q: null }); }} aria-label="Temizle">
            <CloseIcon className="h-4 w-4 text-muted" />
          </button>
        )}
      </form>

      <div className="mt-3 flex gap-5 border-b border-line text-sm">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => set({ sekme: key === "paylasimlar" ? null : key })}
            className={`-mb-px border-b-2 pb-2 ${tab === key ? "border-terracotta font-semibold" : "border-transparent text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "paylasimlar" && (
        <>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {brandName && (
              <Chip active onClick={() => set({ marka: null })}>{brandName} ✕</Chip>
            )}
            <Chip active={open || filterCount > 0} onClick={() => setOpen(!open)}>Filtreler{filterCount ? ` (${filterCount})` : ""}</Chip>
            {loggedIn && (
              <Chip active={sp.get("yakin") === "1"} onClick={() => set({ yakin: sp.get("yakin") === "1" ? null : "1" })}>Ölçülerime yakın</Chip>
            )}
            <select
              value={sp.get("sirala") ?? "new"}
              onChange={(e) => set({ sirala: e.target.value === "new" ? null : e.target.value })}
              className="shrink-0 rounded-full border border-line bg-card px-3 py-1.5 text-sm"
            >
              <option value="new">En yeni</option>
              {loggedIn && <option value="near">En yakın vücut</option>}
              <option value="popular">En çok kaydedilen</option>
            </select>
          </div>

          {open && (
            <div className="mt-3 space-y-3 rounded-[var(--radius-card)] border border-line bg-card p-4">
              <select value={sp.get("kategori") ?? ""} onChange={(e) => set({ kategori: e.target.value || null })} className={field}>
                <option value="">Tüm kategoriler</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
              <div>
                <p className="mb-1.5 text-sm text-muted">Renk</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const on = sp.get("renk") === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        aria-label={c.label}
                        aria-pressed={on}
                        onClick={() => set({ renk: on ? null : c.value })}
                        className={`h-7 w-7 rounded-full border ${on ? "ring-2 ring-terracotta ring-offset-2 ring-offset-card" : "border-line"}`}
                        style={{ background: c.swatch ?? undefined }}
                      />
                    );
                  })}
                </div>
              </div>
              <input defaultValue={sp.get("beden") ?? ""} onBlur={(e) => set({ beden: e.target.value.trim() || null })} placeholder="Beden (ör. 38, M)" className={field} />
              <Range label="Boy (cm)" min="boymin" max="boymax" sp={sp} set={set} />
              <Range label="Kilo (kg)" min="kilomin" max="kilomax" sp={sp} set={set} />
              <button
                type="button"
                onClick={() => set({ kategori: null, beden: null, renk: null, boymin: null, boymax: null, kilomin: null, kilomax: null, yakin: null })}
                className="text-sm text-muted underline"
              >
                Filtreleri temizle
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${active ? "border-ink bg-ink text-cream" : "border-line bg-card"}`}>
      {children}
    </button>
  );
}

function Range({
  label, min, max, sp, set,
}: {
  label: string; min: string; max: string; sp: URLSearchParams; set: (p: Record<string, string | null>) => void;
}) {
  const cls = "w-full min-w-0 rounded-xl border border-line bg-cream px-3 py-2 text-[15px]";
  return (
    <div>
      <p className="mb-1 text-sm text-muted">{label}</p>
      <div className="flex items-center gap-2">
        <input inputMode="numeric" defaultValue={sp.get(min) ?? ""} onBlur={(e) => set({ [min]: e.target.value || null })} placeholder="En az" className={cls} />
        <span className="text-muted">–</span>
        <input inputMode="numeric" defaultValue={sp.get(max) ?? ""} onBlur={(e) => set({ [max]: e.target.value || null })} placeholder="En çok" className={cls} />
      </div>
    </div>
  );
}
