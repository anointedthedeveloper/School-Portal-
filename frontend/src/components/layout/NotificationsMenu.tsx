import { useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useDismiss } from './useDismiss';

/** Notification centre shell. No notification source exists yet, so it shows an honest empty state. */
export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="Notifications" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
        <Bell className="h-5 w-5" aria-hidden />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white p-4 text-center shadow-lg">
          <p className="text-sm font-medium text-slate-700">No notifications</p>
          <p className="mt-1 text-xs text-slate-500">You're all caught up.</p>
        </div>
      )}
    </div>
  );
}
