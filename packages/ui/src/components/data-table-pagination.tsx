'use client';

import { cn } from '../lib/cn';
import { Button } from './button';
import { DataTableChevronLeftIcon, DataTableChevronRightIcon } from './data-table-icons';

export type DataTablePaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  className?: string;
};

function getVisiblePages(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export function DataTablePagination({
  page,
  totalPages,
  totalItems,
  pageSize = 20,
  itemLabel = 'élément',
  onPageChange,
  className,
}: DataTablePaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const plural = totalItems > 1 ? 's' : '';
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-atg-border bg-atg-elevated px-4 py-3 shadow-sm shadow-black/[0.03] sm:flex-row sm:items-center sm:justify-between dark:shadow-black/15',
        className,
      )}
    >
      <p className="text-sm text-atg-muted">
        <span className="font-medium text-atg-fg">
          {start}–{end}
        </span>{' '}
        sur {totalItems} {itemLabel}
        {plural}
        {totalPages > 1 ? (
          <span className="hidden sm:inline">
            {' '}
            · page {page} / {totalPages}
          </span>
        ) : null}
      </p>

      {totalPages > 1 ? (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            aria-label="Page précédente"
            className="!px-2.5"
          >
            <DataTableChevronLeftIcon className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-0.5">
            {visiblePages.map((pageNum, index) => {
              const prev = visiblePages[index - 1];
              const showEllipsis = prev !== undefined && pageNum - prev > 1;

              return (
                <span key={pageNum} className="flex items-center gap-0.5">
                  {showEllipsis ? (
                    <span className="px-1.5 text-sm text-atg-muted" aria-hidden>
                      …
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    aria-label={`Page ${pageNum}`}
                    aria-current={pageNum === page ? 'page' : undefined}
                    className={cn(
                      'min-w-[2rem] rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-elevated',
                      pageNum === page
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-atg-muted hover:bg-atg-surface hover:text-atg-fg',
                    )}
                  >
                    {pageNum}
                  </button>
                </span>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Page suivante"
            className="!px-2.5"
          >
            <DataTableChevronRightIcon className="h-4 w-4" />
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
