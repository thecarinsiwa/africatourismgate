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

const sizeClasses: Record<SpinnerSize, { icon: string; text: string; gap: string }> = {
  xs: { icon: 'h-3 w-3', text: 'text-xs', gap: 'gap-1.5' },
  sm: { icon: 'h-4 w-4', text: 'text-xs', gap: 'gap-2' },
  md: { icon: 'h-6 w-6', text: 'text-sm', gap: 'gap-2.5' },
  lg: { icon: 'h-8 w-8', text: 'text-base', gap: 'gap-3' },
  xl: { icon: 'h-12 w-12', text: 'text-lg', gap: 'gap-3.5' },
};

const variantClasses: Record<SpinnerVariant, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  current: 'text-current',
  white: 'text-white',
  muted: 'text-atg-muted',
};

const DOTS = [
  { rotate: 0, r: 2.2, opacity: 1 },
  { rotate: 30, r: 2.0, opacity: 0.9 },
  { rotate: 60, r: 1.8, opacity: 0.8 },
  { rotate: 90, r: 1.6, opacity: 0.7 },
  { rotate: 120, r: 1.4, opacity: 0.6 },
  { rotate: 150, r: 1.25, opacity: 0.5 },
  { rotate: 180, r: 1.1, opacity: 0.42 },
  { rotate: 210, r: 0.95, opacity: 0.34 },
  { rotate: 240, r: 0.82, opacity: 0.26 },
  { rotate: 270, r: 0.72, opacity: 0.2 },
  { rotate: 300, r: 0.62, opacity: 0.14 },
  { rotate: 330, r: 0.52, opacity: 0.08 },
];

export function SpinnerDotsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('animate-spin', className)}
      aria-hidden="true"
    >
      {DOTS.map((dot, index) => (
        <circle
          key={index}
          cx="12"
          cy="3.5"
          r={dot.r}
          opacity={dot.opacity}
          transform={`rotate(${dot.rotate} 12 12)`}
        />
      ))}
    </svg>
  );
}

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
      <SpinnerDotsIcon className={cn('shrink-0', currentSize.icon, currentVariant)} />
      {showLabel && label ? (
        <span className={cn('font-medium', currentSize.text, currentVariant)}>
          {label}
        </span>
      ) : (
        <span className="sr-only">{accessibleLabel}</span>
      )}
    </div>
  );
});
