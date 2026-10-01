import type { ApiSuccess } from '@/types/api';
import type { PublicSchoolSettings, SchoolSettings } from '@/types/school';
import { api, authApi, unwrap } from './apiClient';

export type SettingsUpdate = Partial<Omit<SchoolSettings, 'gradingSystem' | 'reportSettings' | 'examSettings' | 'cbtSettings'>>;

export const settingsService = {
  getPublic: async () => unwrap(await authApi.get<ApiSuccess<PublicSchoolSettings>>('/settings/public')),
  getFull: async () => unwrap(await api.get<ApiSuccess<SchoolSettings>>('/settings')),
  update: async (input: SettingsUpdate) => unwrap(await api.put<ApiSuccess<SchoolSettings>>('/settings', input)),
};
