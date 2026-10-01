import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Hide this column in the stacked mobile layout. */
  hideOnMobile?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
}

/** Table on md+ screens; stacked label/value cards below, so nothing scrolls horizontally. */
export function DataTable<T>({ columns, rows, rowKey, empty }: Props<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  const mobileCols = columns.filter((c) => !c.hideOnMobile);
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>{columns.map((c) => <th key={c.key} scope="col" className="px-4 py-2.5 font-medium">{c.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-slate-50">
                {columns.map((c) => <td key={c.key} className="px-4 py-3 text-slate-700">{c.render(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-slate-100 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="space-y-1 px-4 py-3">
            {mobileCols.map((c) => (
              <div key={c.key} className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">{c.header}</span>
                <span className="text-right text-slate-800">{c.render(row)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}
