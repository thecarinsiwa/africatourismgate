'use client';

import type { Review } from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getPropertyReviews } from '../../lib/api/public';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';
import type { Translations } from '../../lib/i18n/message-types';
import { getGuestInitials } from '../../lib/reviews/guest-initials';
import { StarRating } from './star-rating';

const FETCH_LIMIT = 12;
const AUTO_PLAY_MS = 7000;

type HotelReviewsLabels = Pick<
  Translations['hotels'],
  | 'reviewsTitle'
  | 'guestRating'
  | 'reviews'
  | 'noReviews'
  | 'reviewsLoading'
  | 'reviewsLoadError'
  | 'reviewsCarouselAria'
  | 'reviewsPrev'
  | 'reviewsNext'
  | 'anonymousGuest'
>;

type HotelReviewsSectionProps = {
  propertyId: string;
  averageRating: number | null;
  reviewCount: number;
  labels: HotelReviewsLabels;
  localeTag: string;
};

function GuestAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  const [broken, setBroken] = useState(false);
  const src = avatarUrl?.trim()
    ? normalizeBrandingAssetUrl(avatarUrl.trim())
    : null;
  const showImage = Boolean(src && !broken);
  const initials = getGuestInitials(name);

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white"
      aria-hidden={!showImage}
    >
      {showImage ? (
        <img
          src={src!}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
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
    <article className="flex h-full flex-col rounded-xl border border-atg-border bg-atg-elevated p-4 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
      <div className="flex gap-3">
        <GuestAvatar name={author} avatarUrl={review.authorAvatarUrl} />
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
        </div>
      </div>
      {review.title ? (
        <h3 className="mt-3 text-sm font-semibold text-atg-fg">{review.title}</h3>
      ) : null}
      {review.body ? (
        <p className="mt-2 line-clamp-5 flex-1 whitespace-pre-line text-sm leading-relaxed text-atg-muted">
          {review.body}
        </p>
      ) : null}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void getPropertyReviews(propertyId, { page: 1, limit: FETCH_LIMIT })
      .then((result) => {
        if (cancelled) return;
        setReviews(result.data);
        setCurrent(0);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setReviews([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    if (current >= reviews.length) {
      setCurrent(0);
    }
  }, [current, reviews.length]);

  const scrollToSlide = useCallback(
    (index: number) => {
      if (reviews.length === 0) return;
      const normalized = (index + reviews.length) % reviews.length;
      const viewport = viewportRef.current;
      const slide = slideRefs.current[normalized];
      if (!viewport || !slide) return;

      const targetLeft =
        slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;

      viewport.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth',
      });
      setCurrent(normalized);
    },
    [reviews.length],
  );

  const next = useCallback(() => {
    scrollToSlide(currentRef.current + 1);
  }, [scrollToSlide]);

  const prev = useCallback(() => {
    scrollToSlide(currentRef.current - 1);
  }, [scrollToSlide]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || reviews.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const index = Number(visible.target.getAttribute('data-index'));
        if (!Number.isNaN(index)) {
          setCurrent((prevIndex) => (prevIndex === index ? prevIndex : index));
        }
      },
      { root: viewport, threshold: [0.55, 0.7, 0.85] },
    );

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, [reviews.length]);

  useEffect(() => {
    if (loading || reviews.length <= 1) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(next, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [loading, next, reviews.length]);

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
        <p className="rounded-lg border border-dashed border-atg-border bg-atg-elevated px-4 py-8 text-center text-sm text-atg-muted dark:border-atg-border dark:bg-atg-elevated">
          {labels.noReviews}
        </p>
      ) : (
        <div
          className="relative"
          role="region"
          aria-roledescription="carousel"
          aria-label={labels.reviewsCarouselAria}
        >
          <div
            ref={viewportRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((review, index) => (
              <div
                key={review.id}
                ref={(element) => {
                  slideRefs.current[index] = element;
                }}
                data-index={index}
                className="w-[88%] shrink-0 snap-center sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.675rem)]"
              >
                <ReviewCard
                  review={review}
                  labels={labels}
                  localeTag={localeTag}
                />
              </div>
            ))}
          </div>

          {reviews.length > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={prev}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-atg-border bg-atg-elevated text-atg-fg transition-colors hover:border-primary hover:text-primary"
                aria-label={labels.reviewsPrev}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {reviews.map((review, index) => (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => scrollToSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === current
                        ? 'w-8 bg-primary'
                        : 'w-2.5 bg-atg-muted/40'
                    }`}
                    aria-label={`${index + 1} / ${reviews.length}`}
                    aria-current={index === current ? 'true' : undefined}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={next}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-atg-border bg-atg-elevated text-atg-fg transition-colors hover:border-primary hover:text-primary"
                aria-label={labels.reviewsNext}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
