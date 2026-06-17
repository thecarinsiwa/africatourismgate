import { cn } from '@africatourismgate/ui';

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

const SIZE_CLASS = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
} as const;

/** Étoiles pleines arrondies — ariaLabel fourni par le parent pour l'accessibilité i18n. */
export type StarRatingProps = {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
  /** Libellé accessible ; si absent, le composant est décoratif (aria-hidden). */
  ariaLabel?: string;
  className?: string;
};

export function StarRating({
  value,
  max = 5,
  size = 'md',
  ariaLabel,
  className,
}: StarRatingProps) {
  const rounded = Math.round(value);
  const iconClass = SIZE_CLASS[size];

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          className={cn(
            iconClass,
            i < rounded ? 'text-amber-400' : 'text-gray-300 dark:text-white/20',
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}
