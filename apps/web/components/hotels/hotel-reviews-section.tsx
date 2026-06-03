'use client';

import type { Review } from '@africatourismgate/types';
import { useCallback, useEffect, useState } from 'react';
import { getPropertyReviews } from '../../lib/api/public';
import type { Translations } from '../../lib/i18n/translations';
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

function formatReviewDate(iso: string, localeTag: string): string {
  return new Date(iso).toLocaleDateString(localeTag, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

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

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-4 dark:border-atg-border dark:bg-atg-elevated">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size="sm" />
          <span className="text-sm font-semibold text-[#0f1a16] dark:text-white">
            {review.rating}/5
          </span>
        </div>
        <time
          className="text-xs text-gray-500 dark:text-atg-muted"
          dateTime={review.createdAt}
        >
          {formatReviewDate(review.createdAt, localeTag)}
        </time>
      </div>
      {review.title ? (
        <h3 className="mt-3 text-sm font-semibold text-[#0f1a16] dark:text-white">
          {review.title}
        </h3>
      ) : null}
      {review.body ? (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-atg-muted">
          {review.body}
        </p>
      ) : null}
      <p className="mt-3 text-xs font-medium text-gray-500 dark:text-atg-muted">{author}</p>
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
            className="text-lg font-bold text-[#0f1a16] dark:text-white"
          >
            {labels.reviewsTitle}
          </h2>
          {reviewCount > 0 && averageRating != null ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StarRating value={averageRating} />
              <span className="text-sm font-semibold text-[#0f1a16] dark:text-white">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-atg-muted">
                · {reviewCount} {labels.reviews}
              </span>
            </div>
          ) : null}
        </div>
        {reviewCount > 0 ? (
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-atg-muted">
            {labels.guestRating}
          </p>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 dark:text-atg-muted">{labels.reviewsLoading}</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {labels.reviewsLoadError}
        </p>
      ) : reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 dark:border-atg-border dark:bg-atg-elevated dark:text-atg-muted">
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
              className="min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-60 dark:border-atg-border dark:bg-atg-elevated"
            >
              {loadingMore ? labels.reviewsLoading : labels.loadMoreReviews}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
