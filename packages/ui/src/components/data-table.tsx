'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Header,
  type OnChangeFn,
  type Row,
  type SortingState,
} from '@tanstack/react-table';
import { Fragment, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { useMobileViewport } from '../lib/use-mobile-viewport';
import { DataTableEmptyIcon, DataTableSearchEmptyIcon } from './data-table-icons';

export type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table';

export type DataTableAlign = 'left' | 'center' | 'right';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: DataTableAlign;
    headerClassName?: string;
    cellClassName?: string;
    /** Hidden below md; content shown in expandable row details. */
    hideOnMobile?: boolean;
    /** Detail panel label (fallback: column header). */
    mobileDetailLabel?: string;
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
  /** Shows search-empty icon instead of list-empty icon. */
  emptyVariant?: 'default' | 'search';
  className?: string;
  tableClassName?: string;
  getRowId?: (row: TData) => string;
  /** Controlled sorting (TanStack Table). Use with `manualSorting` for server sort. */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  expandRowLabel?: string;
  collapseRowLabel?: string;
  expandRowAriaLabel?: string;
  'aria-label'?: string;
};

function getAlign(meta: { align?: DataTableAlign } | undefined): DataTableAlign {
  return meta?.align ?? 'left';
}

function isHiddenOnMobile<TData>(header: Header<TData, unknown>): boolean {
  return header.column.columnDef.meta?.hideOnMobile === true;
}

function getHeaderLabel<TData>(header: Header<TData, unknown>): ReactNode {
  if (header.isPlaceholder) return null;
  return flexRender(header.column.columnDef.header, header.getContext());
}

function DataTableSkeleton({ columns, rows }: { columns: number; rows: number }) {
  return (
    <div className="divide-y divide-atg-border/60" aria-hidden>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-5 py-4">
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

function SortIndicator({ direction }: { direction: false | 'asc' | 'desc' }) {
  return (
    <span className="ml-1 inline-flex flex-col text-[10px] leading-none text-atg-muted" aria-hidden>
      <span className={cn(direction === 'asc' && 'text-primary')}>▲</span>
      <span className={cn(direction === 'desc' && 'text-primary')}>▼</span>
    </span>
  );
}

function DataTableHeaderCell<TData>({
  header,
}: {
  header: Header<TData, unknown>;
}) {
  const align = getAlign(header.column.columnDef.meta);
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();
  const content = getHeaderLabel(header);

  return (
    <th
      scope="col"
      aria-sort={
        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : canSort ? 'none' : undefined
      }
      className={cn(
        'border-b border-atg-border px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-atg-muted',
        alignClasses[align],
        header.column.columnDef.meta?.headerClassName,
      )}
    >
      {canSort ? (
        <button
          type="button"
          onClick={header.column.getToggleSortingHandler()}
          className={cn(
            'inline-flex items-center gap-0.5 transition-colors hover:text-atg-fg',
            align === 'center' && 'mx-auto',
            align === 'right' && 'ml-auto',
          )}
        >
          {content}
          <SortIndicator direction={sorted} />
        </button>
      ) : (
        content
      )}
    </th>
  );
}

function DataTableExpandButton({
  expanded,
  expandLabel,
  collapseLabel,
  ariaLabel,
  onToggle,
}: {
  expanded: boolean;
  expandLabel: string;
  collapseLabel: string;
  ariaLabel?: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={ariaLabel ?? (expanded ? collapseLabel : expandLabel)}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-atg-muted transition-colors',
        'hover:bg-atg-surface hover:text-atg-fg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-elevated',
      )}
    >
      <span aria-hidden className="text-sm">
        {expanded ? '▾' : '▸'}
      </span>
      <span className="sr-only">{expanded ? collapseLabel : expandLabel}</span>
    </button>
  );
}

