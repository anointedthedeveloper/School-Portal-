import { useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fullName, initials } from '@/utils/format';
import { useDismiss } from './useDismiss';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  if (!user) return null;
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-label="Account menu" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-md p-1.5 hover:bg-slate-100">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">{initials(user)}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium text-slate-800">{fullName(user)}</span>
          <span className="block text-xs capitalize text-slate-500">{user.role.toLowerCase()}</span>
        </span>
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <div className="border-b border-slate-100 px-4 py-2">
            <p className="truncate text-sm font-medium text-slate-800">{fullName(user)}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
