import { NavLink, Outlet } from 'react-router-dom';
import { Award, BarChart3, FileText, LayoutDashboard, UserCircle } from 'lucide-react';
import clsx from 'clsx';
import { SchoolBrand } from '@/components/common/SchoolBrand';
import { SessionTermBadge } from '@/components/common/SessionTermBadge';
import { NotificationsMenu } from '@/components/layout/NotificationsMenu';
import { UserMenu } from '@/components/layout/UserMenu';
import type { NavItem } from '@/components/layout/navigation';

export const studentNav: NavItem[] = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/exams', label: 'Exams', icon: FileText },
  { to: '/student/results', label: 'Results', icon: BarChart3 },
  { to: '/student/reports', label: 'Reports', icon: Award },
  { to: '/student/profile', label: 'Profile', icon: UserCircle },
];

/** Simplified layout: a top bar with tabs instead of a sidebar. */
export function StudentLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <SchoolBrand compact />
          <div className="flex items-center gap-2 sm:gap-3">
            <SessionTermBadge />
            <NotificationsMenu />
            <UserMenu />
          </div>
        </div>
        <nav aria-label="Main" className="mx-auto max-w-5xl overflow-x-auto px-2 sm:px-4">
          <ul className="flex gap-1">
            {studentNav.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium',
                      isActive ? 'border-brand text-brand-dark' : 'border-transparent text-slate-600 hover:text-slate-900',
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
