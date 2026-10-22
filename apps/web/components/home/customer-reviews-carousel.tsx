'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Review, ReviewSource } from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import { useLocale, useTranslations } from 'next-intl';
import {
  getPublicFeaturedReviews,
  getPublicHomepageReviews,
} from '../../lib/api/public';
import { getGuestInitials } from '../../lib/reviews/guest-initials';
import { useScrollAnimation } from './use-scroll-animation';

const AUTO_PLAY_MS = 6000;
const FETCH_LIMIT = 12;

type ReviewSlide = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  authorAvatarUrl: string | null;
  source: ReviewSource;
};

type ReviewFallbackItem = {
  rating: number;
  title?: string;
  body: string;
  author: string;
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

function TripadvisorOwlIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 3c-2.2 0-4.1 1.1-5.2 2.8C5.2 4.9 3.4 4 1.5 4v2.2c1.2 0 2.3.5 3.1 1.3C3.6 8.7 3 10.3 3 12c0 5 4 9 9 9s9-4 9-9c0-1.7-.6-3.3-1.6-4.5.8-.8 1.9-1.3 3.1-1.3V4c-1.9 0-3.7.9-4.8 2.3C16.1 4.6 14.2 3 12 3zm-3.2 8.2a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2zm6.4 0a1.6 1.6 0 110 3.2 1.6 1.6 0 010-3.2zM8.5 16.2c.9.9 2.1 1.4 3.5 1.4s2.6-.5 3.5-1.4c.2-.2.2-.5 0-.7-.2-.2-.5-.2-.7 0-.7.7-1.7 1.1-2.8 1.1s-2.1-.4-2.8-1.1c-.2-.2-.5-.2-.7 0-.2.2-.2.5 0 .7z" />
    </svg>
  );
}

function VerifiedMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SourceBadge({
  source,
  label,
}: {
  source: ReviewSource;
  label: string;
}) {
  const isTripadvisor = source === 'tripadvisor';
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
        isTripadvisor
          ? 'bg-[#00AA6C]/12 text-[#007A4D] dark:bg-[#00AA6C]/20 dark:text-[#5DDCAB]'
          : 'bg-primary/10 text-primary'
      }`}
    >
      {isTripadvisor ? (
        <TripadvisorOwlIcon className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <VerifiedMarkIcon className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}

function AuthorAvatar({
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

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white ring-2 ring-atg-border/40">
      {showImage ? (
        <img
          src={src!}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span aria-hidden>{getGuestInitials(name)}</span>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  sourceLabel,
}: {
  review: ReviewSlide;
  sourceLabel: string;
}) {
  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-sm dark:bg-atg-surface">
      <div className="absolute right-4 top-4">
        <SourceBadge source={review.source} label={sourceLabel} />
      </div>
      <div className="pr-28 sm:pr-32">
        <Stars rating={review.rating} />
      </div>
      {review.title ? (
        <h3 className="mt-4 text-base font-bold text-atg-fg">{review.title}</h3>
      ) : null}
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-atg-muted">
        &ldquo;{review.body}&rdquo;
      </blockquote>
      <div className="mt-5 flex items-center gap-3">
        <AuthorAvatar name={review.authorName} avatarUrl={review.authorAvatarUrl} />
        <p className="min-w-0 text-sm font-semibold text-atg-fg">{review.authorName}</p>
      </div>
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
      <div className="mt-5 flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-atg-surface" />
        <div className="h-4 w-28 animate-pulse rounded bg-atg-surface" />
      </div>
    </div>
  );
}

export function CustomerReviewsCarousel() {
  const t = useTranslations('customerReviews');
  const locale = useLocale();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [reviews, setReviews] = useState<ReviewSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionHidden, setSectionHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fallbackItems = t.raw('items') as ReviewFallbackItem[];
    const buildFallbackSlides = (): ReviewSlide[] =>
      fallbackItems.map((item, index) => ({
        id: `fallback-${index}`,
        rating: item.rating,
        title: item.title ?? null,
        body: item.body,
        authorName: item.author,
        authorAvatarUrl: null,
        source: 'platform' as const,
      }));

    setLoading(true);
    setSectionHidden(false);

    void (async () => {
      try {
        const settings = await getPublicHomepageReviews();
        if (cancelled) return;

        const platformOn = settings.showPlatformReviews === true;
        const tripadvisorOn = settings.showTripadvisorReviews === true;
        if (!platformOn && !tripadvisorOn) {
          setSectionHidden(true);
          setReviews([]);
          return;
        }

        try {
          const data = await getPublicFeaturedReviews({ limit: FETCH_LIMIT });
          if (cancelled) return;
          const anonymousLabel = t('anonymous');
          const slides = data
            .filter((review) => review.body?.trim())
            .map((review: Review) => ({
              id: review.id,
              rating: review.rating,
              title: review.title,
              body: review.body!.trim(),
              authorName: formatAuthorName(review.authorFirstName, anonymousLabel),
              authorAvatarUrl:
                review.source === 'tripadvisor'
                  ? null
                  : review.authorAvatarUrl?.trim() || null,
              source: review.source ?? 'platform',
            }));

          if (slides.length > 0) {
            setReviews(slides);
          } else if (platformOn) {
            setReviews(buildFallbackSlides());
          } else {
            setReviews([]);
          }
        } catch {
          if (cancelled) return;
          if (platformOn) {
            setReviews(buildFallbackSlides());
          } else {
            setReviews([]);
          }
        }
      } catch {
        if (cancelled) return;
        setReviews(buildFallbackSlides());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale, t]);

  const slides = reviews;

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
          setCurrent((prev) => (prev === index ? prev : index));
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
    if (loading || !isVisible) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || slides.length <= 1) return;

    const timer = window.setInterval(next, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [isVisible, loading, next, slides.length]);

  if (sectionHidden || (!loading && slides.length === 0)) {
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
            {t('title')}
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-atg-muted">
            {t('subtitle')}
          </p>
        </div>

        <div
          className={`relative ${isVisible ? 'animate-fade-in-up delay-150' : 'opacity-0'}`}
          role="region"
          aria-roledescription="carousel"
          aria-label={t('carouselAria')}
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
                className={`flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                  slides.length <= 3 ? 'justify-center' : ''
                }`}
              >
                {slides.map((review, index) => (
                  <div
                    key={review.id}
                    ref={(element) => {
                      slideRefs.current[index] = element;
                    }}
                    data-index={index}
                    className={`shrink-0 snap-center ${
                      slides.length === 1
                        ? 'w-full max-w-md sm:w-[min(100%,28rem)]'
                        : 'w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]'
                    }`}
                  >
                    <ReviewCard
                      review={review}
                      sourceLabel={
                        review.source === 'tripadvisor'
                          ? t('badges.tripadvisor')
                          : t('badges.platform')
                      }
                    />
                  </div>
                ))}
              </div>

              {slides.length > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={prev}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-atg-border bg-atg-elevated text-atg-fg transition-colors hover:border-primary hover:text-primary"
                    aria-label={t('prev')}
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
                    aria-label={t('next')}
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
