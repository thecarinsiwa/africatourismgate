import { cn } from '../lib/cn';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Indique une zone en cours de chargement pour les lecteurs d'écran. */
  'aria-busy'?: boolean;
  'aria-label'?: string;
};

export function Skeleton({ className, 'aria-busy': ariaBusy, 'aria-label': ariaLabel, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-atg-border/70', className)}
      aria-busy={ariaBusy}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      {...props}
    />
  );
}
