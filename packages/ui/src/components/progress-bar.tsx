import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressBarVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export type ProgressBarProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Valeur actuelle entre 0 et max (si absent ou indeterminate=true, mode indéterminé) */
  value?: number;
  /** Valeur maximale (défaut: 100) */
  max?: number;
  /** Taille de la barre */
  size?: ProgressBarSize;
  /** Variante de couleur */
  variant?: ProgressBarVariant;
  /** Force le mode indéterminé avec animation continue */
  indeterminate?: boolean;
  /** Label textuel ou personnalisé affiché au-dessus */
  label?: React.ReactNode;
  /** Affiche le pourcentage textuel à droite du label */
  showValue?: boolean;
};

const sizeClasses: Record<ProgressBarSize, string> = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const variantTrackClasses: Record<ProgressBarVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-atg-success',
  warning: 'bg-atg-warning',
  danger: 'bg-atg-danger',
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  {
    value,
    max = 100,
    size = 'sm',
    variant = 'primary',
    indeterminate: forceIndeterminate,
    label,
    showValue = false,
    className,
    'aria-label': ariaLabelProp,
    ...props
  },
  ref,
) {
  const isIndeterminate = forceIndeterminate || value === undefined || value === null;
  const clampedValue = typeof value === 'number' ? Math.min(Math.max(0, value), max) : 0;
  const percentage = Math.round((clampedValue / max) * 100);

  const trackColor = variantTrackClasses[variant] ?? variantTrackClasses.primary;
  const barHeight = sizeClasses[size] ?? sizeClasses.sm;

  return (
    <div ref={ref} className={cn('w-full space-y-1.5', className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-medium text-atg-fg">
          {label && <div>{label}</div>}
          {showValue && !isIndeterminate && <span>{percentage}%</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={isIndeterminate ? undefined : clampedValue}
        aria-label={ariaLabelProp ?? (typeof label === 'string' ? label : 'Progression')}
        aria-busy={isIndeterminate || percentage < 100}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-atg-border/50 dark:bg-atg-border/30',
          barHeight,
        )}
      >
        {isIndeterminate ? (
          <div
            className={cn(
              'absolute inset-y-0 w-1/3 rounded-full',
              trackColor,
            )}
            style={{
              animation: 'atgIndeterminate 1.5s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite',
            }}
          >
            <style>{`
              @keyframes atgIndeterminate {
                0% {
                  left: -35%;
                  right: 100%;
                }
                60% {
                  left: 100%;
                  right: -90%;
                }
                100% {
                  left: 100%;
                  right: -90%;
                }
              }
            `}</style>
          </div>
        ) : (
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              trackColor,
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
});
