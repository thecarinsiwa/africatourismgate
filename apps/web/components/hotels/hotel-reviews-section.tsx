'use client';

import type { Review } from '@africatourismgate/types';
import { useCallback, useEffect, useState } from 'react';
import { getPropertyReviews } from '../../lib/api/public';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';
import type { Translations } from '../../lib/i18n/translations';
import { getGuestInitials } from '../../lib/reviews/guest-initials';
import { StarRating } from './star-rating';

type HotelReviewsLabels = Pick<
  Translations['hotels'],
  | 'reviewsTitle'
  | 'guestRating'
  | 'reviews'
  | 'noReviews'
  | 'reviewsLoading'
  | 'reviewsLoadError'
  | 'loadMoreReviews'
  | 'anonymousGuest'
>;

type HotelReviewsSectionProps = {
  propertyId: string;
  averageRating: number | null;
  reviewCount: number;
  labels: HotelReviewsLabels;
  localeTag: string;
};

function ReviewCard({
  review,
  labels,
  localeTag,
}: {
  review: Review;
  labels: HotelReviewsLabels;
  localeTag: string;
}) {
  const author = review.authorFirstName?.trim() || labels.anonymousGuest;
  const initials = getGuestInitials(
    review.authorFirstName?.trim() || labels.anonymousGuest,
  );

  return (
    <article className="rounded-xl border border-atg-border bg-atg-elevated p-4 dark:border-atg-border dark:bg-atg-elevated">
      <div className="flex gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-atg-fg">{author}</span>
              <StarRating value={review.rating} size="sm" />
              <span className="text-sm font-semibold text-atg-fg">
                {review.rating}/5
              </span>
            </div>
            <time
              className="text-xs text-atg-muted"
              dateTime={review.createdAt}
            >
              {formatRelativeReviewDate(review.createdAt, localeTag)}
            </time>
          </div>
          {review.title ? (
            <h3 className="mt-3 text-sm font-semibold text-atg-fg">
              {review.title}
            </h3>
          ) : null}
          {review.body ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-atg-muted">
              {review.body}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function HotelReviewsSection({
  propertyId,
  averageRating,
  reviewCount,
  labels,
  localeTag,
}: HotelReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (pageNum === 1) {
        setLoading(true);
        setError(false);
      } else {
        setLoadingMore(true);
      }

      try {
        const result = await getPropertyReviews(propertyId, { page: pageNum, limit: 5 });
        setReviews((prev) => (append ? [...prev, ...result.data] : result.data));
        setTotalPages(result.meta.totalPages);
        setPage(pageNum);
      } catch {
        if (pageNum === 1) setError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [propertyId],
  );

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  const hasMore = page < totalPages;

  return (
    <section id="reviews" aria-labelledby="hotel-reviews-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="hotel-reviews-heading"
            className="text-lg font-bold text-atg-fg"
          >
            {labels.reviewsTitle}
          </h2>
          {reviewCount > 0 && averageRating != null ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StarRating value={averageRating} />
              <span className="text-sm font-semibold text-atg-fg">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-atg-muted">
                · {reviewCount} {labels.reviews}
              </span>
            </div>
          ) : null}
        </div>
        {reviewCount > 0 ? (
          <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
            {labels.guestRating}
          </p>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-atg-muted">{labels.reviewsLoading}</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {labels.reviewsLoadError}
        </p>
      ) : reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-atg-border bg-atg-elevated px-4 py-8 text-center text-sm text-atg-muted dark:border-atg-border dark:bg-atg-elevated text-atg-muted">
          {labels.noReviews}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              labels={labels}
              localeTag={localeTag}
            />
          ))}
          {hasMore ? (
            <button
              type="button"
              onClick={() => void loadPage(page + 1, true)}
              disabled={loadingMore}
              className="min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-60 dark:border-atg-border dark:bg-atg-elevated"
            >
              {loadingMore ? labels.reviewsLoading : labels.loadMoreReviews}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
