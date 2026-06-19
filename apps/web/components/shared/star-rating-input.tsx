'use client';

import { cn } from '@africatourismgate/ui';

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

export type StarRatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
  ratingAria: (n: number) => string;
  groupAriaLabel?: string;
  disabled?: boolean;
  className?: string;
};

export function StarRatingInput({
  value,
  onChange,
  ratingAria,
  groupAriaLabel,
  disabled = false,
  className,
}: StarRatingInputProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, star: number) {
    if (disabled) return;
    const base = value > 0 ? value : star;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(Math.min(5, base + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(Math.max(1, base - 1));
    }
  }

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="radiogroup"
      aria-label={groupAriaLabel}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={ratingAria(star)}
            disabled={disabled}
            onClick={() => onChange(star)}
            onKeyDown={(event) => handleKeyDown(event, star)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
          >
            <svg
              className={cn(
                'h-8 w-8',
                filled ? 'text-atg-warning' : 'text-atg-border dark:text-white/25',
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden
            >
              <path d={STAR_PATH} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
