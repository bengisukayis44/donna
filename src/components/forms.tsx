"use client";

import { MEASUREMENT_META, VISIBILITY_LABELS } from "@/lib/domain/measurements";
import type { MeasurementKey, Visibility } from "@/lib/domain/types";

// Büyük sayı girişi: kocaman rakam, yanında birim, iki yanda -/+ düğmeleri
export function NumberField({
  field,
  value,
  onChange,
  big = false,
}: {
  field: MeasurementKey;
  value: number | null;
  onChange: (v: number | null) => void;
  big?: boolean;
}) {
  const meta = MEASUREMENT_META[field];
  const bump = (d: number) => {
    const base = value ?? defaultFor(field);
    onChange(Math.min(meta.max, Math.max(meta.min, Math.round((base + d) * 10) / 10)));
  };
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => bump(-meta.step)} className="h-12 w-12 shrink-0 rounded-full border border-line bg-card text-2xl text-muted active:bg-sand" aria-label="Azalt">−</button>
      <label className="flex flex-1 items-baseline justify-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          step={meta.step}
          min={meta.min}
          max={meta.max}
          value={value ?? ""}
          placeholder="—"
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className={`w-full min-w-0 bg-transparent text-center font-serif tabular-nums outline-none placeholder:text-placeholder ${big ? "text-6xl" : "text-4xl"}`}
          aria-label={meta.label}
        />
        {meta.unit && <span className="text-lg text-muted">{meta.unit}</span>}
      </label>
      <button type="button" onClick={() => bump(meta.step)} className="h-12 w-12 shrink-0 rounded-full border border-line bg-card text-2xl text-muted active:bg-sand" aria-label="Artır">+</button>
    </div>
  );
}

function defaultFor(field: MeasurementKey) {
  return { height_cm: 165, weight_kg: 60, bust_cm: 88, waist_cm: 70, hip_cm: 95, inseam_cm: 76, shoe_size: 38 }[field];
}

export function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(value === o ? null : o)}
          className={`min-w-12 rounded-full border px-3.5 py-2 text-sm font-medium ${value === o ? "border-terracotta bg-terracotta text-cream" : "border-line bg-card text-ink"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function VisibilitySelect({ value, onChange }: { value: Visibility; onChange: (v: Visibility) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-sand p-1 text-[11px]">
      {(Object.keys(VISIBILITY_LABELS) as Visibility[]).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={`rounded-lg px-1 py-1.5 leading-tight ${value === k ? "bg-card font-semibold text-ink shadow-sm" : "text-muted"}`}
        >
          {k === "hidden" ? "Gizli" : k === "range" ? "Aralık" : "Açık"}
        </button>
      ))}
    </div>
  );
}

// "Nasıl ölçülür" için basit çizim: ilgili bölge terracotta çizgiyle vurgulanır
export function BodyDiagram({ field }: { field: MeasurementKey }) {
  const lines: Partial<Record<MeasurementKey, React.ReactNode>> = {
    bust_cm: <ellipse cx="40" cy="38" rx="17" ry="3" />,
    waist_cm: <ellipse cx="40" cy="52" rx="12" ry="2.5" />,
    hip_cm: <ellipse cx="40" cy="64" rx="17" ry="3" />,
    inseam_cm: <path d="M42 70 L44 112" />,
    height_cm: <path d="M70 4 L70 116" />,
  };
  return (
    <svg viewBox="0 0 80 120" className="h-24 w-16 shrink-0" aria-hidden>
      <g fill="none" stroke="#D9C7B4" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <circle cx="40" cy="12" r="7" />
        <path d="M33 22 Q24 24 22 32 L18 58 M47 22 Q56 24 58 32 L62 58" />
        <path d="M30 22 L50 22 Q56 34 52 52 Q58 60 57 68 L50 116 M30 22 Q24 34 28 52 Q22 60 23 68 L30 116 M40 70 L40 70" />
        <path d="M23 68 Q40 74 57 68" />
      </g>
      <g fill="none" stroke="#A8432C" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={field === "height_cm" ? "3 3" : undefined}>
        {lines[field]}
      </g>
    </svg>
  );
}
