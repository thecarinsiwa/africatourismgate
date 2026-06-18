'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from '../../lib/i18n/locale-provider';

const SLIDE_IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/d/de/Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/48/Volcanoes_National_Park_Banner_Image.gif',
  'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/95/Serengeti_-_Stefan_Swanepoel.jpg',
];

const AUTO_PLAY_INTERVAL = 6000;

export function HeroSlider() {
  const t = useTranslations();
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [paused, setPaused] = useState(false);

  const slides = t.hero.slides.map((slide, i) => ({
    ...slide,
    image: SLIDE_IMAGES[i] ?? SLIDE_IMAGES[0],
  }));

  const goTo = useCallback(
    (idx: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setCurrent(idx);
      setTimeout(() => setTransitioning(false), 800);
    },
    [transitioning],
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo, slides.length]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion || paused) return;
    const timer = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next, reduceMotion, paused]);

  const slide = slides[current];

  return (
    <section
      className="relative h-[520px] sm:h-[600px] lg:h-[680px] overflow-hidden"
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
          key={i}
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
        <div key={current} className="hero-slide-content max-w-3xl px-6">
          <p className="hero-subtitle text-sm sm:text-base font-medium tracking-widest text-white/90 uppercase mb-3">
            {slide.subtitle}
          </p>
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
            {slide.title}
          </h1>
          <p className="hero-desc mt-5 text-sm sm:text-base text-white/85 max-w-2xl mx-auto leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
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

      <button
        type="button"
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm hover:bg-black/50 hover:text-white transition-all"
        aria-label={t.hero.prev}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => goTo((current + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm hover:bg-black/50 hover:text-white transition-all"
        aria-label={t.hero.next}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
