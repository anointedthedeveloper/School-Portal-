import type { ApiSuccess } from '@/types/api';
import type { AuthSession } from '@/types/auth';
import { api, authApi, tokenStore, unwrap } from './apiClient';

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const session = unwrap(await authApi.post<ApiSuccess<AuthSession>>('/auth/login', { email, password }));
    tokenStore.set(session.accessToken);
    return session;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStore.set(null);
    }
  },
};
