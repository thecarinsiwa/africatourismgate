'use client';

import type { PropertyDetailAmenity } from '@africatourismgate/types';
import type { HotelAmenity } from '../../lib/hotels/listings';
import type { Translations } from '../../lib/i18n/translations';

const AMENITY_ICONS: Record<HotelAmenity, React.ReactNode> = {
  wifi: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M4.93 8.465a14 14 0 0114.142 0" />
    </svg>
  ),
  pool: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12h16M6 8h12M8 16h8" />
    </svg>
  ),
  breakfast: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a4 4 0 00-4-4H6a2 2 0 00-2 2v2m16 0V6a2 2 0 00-2-2h-2a4 4 0 00-4 4v2m0 0h8" />
    </svg>
  ),
  spa: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  parking: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
};

function isHotelAmenity(code: string): code is HotelAmenity {
  return code in AMENITY_ICONS;
}

type HotelAmenitiesSectionProps = {
  amenities: PropertyDetailAmenity[];
  title: string;
  amenityLabels: Translations['hotels']['amenities'];
};

export function HotelAmenitiesSection({
  amenities,
  title,
  amenityLabels,
}: HotelAmenitiesSectionProps) {
  if (!amenities.length) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-[#0f1a16] dark:text-white">{title}</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {amenities.map((a) => {
          const label = isHotelAmenity(a.code) ? amenityLabels[a.code] : a.name;
          return (
            <li
              key={a.code}
              className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-sm text-gray-700 dark:border-atg-border dark:bg-atg-elevated dark:text-atg-muted"
            >
              <span className="shrink-0 text-primary">
                {isHotelAmenity(a.code) ? AMENITY_ICONS[a.code] : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span>{label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
