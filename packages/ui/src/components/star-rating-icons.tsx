import { cn } from '../lib/cn';

export type StarIconSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<StarIconSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

type StarIconProps = {
  filled: boolean;
  half?: boolean;
  size?: StarIconSize;
  /** Unique id for half-star gradient (required when multiple half stars on page). */
  gradientId?: string;
};

export function StarIcon({
  filled,
  half,
  size = 'lg',
  gradientId = 'half-star',
}: StarIconProps) {
  const sizeClass = sizeClasses[size];

  if (half) {
    return (
      <svg className={cn(sizeClass, 'text-atg-warning')} viewBox="0 0 24 24" aria-hidden>
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gradientId})`}
          stroke="currentColor"
          strokeWidth={1.5}
          d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 22 12 18.27 5.8 22l1.2-7.86-5-4.87 7.1-1.01L12 2z"
        />
      </svg>
    );
  }

  return (
    <svg
      className={cn(sizeClass, filled ? 'text-atg-warning' : 'text-atg-border')}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.5}
        d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 22 12 18.27 5.8 22l1.2-7.86-5-4.87 7.1-1.01L12 2z"
      />
    </svg>
  );
}
