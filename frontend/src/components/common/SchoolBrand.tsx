import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';

export function SchoolBrand({ compact = false }: { compact?: boolean }) {
  const s = useSchoolSettings();
  return (
    <div className="flex min-w-0 items-center gap-3">
      {s.logo ? (
        <img src={s.logo} alt="" className="h-9 w-9 shrink-0 rounded object-contain" />
      ) : (
        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-brand text-sm font-bold text-white">
          {s.shortName.replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase() || 'S'}
        </span>
      )}
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold text-slate-900">{compact ? s.shortName : s.schoolName}</p>
        <p className="truncate text-xs text-slate-500">Academic Portal</p>
      </div>
    </div>
  );
}
