import { formatMasked, MEASUREMENT_META } from "@/lib/domain/measurements";
import { MEASUREMENT_KEYS, type MaskedMeasurements } from "@/lib/domain/types";

export function MeasurementChips({ m, extra = [] }: { m: MaskedMeasurements | null; extra?: [string, string | undefined][] }) {
  const rows: [string, string][] = [];
  for (const k of MEASUREMENT_KEYS) {
    const v = formatMasked(k, m?.[k]);
    if (v) rows.push([MEASUREMENT_META[k].label, v]);
  }
  if (m?.body_type) rows.push(["Vücut tipi", m.body_type.value]);
  for (const [label, v] of extra) if (v) rows.push([label, v]);
  if (!rows.length) return <p className="text-sm text-muted">Ölçü paylaşılmamış.</p>;
  return (
    <dl className="flex flex-wrap gap-2">
      {rows.map(([label, v]) => (
        <div key={label} className="rounded-xl bg-sand px-3 py-1.5">
          <dt className="text-[10px] uppercase tracking-wider text-muted">{label}</dt>
          <dd className="text-sm font-semibold tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
