import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import type { ApiErrorBody, ApiSuccess } from '@/types/api';
import type { AuthSession } from '@/types/auth';

/**
 * Access token lives in memory only (not localStorage), which keeps it out of reach of
 * persistent XSS theft. The long-lived refresh token is an httpOnly cookie managed by the API.
 */
let accessToken: string | null = null;
export const tokenStore = {
  get: () => accessToken,
  set: (t: string | null) => { accessToken = t; },
};

type AuthFailureListener = () => void;
const listeners = new Set<AuthFailureListener>();
export const onAuthFailure = (fn: AuthFailureListener) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

const baseConfig = { baseURL: env.apiUrl, withCredentials: true, timeout: 20_000 };

/** No interceptors: used for login/refresh so a failed refresh cannot loop. */
export const authApi = axios.create(baseConfig);
export const api = axios.create(baseConfig);

export const unwrap = <T>(res: { data: ApiSuccess<T> }): T => res.data.data;

let refreshInFlight: Promise<AuthSession> | null = null;

/** Single-flight: concurrent callers (React StrictMode, parallel 401s) share one refresh request. */
export function refreshSession(): Promise<AuthSession> {
  refreshInFlight ??= authApi
    .post<ApiSuccess<AuthSession>>('/auth/refresh')
    .then((res) => {
      const session = unwrap(res);
      tokenStore.set(session.accessToken);
      return session;
    })
    .finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as RetriableConfig | undefined;
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      try {
        const session = await refreshSession();
        original.headers.set('Authorization', `Bearer ${session.accessToken}`);
        return api(original);
      } catch {
        tokenStore.set(null);
        listeners.forEach((fn) => fn());
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return 'Cannot reach the server. Check your connection and try again.';
    return error.response.data?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function getFieldErrors(error: unknown) {
  return axios.isAxiosError<ApiErrorBody>(error) ? error.response?.data?.errors ?? [] : [];
}
