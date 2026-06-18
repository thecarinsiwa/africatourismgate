'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useScrollAnimation } from './use-scroll-animation';
import { useTranslations, useLocale } from '../../lib/i18n/locale-provider';
import { useFeaturedDestinations } from '../../lib/destinations/use-featured-destinations';

const PLACEHOLDER_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg';

function formatCountryName(countryCode: string, locale: string): string {
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
    return displayNames.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}

function DestinationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-atg-elevated shadow-md dark:border dark:border-atg-border dark:bg-atg-elevated">
      <div className="h-52 animate-pulse bg-atg-surface" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-atg-surface" />
        <div className="h-4 w-full animate-pulse rounded bg-atg-surface" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-atg-surface" />
        <div className="h-8 w-24 animate-pulse rounded bg-atg-surface" />
      </div>
    </div>
  );
}

export function DestinationsCarousel() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const { destinations, loading, error } = useFeaturedDestinations(4);

  const cards = useMemo(
    () =>
      destinations.map((dest) => ({
        ...dest,
        subtitle: formatCountryName(dest.countryCode, locale),
        href: `/hotels?destination=${encodeURIComponent(dest.name)}`,
        image: dest.imageUrl?.trim() || PLACEHOLDER_IMAGE,
      })),
    [destinations, locale],
  );

  return (
    <section
      id="gallery"
      ref={ref}
      className="scroll-mt-24 bg-atg-surface py-16 transition-colors dark:bg-atg-surface sm:py-24"
      aria-labelledby="destinations-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-12 max-w-2xl mx-auto text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 id="destinations-heading" className="text-2xl font-bold uppercase tracking-wide text-atg-fg sm:text-3xl">
            {t.destinations.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-atg-muted">{t.destinations.subtitle}</p>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <DestinationCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-sm text-atg-muted" role="alert">
            {t.destinations.loadError}
          </p>
        ) : cards.length === 0 ? (
          <p className="text-center text-sm text-atg-muted">{t.destinations.empty}</p>
        ) : (
          <div className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-4 ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            {cards.map((dest) => (
              <Link
                key={dest.id}
                href={dest.href}
                className="group overflow-hidden rounded-xl bg-atg-elevated shadow-md transition-all duration-300 hover:shadow-xl dark:border dark:border-atg-border dark:bg-atg-elevated"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <div className="text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <p className="text-lg font-bold">{dest.name}</p>
                      <p className="text-sm text-white/80 mt-1">{dest.subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="mb-1 text-lg font-bold text-atg-fg">{dest.name}</h3>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-atg-muted">
                    {dest.subtitle}
                  </p>
                  {dest.description ? (
                    <p className="mb-3 line-clamp-2 text-sm text-atg-muted">{dest.description}</p>
                  ) : null}

                  <div className="flex items-center justify-end">
                    <span className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover">
                      {t.destinations.details}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
