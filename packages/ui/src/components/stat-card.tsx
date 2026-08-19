import { cn } from '../lib/cn';
import { Card } from './card';
import { Skeleton } from './skeleton';

export type StatCardStatus = 'loading' | 'ready' | 'error';

export type StatCardChangeDirection = 'up' | 'down' | 'flat';

export type StatCardChange = {
  direction: StatCardChangeDirection;
  /** Ex. « +12,5 % » — déjà localisé. */
  formattedPercent: string;
  /** Ex. « vs période précédente ». */
  label: string;
};

export type StatCardProps = {
  label: string;
  subtitle?: string;
  status: StatCardStatus;
  value?: string;
  change?: StatCardChange;
  errorMessage?: string;
  icon: React.ReactNode;
  iconClassName?: string;
  className?: string;
};

function changeToneClass(direction: StatCardChangeDirection): string {
  if (direction === 'up') {
    return 'text-atg-success';
  }
  if (direction === 'down') {
    return 'text-atg-danger';
  }
  return 'text-atg-muted';
}

export function StatCard({
  label,
  subtitle,
  status,
  value,
  change,
  errorMessage,
  icon,
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <Card variant="dashboard" padding="sm" className={cn('h-full', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-atg-muted">{label}</p>
          {status === 'loading' ? (
            <div className="mt-2 space-y-2" aria-busy="true">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : status === 'error' ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {errorMessage}
            </p>
          ) : (
            <>
              <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-atg-fg">
                {value}
              </p>
              {change ? (
                <p
                  className={cn(
                    'mt-1 text-xs font-medium tabular-nums',
                    changeToneClass(change.direction),
                  )}
                >
                  <span>{change.formattedPercent}</span>
                  <span className="text-atg-muted"> · {change.label}</span>
                </p>
              ) : null}
            </>
          )}
          {subtitle ? (
            status === 'loading' ? (
              <Skeleton className="mt-2 h-3 w-32" />
            ) : (
              <p className="mt-1 text-xs text-atg-muted">{subtitle}</p>
            )
          ) : null}
        </div>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            iconClassName,
          )}
          aria-hidden
        >
          {icon}
        </span>
      </div>
    </Card>
  );
}
