'use client';

import type { Review } from '@africatourismgate/types';
import { StarRating } from '../hotels/star-rating';

type BookingReviewCardLabels = {
  yourReview: string;
};

type Props = {
  review: Review;
  labels: BookingReviewCardLabels;
  localeTag: string;
};

function formatReviewDate(iso: string, localeTag: string): string {
  return new Date(iso).toLocaleDateString(localeTag, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BookingReviewCard({ review, labels, localeTag }: Props) {
  return (
    <div className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-atg-fg">
          {labels.yourReview}
        </h3>
        <time className="text-xs text-atg-muted" dateTime={review.createdAt}>
          {formatReviewDate(review.createdAt, localeTag)}
        </time>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <StarRating value={review.rating} size="sm" />
        <span className="text-sm font-medium text-atg-fg">
          {review.rating}/5
        </span>
      </div>
      {review.title ? (
        <p className="mt-3 text-sm font-medium text-atg-fg">{review.title}</p>
      ) : null}
      {review.body ? (
        <p className="mt-2 whitespace-pre-line text-sm text-atg-muted">
          {review.body}
        </p>
      ) : null}
    </div>
  );
}
