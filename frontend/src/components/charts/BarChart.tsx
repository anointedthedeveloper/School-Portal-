export interface BarDatum {
  label: string;
  value: number;
}

/** Dependency-free horizontal bar chart. Renders an empty state when every value is zero. */
export function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(...data.map((d) => d.value), 0);
  if (max === 0) return <p className="py-6 text-center text-sm text-slate-500">No records to chart yet.</p>;
  return (
    <ul className="space-y-3" aria-label="Records overview">
      {data.map((d) => (
        <li key={d.label} className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 text-slate-600">{d.label}</span>
          <div className="h-2.5 flex-1 rounded bg-slate-100">
            <div className="h-2.5 rounded bg-brand" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="w-8 text-right font-medium tabular-nums text-slate-800">{d.value}</span>
        </li>
      ))}
    </ul>
  );
}
