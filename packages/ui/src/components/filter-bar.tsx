'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Button } from './button';
import { DataTableBadge } from './data-table-badge';

export type FilterBarProps = {
  /** Number of active filters (shown as badge). */
  activeCount?: number;
  /** Filter controls (inputs, selects, etc.). */
  filters?: ReactNode;
  /** Primary actions (e.g. create button) aligned right. */
  actions?: ReactNode;
  /** Called when user clears all filters. */
  onClear?: () => void;
  clearLabel?: string;
  toggleLabel?: string;
  /** Start expanded on viewports >= md. */
  defaultOpen?: boolean;
  className?: string;
};

export function FilterBar({
  activeCount = 0,
  filters,
  actions,
  onClear,
  clearLabel = 'Effacer les filtres',
  toggleLabel = 'Filtres',
  defaultOpen = true,
  className,
}: FilterBarProps) {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setOpen(mq.matches ? defaultOpen : false);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [defaultOpen]);

  return (
    <div
      className={cn(
        'rounded-xl border border-atg-border bg-atg-elevated/50',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-atg-border px-4 py-3 md:hidden">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-atg-fg"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {toggleLabel}
          {activeCount > 0 ? (
            <DataTableBadge variant="default">{activeCount}</DataTableBadge>
          ) : null}
          <span aria-hidden className="text-atg-muted">
            {open ? '▾' : '▸'}
          </span>
        </button>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>

      <div
        id={panelId}
        className={cn(
          'flex flex-col gap-4 p-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between',
          !open && 'hidden md:flex',
        )}
      >
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          {filters}
        </div>
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {activeCount > 0 && onClear ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              {clearLabel}
              <DataTableBadge variant="muted" className="ml-1.5">
                {activeCount}
              </DataTableBadge>
            </Button>
          ) : null}
          {actions}
        </div>
      </div>

      {open && activeCount > 0 && onClear ? (
        <div className="border-t border-atg-border px-4 py-3 md:hidden">
          <Button type="button" variant="ghost" size="sm" onClick={onClear} className="w-full">
            {clearLabel} ({activeCount})
          </Button>
        </div>
      ) : null}
    </div>
  );
}
