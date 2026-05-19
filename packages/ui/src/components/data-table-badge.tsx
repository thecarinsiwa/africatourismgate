import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type DataTableBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'muted';

const variantClasses: Record<DataTableBadgeVariant, string> = {
  default: 'bg-atg-surface text-atg-fg ring-atg-border/80',
  success: 'bg-primary/12 text-primary ring-primary/20',
  warning: 'bg-amber-100 text-amber-800 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800/50',
  danger: 'bg-red-100 text-red-700 ring-red-200/80 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900/50',
  muted: 'bg-atg-border/50 text-atg-muted ring-atg-border/60',
};

export type DataTableBadgeProps = {
  children: ReactNode;
  variant?: DataTableBadgeVariant;
  className?: string;
};

export function DataTableBadge({
  children,
  variant = 'default',
  className,
}: DataTableBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
