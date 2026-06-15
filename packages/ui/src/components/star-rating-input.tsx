'use client';

import { useId } from 'react';
import { cn } from '../lib/cn';

export type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  step?: 0.5 | 1;
  disabled?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
};

function StarIcon({ filled, half }: { filled: boolean; half?: boolean }) {
  if (half) {
    return (
      <svg className="h-7 w-7 text-atg-warning" viewBox="0 0 24 24" aria-hidden>
        <defs>
          <linearGradient id="half-star">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          fill="url(#half-star)"
          stroke="currentColor"
          strokeWidth={1.5}
          d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 22 12 18.27 5.8 22l1.2-7.86-5-4.87 7.1-1.01L12 2z"
        />
      </svg>
    );
  }

  return (
    <svg
      className={cn('h-7 w-7', filled ? 'text-atg-warning' : 'text-atg-border')}
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

export function StarRatingInput({
  value,
  onChange,
  max = 5,
  step = 0.5,
  disabled = false,
  label,
  hint,
  error,
  className,
}: StarRatingInputProps) {
  const id = useId();
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  function handleStarClick(star: number, event: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const isLeftHalf = event.clientX - rect.left < rect.width / 2;
    const next = step === 0.5 ? (isLeftHalf ? star - 0.5 : star) : star;
    onChange(value === next ? 0 : next);
  }

  return (
    <div className={cn('w-full', className)}>
      {label ? (
        <span id={id} className="mb-2 block text-sm font-medium text-atg-fg">
          {label}
        </span>
      ) : null}
      <div
        role="radiogroup"
        aria-labelledby={label ? id : undefined}
        aria-label={label ? undefined : 'Classement étoiles'}
        className="flex items-center gap-0.5"
      >
        {stars.map((star) => {
          const filled = value >= star;
          const half = step === 0.5 && value >= star - 0.5 && value < star;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={(e) => handleStarClick(star, e)}
              className={cn(
                'rounded p-0.5 transition-opacity hover:opacity-80',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                disabled && 'cursor-not-allowed opacity-50',
              )}
              aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
              aria-checked={filled || half}
              role="radio"
            >
              <StarIcon filled={filled} half={half} />
            </button>
          );
        })}
        <span className="ml-2 text-sm tabular-nums text-atg-muted">
          {value > 0 ? `${value} / ${max}` : '—'}
        </span>
      </div>
      {hint && !error ? (
        <p className="mt-1.5 text-xs text-atg-muted">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
