'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Review } from '@africatourismgate/types';
import { getPublicFeaturedReviews } from '../../lib/api/public';
import { useAppLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { useScrollAnimation } from './use-scroll-animation';

const AUTO_PLAY_MS = 6000;
const FETCH_LIMIT = 12;

type ReviewSlide = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
};

function formatAuthorName(firstName: string | null, anonymousLabel: string): string {
  const trimmed = firstName?.trim();
  if (!trimmed) return anonymousLabel;
  return trimmed;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className={`h-4 w-4 ${index < rating ? 'text-amber-400' : 'text-atg-muted/40'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewSlide }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-sm dark:bg-atg-surface">
      <Stars rating={review.rating} />
      {review.title ? (
        <h3 className="mt-4 text-base font-bold text-atg-fg">{review.title}</h3>
      ) : null}
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-atg-muted">
        &ldquo;{review.body}&rdquo;
      </blockquote>
      <p className="mt-5 text-sm font-semibold text-atg-fg">{review.authorName}</p>
    </article>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className="h-full rounded-2xl border border-atg-border bg-atg-elevated p-6 dark:bg-atg-surface">
      <div className="h-4 w-24 animate-pulse rounded bg-atg-surface" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-atg-surface" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-atg-surface" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-atg-surface" />
      </div>
      <div className="mt-5 h-4 w-28 animate-pulse rounded bg-atg-surface" />
    </div>
  );
}

export function CustomerReviewsCarousel() {
  const t = useTranslations();
  const locale = useAppLocale();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [reviews, setReviews] = useState<ReviewSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fallbackSlides = useMemo<ReviewSlide[]>(
    () =>
      t.customerReviews.items.map((item, index) => ({
        id: `fallback-${index}`,
        rating: item.rating,
        title: item.title ?? null,
        body: item.body,
        authorName: item.author,
      })),
    [t.customerReviews.items],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void getPublicFeaturedReviews({ limit: FETCH_LIMIT })
      .then((data) => {
        if (cancelled) return;
        const slides = data
          .filter((review) => review.body?.trim())
          .map((review: Review) => ({
            id: review.id,
            rating: review.rating,
            title: review.title,
            body: review.body!.trim(),
            authorName: formatAuthorName(review.authorFirstName, t.customerReviews.anonymous),
          }));
        setReviews(slides.length > 0 ? slides : fallbackSlides);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setReviews(fallbackSlides);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fallbackSlides, locale, t.customerReviews.anonymous]);

  const slides = reviews.length > 0 ? reviews : fallbackSlides;

  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [current, slides.length]);

  const scrollToSlide = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      const normalized = (index + slides.length) % slides.length;
      slideRefs.current[normalized]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      setCurrent(normalized);
    },
    [slides.length],
  );

  const next = useCallback(() => {
    scrollToSlide(currentRef.current + 1);
  }, [scrollToSlide]);

  const prev = useCallback(() => {
    scrollToSlide(currentRef.current - 1);
  }, [scrollToSlide]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const index = Number(visible.target.getAttribute('data-index'));
        if (!Number.isNaN(index)) {
          setCurrent(index);
        }
      },
      { root: viewport, threshold: [0.55, 0.7, 0.85] },
    );

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, [slides.length]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || slides.length <= 1) return;

    const timer = window.setInterval(next, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [next, slides.length]);

  if (!loading && slides.length === 0) {
    return null;
  }

  return (
    <section
      ref={ref}
      className="bg-atg-surface py-16 transition-colors dark:bg-atg-surface sm:py-20"
      aria-labelledby="customer-reviews-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-10 max-w-2xl mx-auto text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <h2
            id="customer-reviews-heading"
            className="text-2xl font-bold uppercase tracking-wide text-atg-fg sm:text-3xl"
          >
            {t.customerReviews.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-atg-muted">
            {t.customerReviews.subtitle}
          </p>
        </div>

        {error ? (
          <p className="mb-6 text-center text-sm text-atg-muted" role="status">
            {t.customerReviews.loadError}
          </p>
        ) : null}

        <div
          className={`relative ${isVisible ? 'animate-fade-in-up delay-150' : 'opacity-0'}`}
          role="region"
          aria-roledescription="carousel"
          aria-label={t.customerReviews.carouselAria}
        >
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <ReviewCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              <div
                ref={viewportRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {slides.map((review, index) => (
                  <div
                    key={review.id}
                    ref={(element) => {
                      slideRefs.current[index] = element;
                    }}
                    data-index={index}
                    className="w-[85%] shrink-0 snap-center sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                  >
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>

              {slides.length > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={prev}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-atg-border bg-atg-elevated text-atg-fg transition-colors hover:border-primary hover:text-primary"
                    aria-label={t.customerReviews.prev}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-2">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => scrollToSlide(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          index === current ? 'w-8 bg-primary' : 'w-2.5 bg-atg-muted/40'
                        }`}
                        aria-label={`${index + 1} / ${slides.length}`}
                        aria-current={index === current ? 'true' : undefined}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={next}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-atg-border bg-atg-elevated text-atg-fg transition-colors hover:border-primary hover:text-primary"
                    aria-label={t.customerReviews.next}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
