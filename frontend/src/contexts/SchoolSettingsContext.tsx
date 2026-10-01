import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PublicSchoolSettings } from '@/types/school';
import { settingsService } from '@/services/settings.service';
import { applyBrandColors } from '@/utils/color';
import { Spinner } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';

export const SCHOOL_SETTINGS_KEY = ['settings', 'public'] as const;

const SchoolSettingsContext = createContext<PublicSchoolSettings | null>(null);

function applyIdentity(s: PublicSchoolSettings) {
  applyBrandColors(s.primaryColor, s.secondaryColor);
  document.title = s.schoolName;
  if (s.favicon) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.removeAttribute('type');
    link.href = s.favicon;
  }
}

/** Loads white-label settings from the API before rendering anything school-specific. */
export function SchoolSettingsProvider({ children }: { children: ReactNode }) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: SCHOOL_SETTINGS_KEY,
    queryFn: settingsService.getPublic,
    staleTime: 5 * 60_000,
  });

  useEffect(() => { if (data) applyIdentity(data); }, [data]);

  if (isPending) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner label="Loading…" /></div>;
  }
  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState
          title="Cannot reach the server"
          message="The portal could not load its configuration. Check that the API is running and try again."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }
  return <SchoolSettingsContext.Provider value={data}>{children}</SchoolSettingsContext.Provider>;
}

export function useSchoolSettings(): PublicSchoolSettings {
  const ctx = useContext(SchoolSettingsContext);
  if (!ctx) throw new Error('useSchoolSettings must be used within SchoolSettingsProvider');
  return ctx;
}
