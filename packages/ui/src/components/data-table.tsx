'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { cn } from '../lib/cn';

export type { ColumnDef } from '@tanstack/react-table';

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
  getRowId?: (row: TData) => string;
  'aria-label'?: string;
};

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  loadingMessage = 'Chargement…',
  emptyMessage = 'Aucune donnée.',
  className,
  tableClassName,
  getRowId,
  'aria-label': ariaLabel,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  if (isLoading) {
    return (
      <p className={cn('p-5 text-sm text-atg-muted', className)} aria-busy="true">
        {loadingMessage}
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p className={cn('p-5 text-sm text-atg-muted', className)}>{emptyMessage}</p>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table
        className={cn('w-full min-w-[640px] text-left text-sm', tableClassName)}
        aria-label={ariaLabel}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-atg-border text-atg-muted">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-5 py-3 font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-atg-border/60 last:border-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-5 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
