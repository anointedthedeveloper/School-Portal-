import clsx from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={clsx('animate-pulse rounded bg-slate-200', className)} />;
}
