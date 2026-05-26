'use client';

import { useState, useEffect, useCallback } from 'react';

/* ── Slide data ───────────────────────────────────────── */
const SLIDES = [
  {
    subtitle: 'Bienvenue chez',
    title: 'AFRICA TOURISM GATE',
    description:
      'Votre passerelle vers les plus belles destinations africaines. Explorez, réservez et vivez des expériences inoubliables.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg',
  },
  {
    subtitle: 'Safari de 7 jours',
    title: 'MASAI MARA MAGIQUE',
    description:
      'Découvrez la migration des gnous et les Big Five dans la réserve la plus célèbre d\'Afrique.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg',
  },
  {
    subtitle: '5 jours à',
    title: 'MARRAKECH (Perle du Sud)',
    description:
      'Plongez dans les souks, les riads et les saveurs épicées de la ville ocre du Maroc.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Koutoubia_Mosque%2C_Marrakech.jpg/1280px-Koutoubia_Mosque%2C_Marrakech.jpg',
  },
  {
    subtitle: 'Croisière de 12 jours',
    title: 'ZANZIBAR À MADAGASCAR',
    description:
      'Navigation côtière le long de l\'Océan Indien — plages de rêve et faune unique.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Zanzibar_beach.jpg/1280px-Zanzibar_beach.jpg',
  },
];

const AUTO_PLAY_INTERVAL = 6000;

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

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
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  /* Auto-play */
  useEffect(() => {
    const timer = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className="relative h-[520px] sm:h-[600px] lg:h-[680px] overflow-hidden">
      {/* Background images — all layered, only current one visible */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url("${s.image}")`,
            opacity: i === current ? 1 : 0,
          }}
          role={i === current ? 'img' : undefined}
          aria-label={i === current ? s.title : undefined}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      {/* Content */}
      <div className="relative flex h-full items-center justify-center text-center">
        <div
          key={current}
          className="hero-slide-content max-w-3xl px-6"
        >
          <p className="hero-subtitle text-sm sm:text-base font-medium tracking-widest text-white/90 uppercase mb-3">
            {slide.subtitle}
          </p>
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
            {slide.title}
          </h1>
          <p className="hero-desc mt-5 text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={`h-3 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-8 bg-white'
                : 'w-3 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Aller au slide ${i + 1}`}
            aria-current={i === current ? 'step' : undefined}
          />
        ))}
      </div>

      {/* Arrow buttons */}
      <button
        type="button"
        onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm hover:bg-black/50 hover:text-white transition-all"
        aria-label="Slide précédent"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => goTo((current + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm hover:bg-black/50 hover:text-white transition-all"
        aria-label="Slide suivant"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
