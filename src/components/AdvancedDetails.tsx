"use client";

import { useState } from "react";
import { attributesFor } from "@/lib/domain/posts";
import type { AttributeDef, ItemAttributes } from "@/lib/domain/types";

// Ürün formundaki katlanır "Gelişmiş detaylar" bölümü. Kategoriye göre ilgili özellikler gösterilir.
export function AdvancedDetails({
  defs,
  category,
  value,
  onChange,
}: {
  defs: AttributeDef[];
  category: string;
  value: ItemAttributes;
  onChange: (v: ItemAttributes) => void;
}) {
  const [open, setOpen] = useState(false);
  const shown = attributesFor(defs, category);
  const filled = shown.filter((d) => value[d.key]?.length).length;

  function toggle(def: AttributeDef, v: string) {
    const cur = value[def.key] ?? [];
    let next: string[];
    if (cur.includes(v)) next = cur.filter((x) => x !== v);
    else if (!def.multi) next = [v];
    else next = cur.length >= def.max_select ? [...cur.slice(1), v] : [...cur, v];
    onChange({ ...value, [def.key]: next });
  }

  return (
    <div className="rounded-xl border border-line">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm">
        <span>
          <b>Gelişmiş detaylar</b> <span className="text-muted">· renk, kumaş, kesim{filled ? ` · ${filled} seçili` : ""}</span>
        </span>
        <span className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-line px-3 py-3">
          {!category && <p className="text-xs text-muted">Kategori seçersen o parçaya özel seçenekler (kol boyu, paça, topuk…) de çıkar.</p>}
          {shown.map((def) => (
            <div key={def.key}>
              <p className="mb-1.5 text-sm font-semibold">
                {def.label}
                {def.multi && <span className="font-normal text-muted"> · en fazla {def.max_select}</span>}
              </p>
              {def.key === "color" ? (
                <div className="grid grid-cols-5 gap-x-1 gap-y-2">
                  {def.attribute_options.map((o) => {
                    const on = value[def.key]?.includes(o.value);
                    return (
                      <button key={o.value} type="button" onClick={() => toggle(def, o.value)} className="flex flex-col items-center gap-1">
                        <span
                          className={`h-8 w-8 rounded-full border ${on ? "ring-2 ring-terracotta ring-offset-2 ring-offset-card" : "border-line"}`}
                          style={{ background: o.swatch ?? undefined }}
                        />
                        <span className={`text-[10px] leading-tight ${on ? "font-semibold" : "text-muted"}`}>{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {def.attribute_options.map((o) => {
                    const on = value[def.key]?.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => toggle(def, o.value)}
                        className={`rounded-full border px-3 py-1.5 text-xs ${on ? "border-terracotta bg-terracotta text-cream" : "border-line bg-cream"}`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
