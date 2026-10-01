import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { roleHome } from '@/utils/roles';

export default function NotFoundPage() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="mt-1 text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you are looking for does not exist.</p>
      <Link to={user ? roleHome[user.role] : '/login'} className="mt-5 text-sm font-medium text-brand hover:underline">
        {user ? 'Back to dashboard' : 'Go to sign in'}
      </Link>
    </div>
  );
}
