'use client';

import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import {
  DataTableAdjustIcon,
  DataTableCalendarIcon,
  DataTableDeleteIcon,
  DataTableEditIcon,
  DataTableViewIcon,
} from './data-table-icons';

export type DataTableActionKind = 'edit' | 'delete' | 'view' | 'revoke' | 'calendar' | 'remove';

const defaultLabels: Record<DataTableActionKind, string> = {
  edit: 'Edit',
  delete: 'Delete',
  view: 'View',
  revoke: 'Revoke',
  calendar: 'Availability',
  remove: 'Remove',
};

const actionIcons: Record<DataTableActionKind, typeof DataTableEditIcon> = {
  edit: DataTableEditIcon,
  delete: DataTableDeleteIcon,
  view: DataTableViewIcon,
  revoke: DataTableDeleteIcon,
  calendar: DataTableCalendarIcon,
  remove: DataTableDeleteIcon,
};

const dangerActions = new Set<DataTableActionKind>(['delete', 'revoke', 'remove']);

type DataTableActionButtonBaseProps = {
  action: DataTableActionKind;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export type DataTableActionButtonProps = DataTableActionButtonBaseProps &
  (
    | ({ href: string; onClick?: undefined } & Omit<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        'children' | 'href' | 'onClick'
      >)
    | ({ href?: undefined; onClick?: () => void } & Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        'children' | 'onClick'
      >)
  );

export const DataTableActionButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  DataTableActionButtonProps
>(function DataTableActionButton(
  { action, label, loading = false, disabled = false, className, href, onClick, ...props },
  ref,
) {
  const text = label ?? defaultLabels[action];
  const Icon = actionIcons[action];
  const isDanger = dangerActions.has(action);

  const classes = cn(
    'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface',
    isDanger
      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
      : 'text-atg-muted hover:bg-atg-surface hover:text-atg-fg',
    (disabled || loading) && 'pointer-events-none opacity-50',
    className,
  );

  const content = (
    <>
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      <span className="sr-only">{text}</span>
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        aria-label={text}
        title={text}
        aria-disabled={disabled || loading || undefined}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      className={classes}
      aria-label={text}
      title={text}
      disabled={disabled || loading}
      onClick={onClick}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
});

export type DataTableAdjustButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  label?: string;
  loading?: boolean;
};

/** Bouton « Ajuster » et autres libellés custom avec icône dédiée. */
export function DataTableAdjustButton({
  label = 'Adjust',
  loading = false,
  disabled,
  className,
  ...props
}: DataTableAdjustButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-atg-muted transition-colors',
        'hover:bg-atg-surface hover:text-atg-fg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface',
        (disabled || loading) && 'pointer-events-none opacity-50',
        className,
      )}
      aria-label={label}
      title={label}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        <DataTableAdjustIcon className="h-4 w-4" />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}

export type DataTableActionsProps = {
  children: React.ReactNode;
  className?: string;
};

export function DataTableActions({ children, className }: DataTableActionsProps) {
  return <div className={cn('flex justify-end gap-0.5', className)}>{children}</div>;
}
