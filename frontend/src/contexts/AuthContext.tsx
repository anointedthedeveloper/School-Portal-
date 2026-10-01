import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@/types/auth';
import { onAuthFailure, refreshSession } from '@/services/apiClient';
import { authService } from '@/services/auth.service';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AuthUser | null;
  status: Status;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  /** UI convenience only. The backend enforces every permission independently. */
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  // Restore the session from the httpOnly refresh cookie on first load.
  useEffect(() => {
    let active = true;
    refreshSession()
      .then((s) => { if (active) { setUser(s.user); setStatus('authenticated'); } })
      .catch(() => { if (active) setStatus('unauthenticated'); });
    return () => { active = false; };
  }, []);

  useEffect(
    () =>
      onAuthFailure(() => {
        setUser(null);
        setStatus('unauthenticated');
        queryClient.clear();
      }),
    [queryClient],
  );

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login(email, password);
    setUser(session.user);
    setStatus('authenticated');
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, logout, can: (p) => !!user?.permissions.includes(p) }),
    [user, status, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
