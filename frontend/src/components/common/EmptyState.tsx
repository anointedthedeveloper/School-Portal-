import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  message?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function EmptyState({ title, message, icon: Icon = Inbox, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
