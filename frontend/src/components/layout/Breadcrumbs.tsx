import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const labelFor = (segment: string) => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-xs text-slate-500">
      <ol className="flex flex-wrap items-center gap-1">
        {segments.map((seg, i) => {
          const to = `/${segments.slice(0, i + 1).join('/')}`;
          const last = i === segments.length - 1;
          return (
            <li key={to} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
              {last ? <span aria-current="page" className="font-medium text-slate-700">{labelFor(seg)}</span> : <Link to={to} className="hover:text-brand">{labelFor(seg)}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
