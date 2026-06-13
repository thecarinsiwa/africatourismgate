'use client';

import { cn } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

const SLIDE_IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Zanzibar_beach.jpg/1280px-Zanzibar_beach.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Koutoubia_Mosque%2C_Marrakech.jpg/1280px-Koutoubia_Mosque%2C_Marrakech.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Table_Mountain_DanieVDM.jpg/1280px-Table_Mountain_DanieVDM.jpg',
];

const AUTO_PLAY_MS = 5500;

type Slide = {
  title: string;
  caption: string;
  image: string;
};

type Props = {
  className?: string;
};

export function AuthVisualCarousel({ className }: Props) {
  const t = useTranslations('auth.shell.carousel');
  const rawSlides = t.raw('slides') as Array<{ title: string; caption: string }>;
  const slides: Slide[] = rawSlides.map((slide, index) => ({
    ...slide,
    image: SLIDE_IMAGES[index] ?? SLIDE_IMAGES[0],
  }));

  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const scrollToSlide = useCallback((index: number) => {
    const normalized = (index + slides.length) % slides.length;
    slideRefs.current[normalized]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
    setCurrent(normalized);
  }, [slides.length]);

  const next = useCallback(() => {
    scrollToSlide(currentRef.current + 1);
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
      { root: viewport, threshold: [0.5, 0.65, 0.8] },
    );

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, [slides.length]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(next, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [next]);

  return (
    <div
      className={cn('relative w-full max-w-2xl', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={t('ariaLabel')}
    >
      <div
        ref={viewportRef}
        className={cn(
          'flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'px-[calc((100%-72%)/2)]',
        )}
      >
        {slides.map((item, index) => {
          const isActive = index === current;

          return (
            <article
              key={item.title}
              ref={(element) => {
                slideRefs.current[index] = element;
              }}
              data-index={index}
              className={cn(
                'relative aspect-[4/5] w-[72%] shrink-0 snap-center overflow-hidden rounded-md border-0 bg-black/20 shadow-2xl backdrop-blur-sm transition-all duration-500',
                isActive
                  ? 'scale-100 opacity-100 shadow-black/30'
                  : 'scale-[0.96] opacity-80 shadow-black/20',
              )}
              aria-hidden={!isActive}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${item.image}")` }}
                role="img"
                aria-label={item.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">{item.caption}</p>
                <p
                  className={cn(
                    'mt-1 font-bold leading-snug text-white',
                    isActive ? 'text-base lg:text-lg' : 'text-sm lg:text-base',
                  )}
                >
                  {item.title}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2" aria-live="polite">
        {slides.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => scrollToSlide(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === current ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70',
            )}
            aria-label={`${t('goToSlide')} ${index + 1}`}
            aria-current={index === current ? 'step' : undefined}
          />
        ))}
      </div>
    </div>
  );
}
