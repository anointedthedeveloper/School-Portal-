import { CalendarDays } from 'lucide-react';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';

export function SessionTermBadge() {
  const { currentSession, currentTerm } = useSchoolSettings();
  const text = [currentSession, currentTerm].filter(Boolean).join(' · ');
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
      title="Current academic session and term"
    >
      <CalendarDays className="h-3.5 w-3.5 text-slate-500" aria-hidden />
      {text || 'No session set'}
    </span>
  );
}
