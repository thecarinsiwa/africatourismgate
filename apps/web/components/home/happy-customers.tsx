'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type {
  HappyCustomersColorKey,
  PublicHappyCustomersContent,
  PublicHappyCustomersStat,
} from '@africatourismgate/types';
import { getPublicHappyCustomersForLocale } from '../../lib/api/public';
import { useAppLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { useScrollAnimation } from './use-scroll-animation';

const FALLBACK_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg/1280px-A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg';

const COLOR_MAP: Record<HappyCustomersColorKey, string> = {
  primary: 'var(--atg-primary)',
  secondary: 'var(--atg-secondary)',
};

const FALLBACK_VALUES = [94, 87, 48, 51] as const;
const FALLBACK_COLOR_KEYS: HappyCustomersColorKey[] = ['primary', 'secondary', 'primary', 'secondary'];

type DisplayBar = {
  id: string;
  label: string;
  value: number;
  color: string;
};

function mapFallbackBars(
  labels: { flights: string; hotels: string; cars: string; cruises: string },
): DisplayBar[] {
  const entries = [labels.flights, labels.hotels, labels.cars, labels.cruises];
  return entries.map((label, i) => ({
    id: `fallback-${i}`,
    label,
    value: FALLBACK_VALUES[i] ?? 0,
    color: COLOR_MAP[FALLBACK_COLOR_KEYS[i] ?? 'primary'],
  }));
}

function toDisplayBars(
  content: PublicHappyCustomersContent | null,
  fallbackBars: DisplayBar[],
): DisplayBar[] {
  if (!content?.stats.length) return fallbackBars;
  return content.stats.map((stat: PublicHappyCustomersStat) => ({
    id: stat.id,
    label: stat.label,
    value: stat.percentValue,
    color: COLOR_MAP[stat.colorKey],
  }));
}

export function HappyCustomers() {
  const t = useTranslations();
  const locale = useAppLocale();
  const { ref, isVisible } = useScrollAnimation(0.15);
  const [content, setContent] = useState<PublicHappyCustomersContent | null>(null);
  const [usedLocaleFallback, setUsedLocaleFallback] = useState(false);

  const fallbackBars = mapFallbackBars(t.customers.bars);

  useEffect(() => {
    let cancelled = false;
    void getPublicHappyCustomersForLocale(locale).then(
      ({ content: fetched, usedLocaleFallback: fallback }) => {
        if (!cancelled) {
          setContent(fetched);
          setUsedLocaleFallback(fallback);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const useLocalizedCopy = usedLocaleFallback || !content?.section;
  const section = useLocalizedCopy ? null : content?.section;
  const title = section?.title ?? t.customers.title;
  const subtitle = section?.subtitle ?? t.customers.subtitle;
  const p1 = section?.paragraph1 ?? t.customers.p1;
  const p2 = section?.paragraph2 ?? t.customers.p2;
  const imageUrl = section?.imageUrl ?? FALLBACK_IMAGE;
  const imageAlt = section?.imageAlt ?? t.customers.imageAlt;
  const badgeValue = section?.badgeValue ?? '10K+';
  const badgeLabel = section?.badgeLabel ?? t.customers.clients;
  const bars =
    useLocalizedCopy || !content?.stats.length
      ? fallbackBars
      : toDisplayBars(content, fallbackBars);

  return (
    <section ref={ref} className="overflow-hidden bg-atg-elevated py-16 transition-colors dark:bg-atg-surface sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className={`${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg sm:h-24 sm:w-24">
                <div className="text-center">
                  <span className="block text-2xl font-bold sm:text-3xl">{badgeValue}</span>
                  <span className="block text-[10px] font-medium uppercase tracking-wide">
                    {badgeLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className="text-2xl font-bold uppercase tracking-wide text-atg-fg sm:text-3xl">
                {title}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-atg-muted">{subtitle}</p>
              <p className="mt-4 text-sm leading-relaxed text-atg-muted">{p1}</p>
              <p className="mt-3 text-sm leading-relaxed text-atg-muted">{p2}</p>
            </div>

            <div className="mt-8 space-y-5">
              {bars.map((bar, i) => (
                <div
                  key={bar.id}
                  className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${(i + 1) * 100}ms` }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-atg-fg">{bar.label}</span>
                    <span className="text-sm font-bold" style={{ color: bar.color }}>
                      {bar.value}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-atg-surface dark:bg-white/10">
                    <div
                      className={`h-full rounded-full ${isVisible ? 'progress-bar-fill' : ''}`}
                      style={{
                        width: isVisible ? `${bar.value}%` : '0%',
                        backgroundColor: bar.color,
                        animationDelay: `${(i + 1) * 150}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
