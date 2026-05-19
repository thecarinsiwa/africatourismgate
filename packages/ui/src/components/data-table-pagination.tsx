'use client';

import { cn } from '../lib/cn';
import { Button } from './button';

export type DataTablePaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  className?: string;
};

export function DataTablePagination({
  page,
  totalPages,
  totalItems,
  itemLabel = 'élément',
  onPageChange,
  className,
}: DataTablePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const plural = totalItems > 1 ? 's' : '';

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <p className="text-sm text-atg-muted">
        {totalItems} {itemLabel}
        {plural} — page {page} / {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Précédent
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
