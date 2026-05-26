'use client';

import type { HotelListing } from '../../lib/hotels/listings';
import type { Translations } from '../../lib/i18n/translations';

type HotelCardProps = {
  hotel: HotelListing;
  t: Translations['hotels'];
};

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < count ? 'text-amber-400' : 'text-gray-300 dark:text-white/20'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M4.93 8.465a14 14 0 0114.142 0" />
    </svg>
  ),
  pool: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12h16M6 8h12M8 16h8" />
    </svg>
  ),
  breakfast: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a4 4 0 00-4-4H6a2 2 0 00-2 2v2m16 0V6a2 2 0 00-2-2h-2a4 4 0 00-4 4v2m0 0h8" />
    </svg>
  ),
  spa: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  parking: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
};

export function HotelCard({ hotel, t }: HotelCardProps) {
  const ratingLabel = hotel.rating >= 9 ? t.excellent : t.veryGood;
  const typeLabel = t.types[hotel.type];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-atg-border dark:bg-atg-elevated sm:flex-row">
      <div className="relative h-56 shrink-0 sm:h-auto sm:w-72 lg:w-80">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url("${hotel.image}")` }}
          role="img"
          aria-label={hotel.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:bg-gradient-to-r" />
        {hotel.featured && (
          <span className="absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
            {t.featuredBadge}
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-[#0f1a16] shadow dark:bg-atg-elevated dark:text-white">
          {typeLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#0f1a16] dark:text-white sm:text-xl">{hotel.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-atg-muted">
              <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {hotel.location}, {hotel.country}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-1 dark:bg-primary/20">
              <span className="text-lg font-bold text-primary">{hotel.rating}</span>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-atg-muted">{ratingLabel}</span>
            <span className="text-xs text-gray-400 dark:text-atg-muted">
              {hotel.reviews} {t.reviews}
            </span>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-3">
          <StarRow count={hotel.stars} />
          <span className="text-xs text-gray-400 dark:text-atg-muted">
            {hotel.stars} {t.stars}
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            {t.freeCancel}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {hotel.amenities.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:bg-white/5 dark:text-atg-muted"
              title={t.amenities[a]}
            >
              {AMENITY_ICONS[a]}
              <span className="hidden sm:inline">{t.amenities[a]}</span>
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-gray-100 pt-4 dark:border-atg-border">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-atg-muted">{t.perNight}</p>
            <p className="text-2xl font-bold text-[#0f1a16] dark:text-white">
              ${hotel.price}
              <span className="text-sm font-normal text-gray-500 dark:text-atg-muted">{t.perNight}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="min-h-[44px] rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/80 dark:hover:border-primary dark:hover:text-white"
            >
              {t.viewDetails}
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
            >
              {t.bookNow}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
