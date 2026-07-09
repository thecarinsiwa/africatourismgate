'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPublicHeroSlidesForLocale } from '../../lib/api/public';
import { useAppLocale, useTranslations } from '../../lib/i18n/locale-provider';

const FALLBACK_IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/d/de/Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/1b/Koutoubia_Mosque%2C_Marrakech.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6a/Zanzibar_beach.jpg',
];

const AUTO_PLAY_INTERVAL = 6000;

type HeroSlideView = {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  image: string;
  href?: string;
};

function buildFallbackSlides(
  slides: { subtitle: string; title: string; description: string }[],
): HeroSlideView[] {
  return slides.map((slide, index) => ({
    id: `fallback-${index}`,
    ...slide,
    image: FALLBACK_IMAGES[index] ?? FALLBACK_IMAGES[0],
  }));
}

export function HeroSlider() {
  const t = useTranslations();
  const locale = useAppLocale();
  const fallbackSlides = useMemo(() => buildFallbackSlides(t.hero.slides), [t.hero.slides]);
  const [slides, setSlides] = useState<HeroSlideView[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const currentRef = useRef(0);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    setSlides(fallbackSlides);
  }, [fallbackSlides]);

  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [current, slides.length]);

  useEffect(() => {
    let cancelled = false;

    void getPublicHeroSlidesForLocale(locale)
      .then(({ slides: apiSlides, usedLocaleFallback }) => {
        if (cancelled || apiSlides.length === 0 || usedLocaleFallback) return;

        const localizedSlides = apiSlides.filter((slide) => slide.locale === locale);
        if (localizedSlides.length === 0) return;

        setSlides(
          localizedSlides.map((slide) => ({
            id: slide.id,
            subtitle: slide.subtitle,
            title: slide.title,
            description: slide.description,
            image: slide.imageUrl,
            href: slide.href ?? undefined,
          })),
        );
      })
      .catch(() => {
        // Keep translation fallbacks when the API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      setCurrent((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  const next = useCallback(() => {
    goTo(currentRef.current + 1);
  }, [goTo]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion || paused || slides.length <= 1) return;
    const timer = window.setInterval(next, AUTO_PLAY_INTERVAL);
    return () => window.clearInterval(timer);
  }, [next, paused, reduceMotion, slides.length]);

  const slide = slides[current] ?? slides[0];
  if (!slide) return null;

  return (
    <section
      className="relative h-[520px] overflow-hidden sm:h-[600px] lg:h-[680px]"
      role="region"
      aria-roledescription="carousel"
      aria-label={t.hero.slides[0]?.title ?? 'Hero'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          <Image
            src={s.image}
            alt=""
            fill
            className="object-cover"
            priority={i === 0}
            loading={i === 0 ? undefined : 'lazy'}
            sizes="100vw"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      <div className="relative flex h-full items-center justify-center text-center">
        <div key={slide.id} className="hero-slide-content max-w-3xl px-6" aria-live="polite">
          <p className="hero-subtitle mb-3 text-sm font-medium uppercase tracking-widest text-white/90 sm:text-base">
            {slide.subtitle}
          </p>
          {slide.href ? (
            <h1 className="hero-title text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              <Link href={slide.href} className="transition-colors hover:text-white/90">
                {slide.title}
              </Link>
            </h1>
          ) : (
            <h1 className="hero-title text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
          )}
          {slide.description ? (
            <p className="hero-desc mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              {slide.description}
            </p>
          ) : null}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              className={`h-3 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={t.hero.goToSlide.replace('{n}', String(i + 1))}
              aria-current={i === current ? 'step' : undefined}
            />
          ))}
        </div>
      ) : null}

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            className="absolute left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white sm:flex"
            aria-label={t.hero.prev}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            className="absolute right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white sm:flex"
            aria-label={t.hero.next}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      ) : null}
    </section>
  );
}
