'use client';

import Link from 'next/link';
import { useScrollAnimation } from './use-scroll-animation';
import { useTranslations } from '../../lib/i18n/locale-provider';

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

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < count ? 'text-amber-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

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
      className="scroll-mt-24 bg-gray-50 py-16 transition-colors dark:bg-[#0f1915] sm:py-24"
      aria-labelledby="destinations-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center max-w-2xl mx-auto mb-14 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 id="destinations-heading" className="text-2xl font-bold uppercase tracking-wide text-[#0f1a16] dark:text-white sm:text-3xl">
            {t.destinations.title}
          </h2>
          <p className="mt-4 leading-relaxed text-gray-500 dark:text-atg-muted">{t.destinations.subtitle}</p>
        </div>

        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          {destinations.map((dest) => (
            <Link
              key={dest.title}
              href={dest.href}
              className="group overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:border dark:border-atg-border dark:bg-atg-elevated"
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
                <h3 className="mb-1 font-bold text-[#0f1a16] dark:text-white">{dest.title}</h3>
                <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-atg-muted">{dest.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarRating count={dest.rating} />
                    <span className="text-xs text-gray-400 dark:text-atg-muted">
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
