import { cn } from '../lib/cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Ligne décorative orange au-dessus de la carte. */
  accent?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const paddingClasses = {
  none: '',
  sm: 'px-5 py-6',
  md: 'px-8 py-10',
  lg: 'px-10 py-12',
};

export function Card({
  accent = false,
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div className={cn(accent && 'relative', className)} {...props}>
      {accent && (
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
      )}
      <div
        className={cn(
          'rounded-2xl border border-atg-border bg-atg-elevated shadow-lg shadow-black/5 dark:shadow-2xl dark:shadow-black/40',
          paddingClasses[padding],
        )}
      >
        {children}
      </div>
    </div>
  );
}
