import React from 'react';
import { cn } from '../lib/utils';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  className?: string;
}

export function DataTable({ columns, data, onRowClick, className }: DataTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700", className)}>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 font-medium tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr 
                key={i} 
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  "transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50", 
                  onRowClick ? "cursor-pointer" : ""
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
