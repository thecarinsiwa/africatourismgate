import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'current' | 'white' | 'muted';

export type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  showLabel?: boolean;
};

const sizeClasses: Record<SpinnerSize, { spinner: string; text: string; gap: string }> = {
  xs: { spinner: 'h-3 w-3 border-[1.5px]', text: 'text-xs', gap: 'gap-1.5' },
  sm: { spinner: 'h-4 w-4 border-2', text: 'text-xs', gap: 'gap-2' },
  md: { spinner: 'h-6 w-6 border-2', text: 'text-sm', gap: 'gap-2.5' },
  lg: { spinner: 'h-8 w-8 border-[3px]', text: 'text-base', gap: 'gap-3' },
  xl: { spinner: 'h-12 w-12 border-4', text: 'text-lg', gap: 'gap-3.5' },
};

const variantClasses: Record<SpinnerVariant, { ring: string; text: string }> = {
  primary: {
    ring: 'border-primary border-t-transparent',
    text: 'text-primary',
  },
  secondary: {
    ring: 'border-secondary border-t-transparent',
    text: 'text-secondary',
  },
  current: {
    ring: 'border-current border-t-transparent',
    text: 'text-current',
  },
  white: {
    ring: 'border-white border-t-transparent',
    text: 'text-white',
  },
  muted: {
    ring: 'border-atg-muted border-t-transparent',
    text: 'text-atg-muted',
  },
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(function Spinner(
  {
    size = 'md',
    variant = 'primary',
    label,
    showLabel = false,
    className,
    'aria-label': ariaLabelProp,
    ...props
  },
  ref,
) {
  const currentSize = sizeClasses[size] ?? sizeClasses.md;
  const currentVariant = variantClasses[variant] ?? variantClasses.primary;
  const accessibleLabel = label ?? ariaLabelProp ?? 'Chargement en cours';

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn('inline-flex items-center justify-center', currentSize.gap, className)}
      {...props}
    >
      <span
        className={cn(
          'shrink-0 animate-spin rounded-full',
          currentSize.spinner,
          currentVariant.ring,
        )}
        aria-hidden="true"
      />
      {showLabel && label ? (
        <span className={cn('font-medium', currentSize.text, currentVariant.text)}>
          {label}
        </span>
      ) : (
        <span className="sr-only">{accessibleLabel}</span>
      )}
    </div>
  );
});
