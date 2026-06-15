'use client';

import { useId } from 'react';
import { cn } from '../lib/cn';
import { StarIcon, type StarIconSize } from './star-rating-icons';

export type StarRatingDisplayProps = {
  value: number;
  max?: number;
  size?: StarIconSize;
  /** Affiche le texte « value / max » à droite des étoiles. */
  showValue?: boolean;
  className?: string;
};

export function StarRatingDisplay({
  value,
  max = 5,
  size = 'md',
  showValue = false,
  className,
}: StarRatingDisplayProps) {
  const gradientId = useId();
  const stars = Array.from({ length: max }, (_, index) => index + 1);
  const label = `Note : ${value} sur ${max}`;

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      role="img"
      aria-label={label}
    >
      {stars.map((star) => {
        const filled = value >= star;
        const half = value >= star - 0.5 && value < star;
        return (
          <StarIcon
            key={star}
            filled={filled}
            half={half}
            size={size}
            gradientId={gradientId}
          />
        );
      })}
      {showValue ? (
        <span className="ml-1.5 text-sm tabular-nums text-atg-muted">
          {value}/{max}
        </span>
      ) : null}
    </div>
  );
}
