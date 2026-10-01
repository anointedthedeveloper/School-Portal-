import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { SchoolBrand } from '@/components/common/SchoolBrand';
import { SessionTermBadge } from '@/components/common/SessionTermBadge';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationsMenu } from './NotificationsMenu';
import { UserMenu } from './UserMenu';
import type { NavItem } from './navigation';

interface Props {
  nav: NavItem[];
  /** Short label under the brand, e.g. "Administration". */
  areaLabel: string;
}

function NavList({ nav, onNavigate }: { nav: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav aria-label={`Main`} className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-brand-soft text-brand-dark' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

/** Sidebar shell used by the admin and teacher layouts (each supplies its own nav). */
export function SidebarLayout({ nav, areaLabel }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-100 px-4 py-4"><SchoolBrand /></div>
        <p className="px-6 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{areaLabel}</p>
        <NavList nav={nav} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <SchoolBrand compact />
              <button type="button" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <NavList nav={nav} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6">
          <button type="button" aria-label="Open navigation" onClick={() => setDrawerOpen(true)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <SessionTermBadge />
            <NotificationsMenu />
            <UserMenu />
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
