'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';

/* ── Destination data ────────────────────────────────── */
const DESTINATIONS = [
  {
    city: 'Nairobi',
    country: 'Kenya',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Nairobi_Skyline_%28cropped%29.jpg/1280px-Nairobi_Skyline_%28cropped%29.jpg',
  },
  {
    city: 'Le Cap',
    country: 'Afrique du Sud',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Table_Mountain_DanieVDM.jpg/1280px-Table_Mountain_DanieVDM.jpg',
  },
  {
    city: 'Marrakech',
    country: 'Maroc',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Koutoubia_Mosque%2C_Marrakech.jpg/1280px-Koutoubia_Mosque%2C_Marrakech.jpg',
  },
  {
    city: 'Zanzibar',
    country: 'Tanzanie',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Zanzibar_beach.jpg/1280px-Zanzibar_beach.jpg',
  },
  {
    city: 'Kigali',
    country: 'Rwanda',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Kigali_skyline_2.jpg/1280px-Kigali_skyline_2.jpg',
  },
  {
    city: 'Lagos',
    country: 'Nigeria',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Lagos_Island.jpg/1280px-Lagos_Island.jpg',
  },
  {
    city: 'Accra',
    country: 'Ghana',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Independence_Arch_-_Accra%2C_Ghana.jpg/1280px-Independence_Arch_-_Accra%2C_Ghana.jpg',
  },
  {
    city: 'Le Caire',
    country: 'Égypte',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Cairo_From_Tower_of_Cairo_31march2007.jpg/1280px-Cairo_From_Tower_of_Cairo_31march2007.jpg',
  },
] as const;

/* ── Arrow button ────────────────────────────────────── */
function ScrollArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-atg-border bg-atg-elevated/90 shadow-md backdrop-blur transition-all hover:bg-atg-elevated hover:shadow-lg disabled:opacity-0 disabled:pointer-events-none ${
        direction === 'left' ? 'left-2' : 'right-2'
      }`}
      aria-label={direction === 'left' ? 'Précédent' : 'Suivant'}
    >
      <svg
        className="h-5 w-5 text-atg-fg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
        />
      </svg>
    </button>
  );
}

/* ── Main component ──────────────────────────────────── */
export function DestinationsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('.carousel-card') as HTMLElement | null;
    const distance = card ? card.offsetWidth + 16 : 300; // card width + gap
    el.scrollBy({ left: dir === 'left' ? -distance : distance, behavior: 'smooth' });
  };

  return (
    <section
      className="bg-atg-surface py-12 sm:py-16"
      aria-labelledby="destinations-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2
              id="destinations-heading"
              className="text-2xl font-bold text-atg-fg sm:text-3xl"
            >
              Trouvez votre prochaine destination
            </h2>
            <p className="mt-2 text-atg-muted">
              Des villes vibrantes aux plages paradisiaques, l&apos;Afrique n&apos;attend que vous.
            </p>
          </div>
          <Link
            href="/hotels"
            className="hidden shrink-0 text-sm font-semibold text-primary hover:underline sm:block"
          >
            Voir tout →
          </Link>
        </div>
      </div>

      {/* Carousel wrapper */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollArrow direction="left" onClick={() => scroll('left')} disabled={!canScrollLeft} />
        <ScrollArrow direction="right" onClick={() => scroll('right')} disabled={!canScrollRight} />

        <div
          ref={scrollRef}
          className="carousel-scroll flex gap-4 overflow-x-auto pb-2"
        >
          {DESTINATIONS.map((dest, i) => (
            <Link
              key={dest.city}
              href={`/hotels?destination=${encodeURIComponent(dest.city)}`}
              className={`carousel-card group relative flex h-[280px] w-[240px] flex-col justify-end overflow-hidden rounded-2xl sm:h-[320px] sm:w-[280px] animate-fade-in-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url("${dest.image}")` }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Text */}
              <div className="relative z-10 p-5">
                <h3 className="text-lg font-bold text-white">{dest.city}</h3>
                <p className="text-sm text-white/80">{dest.country}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/90 opacity-0 transition-opacity group-hover:opacity-100">
                  Voir les hôtels
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile "See all" link */}
        <div className="mt-4 text-center sm:hidden">
          <Link href="/hotels" className="text-sm font-semibold text-primary hover:underline">
            Voir toutes les destinations →
          </Link>
        </div>
      </div>
    </section>
  );
}
