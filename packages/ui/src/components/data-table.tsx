'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { cn } from '../lib/cn';
import { DataTableEmptyIcon, DataTableSearchEmptyIcon } from './data-table-icons';

export type { ColumnDef } from '@tanstack/react-table';

export type DataTableAlign = 'left' | 'center' | 'right';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: DataTableAlign;
    headerClassName?: string;
    cellClassName?: string;
  }
}

const alignClasses: Record<DataTableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  loadingMessage?: string;
  loadingRows?: number;
  emptyMessage?: string;
  /** Affiche l’icône « recherche vide » plutôt que « liste vide ». */
  emptyVariant?: 'default' | 'search';
  className?: string;
  tableClassName?: string;
  getRowId?: (row: TData) => string;
  'aria-label'?: string;
};

function getAlign(meta: { align?: DataTableAlign } | undefined): DataTableAlign {
  return meta?.align ?? 'left';
}

function DataTableSkeleton({ columns, rows }: { columns: number; rows: number }) {
  return (
    <div className="divide-y divide-atg-border/60" aria-hidden>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 px-5 py-4"
        >
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                'h-3.5 animate-pulse rounded-md bg-atg-border/70',
                colIndex === 0 ? 'w-[38%]' : colIndex === columns - 1 ? 'ml-auto w-16' : 'w-[14%]',
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function DataTableEmpty({
  message,
  variant,
}: {
  message: string;
  variant: 'default' | 'search';
}) {
  const Icon = variant === 'search' ? DataTableSearchEmptyIcon : DataTableEmptyIcon;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-atg-surface text-atg-muted ring-1 ring-atg-border/80">
        <Icon className="h-8 w-8" />
      </div>
      <p className="max-w-sm text-sm leading-relaxed text-atg-muted">{message}</p>
    </div>
  );
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  loadingMessage = 'Chargement…',
  loadingRows = 6,
  emptyMessage = 'Aucune donnée.',
  emptyVariant = 'default',
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

  const columnCount = columns.length;

  if (isLoading) {
    return (
      <div className={cn('overflow-hidden', className)} aria-busy="true" aria-live="polite">
        <p className="sr-only">{loadingMessage}</p>
        <DataTableSkeleton columns={columnCount} rows={loadingRows} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('overflow-hidden', className)}>
        <DataTableEmpty message={emptyMessage} variant={emptyVariant} />
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table
        className={cn('w-full min-w-[640px] border-collapse text-left text-sm', tableClassName)}
        aria-label={ariaLabel}
      >
        <thead className="sticky top-0 z-10 bg-atg-surface/95 backdrop-blur-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const align = getAlign(header.column.columnDef.meta);
                return (
                  <th
                    key={header.id}
                    scope="col"
                    className={cn(
                      'border-b border-atg-border px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-atg-muted',
                      alignClasses[align],
                      header.column.columnDef.meta?.headerClassName,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-atg-border/50">
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              className={cn(
                'group bg-atg-elevated transition-colors',
                'hover:bg-atg-surface/70',
                index % 2 === 1 && 'bg-atg-surface/25',
              )}
            >
              {row.getVisibleCells().map((cell) => {
                const align = getAlign(cell.column.columnDef.meta);
                return (
                  <td
                    key={cell.id}
                    className={cn(
                      'px-5 py-3.5 text-atg-fg',
                      alignClasses[align],
                      cell.column.columnDef.meta?.cellClassName,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
