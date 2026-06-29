'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { useMobileViewport } from '../lib/use-mobile-viewport';
import { Button } from './button';
import { DataTableBadge } from './data-table-badge';
import { Drawer } from './drawer';

export type FilterBarMobileVariant = 'inline' | 'drawer';

export type FilterBarProps = {
  /** Number of active filters (shown as badge). */
  activeCount?: number;
  /** Filter controls (inputs, selects, etc.). */
  filters?: ReactNode;
  /** Primary actions (e.g. create button) aligned right. */
  actions?: ReactNode;
  /** Called when user clears all filters. */
  onClear?: () => void;
  /** Called when user applies filters in mobile drawer (drawer closes after). */
  onApply?: () => void;
  clearLabel?: string;
  applyLabel?: string;
  toggleLabel?: string;
  /** Start expanded on viewports >= md (inline mode only). */
  defaultOpen?: boolean;
  /** Mobile (< md): inline collapsible panel or overlay drawer. */
  mobileVariant?: FilterBarMobileVariant;
  className?: string;
};

export function FilterBar({
  activeCount = 0,
  filters,
  actions,
  onClear,
  onApply,
  clearLabel = 'Clear filters',
  applyLabel = 'Apply',
  toggleLabel = 'Filters',
  defaultOpen = true,
  mobileVariant = 'inline',
  className,
}: FilterBarProps) {
  const panelId = useId();
  const [inlineOpen, setInlineOpen] = useState(defaultOpen);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobileViewport = useMobileViewport();

  useEffect(() => {
    if (mobileVariant === 'inline') {
      setInlineOpen(isMobileViewport ? false : defaultOpen);
    } else if (!isMobileViewport) {
      setDrawerOpen(false);
    }
  }, [defaultOpen, isMobileViewport, mobileVariant]);

  const handleDrawerApply = () => {
    onApply?.();
    setDrawerOpen(false);
  };

  const desktopFiltersPanel = (
    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
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
  );

  const drawerFooter = (
    <div className="flex flex-col gap-2 p-4">
      {activeCount > 0 && onClear ? (
        <Button type="button" variant="ghost" size="sm" onClick={onClear} className="w-full">
          {clearLabel} ({activeCount})
        </Button>
      ) : null}
      <Button type="button" size="sm" onClick={handleDrawerApply} className="w-full">
        {applyLabel}
      </Button>
    </div>
  );

  return (
    <div
      className={cn(
        'rounded-xl border border-atg-border bg-atg-elevated/50',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-atg-border px-4 py-3 md:hidden">
        {mobileVariant === 'drawer' ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-medium text-atg-fg"
            aria-haspopup="dialog"
            onClick={() => setDrawerOpen(true)}
          >
            {toggleLabel}
            {activeCount > 0 ? (
              <DataTableBadge variant="default">{activeCount}</DataTableBadge>
            ) : null}
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-medium text-atg-fg"
            aria-expanded={inlineOpen}
            aria-controls={panelId}
            onClick={() => setInlineOpen((v) => !v)}
          >
            {toggleLabel}
            {activeCount > 0 ? (
              <DataTableBadge variant="default">{activeCount}</DataTableBadge>
            ) : null}
            <span aria-hidden className="text-atg-muted">
              {inlineOpen ? '▾' : '▸'}
            </span>
          </button>
        )}
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>

      {mobileVariant === 'inline' ? (
        <>
          <div
            id={panelId}
            className={cn(
              'flex flex-col gap-4 p-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between',
              !inlineOpen && 'hidden md:flex',
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

          {inlineOpen && activeCount > 0 && onClear ? (
            <div className="border-t border-atg-border px-4 py-3 md:hidden">
              <Button type="button" variant="ghost" size="sm" onClick={onClear} className="w-full">
                {clearLabel} ({activeCount})
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="hidden md:block">{desktopFiltersPanel}</div>
      )}

      {mobileVariant === 'drawer' && isMobileViewport ? (
        <Drawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={toggleLabel}
          side="bottom"
          footer={drawerFooter}
        >
          <div className="flex flex-col gap-4 p-4">{filters}</div>
        </Drawer>
      ) : null}
    </div>
  );
}
