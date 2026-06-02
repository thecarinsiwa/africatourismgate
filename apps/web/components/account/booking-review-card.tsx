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
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-atg-border dark:bg-white/5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {labels.yourReview}
        </h3>
        <time className="text-xs text-gray-500 dark:text-atg-muted" dateTime={review.createdAt}>
          {formatReviewDate(review.createdAt, localeTag)}
        </time>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <StarRating value={review.rating} size="sm" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {review.rating}/5
        </span>
      </div>
      {review.title ? (
        <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">{review.title}</p>
      ) : null}
      {review.body ? (
        <p className="mt-2 whitespace-pre-line text-sm text-gray-600 dark:text-atg-muted">
          {review.body}
        </p>
      ) : null}
    </div>
  );
}
