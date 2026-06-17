'use client';

import Link from 'next/link';
import { useScrollAnimation } from './use-scroll-animation';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { StarRating } from '../shared';

const DESTINATION_HREFS = [
  '/hotels?destination=Nairobi',
  '/hotels?destination=Le%20Cap',
  '/hotels?destination=Marrakech',
  '/hotels?destination=Zanzibar',
];

const DESTINATION_IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Table_Mountain_DanieVDM.jpg/1280px-Table_Mountain_DanieVDM.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Koutoubia_Mosque%2C_Marrakech.jpg/1280px-Koutoubia_Mosque%2C_Marrakech.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Zanzibar_beach.jpg/1280px-Zanzibar_beach.jpg',
];

const RATINGS = [5, 4, 5, 4];
const REVIEW_COUNTS = [42, 38, 56, 31];

export function DestinationsCarousel() {
  const t = useTranslations();
  const { ref, isVisible } = useScrollAnimation(0.1);

  const destinations = t.destinations.items.map((item, i) => ({
    ...item,
    image: DESTINATION_IMAGES[i],
    href: DESTINATION_HREFS[i],
    rating: RATINGS[i],
    reviews: REVIEW_COUNTS[i],
  }));

  return (
    <section
      id="gallery"
      ref={ref}
      className="scroll-mt-24 bg-atg-surface py-16 transition-colors dark:bg-atg-surface sm:py-24"
      aria-labelledby="destinations-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center max-w-2xl mx-auto mb-14 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 id="destinations-heading" className="text-2xl font-bold uppercase tracking-wide text-atg-fg sm:text-3xl">
            {t.destinations.title}
          </h2>
          <p className="mt-4 leading-relaxed text-atg-muted">{t.destinations.subtitle}</p>
        </div>

        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          {destinations.map((dest) => (
            <Link
              key={dest.title}
              href={dest.href}
              className="group overflow-hidden rounded-xl bg-atg-elevated shadow-md transition-all duration-300 hover:shadow-xl dark:border dark:border-atg-border dark:bg-atg-elevated"
            >
              <div className="relative h-52 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url("${dest.image}")` }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <div className="text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <p className="text-lg font-bold">{dest.title}</p>
                    <p className="text-sm text-white/80 mt-1">{dest.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="mb-1 font-bold text-atg-fg">{dest.title}</h3>
                <p className="mb-3 line-clamp-2 text-sm text-atg-muted">{dest.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarRating value={dest.rating} size="sm" />
                    <span className="text-xs text-atg-muted">
                      - {dest.reviews} {t.destinations.reviews}
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover">
                    {t.destinations.details}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
