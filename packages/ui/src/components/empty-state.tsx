import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { DataTableEmptyIcon } from './data-table-icons';

export type EmptyStateProps = {
  title: string;
  description?: string;
  /** Icône ou illustration (défaut : icône liste vide). */
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-atg-border bg-atg-elevated/40 px-6 py-16 text-center',
        className,
      )}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-atg-surface text-atg-muted ring-1 ring-atg-border/80"
        aria-hidden
      >
        {icon ?? <DataTableEmptyIcon className="h-8 w-8" />}
      </div>
      <h2 className="text-base font-semibold text-atg-fg">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-atg-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