function DataTableMobileDetailRow<TData>({
  row,
  hiddenHeaders,
  colSpan,
}: {
  row: Row<TData>;
  hiddenHeaders: Header<TData, unknown>[];
  colSpan: number;
}) {
  return (
    <tr className="bg-atg-surface/40">
      <td colSpan={colSpan} className="px-5 py-3">
        <dl className="grid gap-3 sm:grid-cols-2">
          {hiddenHeaders.map((header) => {
            const cell = row.getVisibleCells().find((c) => c.column.id === header.column.id);
            if (!cell) return null;
            const label =
              header.column.columnDef.meta?.mobileDetailLabel ?? getHeaderLabel(header);
            const align = getAlign(cell.column.columnDef.meta);
            return (
              <div key={header.id} className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
                <dd className={cn('mt-0.5 text-sm text-atg-fg', alignClasses[align])}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </dd>
              </div>
            );
          })}
        </dl>
      </td>
    </tr>
  );
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  loadingMessage = 'Loading…',
  loadingRows = 6,
  emptyMessage = 'No data.',
  emptyVariant = 'default',
  className,
  tableClassName,
  getRowId,
  sorting,
  onSortingChange,
  manualSorting = false,
  expandRowLabel = 'Show details',
  collapseRowLabel = 'Hide details',
  expandRowAriaLabel,
  'aria-label': ariaLabel,
}: DataTableProps<TData>) {
  const isMobile = useMobileViewport();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set());

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
    state: sorting !== undefined ? { sorting } : undefined,
    onSortingChange,
    manualSorting,
    enableSortingRemoval: false,
  });

  const headerGroup = table.getHeaderGroups()[0];
  const allHeaders = headerGroup?.headers ?? [];
  const hiddenMobileHeaders = allHeaders.filter(isHiddenOnMobile);
  const useMobileLayout = isMobile && hiddenMobileHeaders.length > 0;
  const visibleHeaders = useMobileLayout
    ? allHeaders.filter((header) => !isHiddenOnMobile(header))
    : allHeaders;
  const hasExpandColumn = useMobileLayout;
  const skeletonColumns = visibleHeaders.length + (hasExpandColumn ? 1 : 0);

  const toggleRowExpanded = (rowId: string) => {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className={cn('overflow-hidden', className)} aria-busy="true" aria-live="polite">
        <p className="sr-only">{loadingMessage}</p>
        <DataTableSkeleton columns={skeletonColumns || columns.length} rows={loadingRows} />
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

  const totalColSpan = visibleHeaders.length + (hasExpandColumn ? 1 : 0);

  return (
    <div className={cn(useMobileLayout ? 'overflow-hidden' : 'overflow-x-auto', className)}>
      <table
        className={cn(
          'w-full border-collapse text-left text-sm',
          !useMobileLayout && 'min-w-[640px]',
          tableClassName,
        )}
        aria-label={ariaLabel}
      >
        <thead className="sticky top-0 z-10 bg-atg-surface/95 backdrop-blur-sm">
          <tr>
            {visibleHeaders.map((header) => (
              <DataTableHeaderCell key={header.id} header={header} />
            ))}
            {hasExpandColumn ? (
              <th
                scope="col"
                className="w-10 border-b border-atg-border px-2 py-3.5 text-xs font-semibold uppercase tracking-wider text-atg-muted"
              >
                <span className="sr-only">{expandRowLabel}</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-atg-border/50">
          {table.getRowModel().rows.map((row, index) => {
            const isExpanded = expandedRows.has(row.id);
            return (
              <Fragment key={row.id}>
                <tr
                  className={cn(
                    'group bg-atg-elevated transition-colors',
                    'hover:bg-atg-surface/70',
                    index % 2 === 1 && 'bg-atg-surface/25',
                  )}
                >
                  {visibleHeaders.map((header) => {
                    const cell = row.getVisibleCells().find((c) => c.column.id === header.column.id);
                    if (!cell) return null;
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
                  {hasExpandColumn ? (
                    <td className="px-2 py-3.5 text-right">
                      <DataTableExpandButton
                        expanded={isExpanded}
                        expandLabel={expandRowLabel}
                        collapseLabel={collapseRowLabel}
                        ariaLabel={expandRowAriaLabel}
                        onToggle={() => toggleRowExpanded(row.id)}
                      />
                    </td>
                  ) : null}
                </tr>
                {useMobileLayout && isExpanded ? (
                  <DataTableMobileDetailRow
                    row={row}
                    hiddenHeaders={hiddenMobileHeaders}
                    colSpan={totalColSpan}
                  />
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
