import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/common/Spinner';
import type { Role } from '@/types/auth';
import { roleHome } from '@/utils/roles';

function FullPageSpinner() {
  return <div className="flex min-h-screen items-center justify-center"><Spinner label="Checking your session…" /></div>;
}

/** Requires a signed-in user. Real enforcement still happens on the API. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Requires one of the given roles; anyone else is sent to their own area. */
export function RoleProtectedRoute({ allowedRoles }: { allowedRoles: Role[] }) {
  const { user, status } = useAuth();
  if (status === 'loading') return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to={roleHome[user.role]} replace />;
  return <Outlet />;
}
