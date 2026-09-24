import { cn } from '../lib/cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Ligne décorative au-dessus de la carte (auth / marketing). */
  accent?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** `dashboard` : coins et ombre légers pour le tableau de bord admin. */
  variant?: 'default' | 'dashboard';
};

const paddingClasses = {
  none: '',
  sm: 'p-4 sm:p-5',
  md: 'px-4 py-5 sm:px-8 sm:py-10',
  lg: 'px-5 py-6 sm:px-10 sm:py-12',
};

const variantClasses = {
  default:
    'rounded-2xl border border-atg-border bg-atg-elevated shadow-lg shadow-black/5 dark:shadow-2xl dark:shadow-black/40',
  dashboard:
    'rounded-xl border border-atg-border bg-atg-elevated shadow-sm shadow-black/[0.04] dark:shadow-black/20',
};

export function Card({
  accent = false,
  padding = 'md',
  variant = 'default',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'min-w-0',
        variantClasses[variant],
        paddingClasses[padding],
        accent && 'relative',
        className,
      )}
      {...props}
    >
      {accent ? (
        <>
          <div
            className="absolute left-1/2 top-0 h-16 w-px -translate-x-1/2 -translate-y-full bg-primary"
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-0 h-1 w-12 -translate-x-1/2 rounded-full bg-primary"
            aria-hidden
          />
        </>
      ) : null}
      {children}
    </div>
  );
}
