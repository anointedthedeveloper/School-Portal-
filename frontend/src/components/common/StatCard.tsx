import type { LucideIcon } from 'lucide-react';
import { Skeleton } from './Skeleton';

interface Props {
  label: string;
  value?: number | string;
  icon: LucideIcon;
  hint?: string;
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, hint, loading }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-soft text-brand">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      {loading ? <Skeleton className="mt-3 h-8 w-16" /> : <p className="mt-2 text-2xl font-semibold text-slate-900">{value ?? '—'}</p>}
      {hint && !loading && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
