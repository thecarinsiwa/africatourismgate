import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type DataTableBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'muted';

const variantClasses: Record<DataTableBadgeVariant, string> = {
  default: 'bg-atg-surface text-atg-fg ring-atg-border/80',
  success: 'bg-atg-success-light text-atg-success-fg ring-atg-success/25',
  warning: 'bg-atg-warning-light text-atg-warning-fg ring-atg-warning/25',
  danger: 'bg-atg-danger-light text-atg-danger-fg ring-atg-danger/25',
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
