'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getFeaturedPackage } from '../../lib/api/public';
import { packageDescriptionPreview } from '../../lib/packages/description-preview';
import { formatPackagePrice } from '../../lib/packages/listings';
import type { PackageListItem } from '../../lib/packages/types';
import { useScrollAnimation } from './use-scroll-animation';

const FALLBACK_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg';

export function ParallaxPromo() {
  const t = useTranslations('promo');
  const { ref, isVisible } = useScrollAnimation(0.15);
  const [featured, setFeatured] = useState<PackageListItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getFeaturedPackage()
      .then((pkg) => {
        if (!cancelled) setFeatured(pkg);
      })
      .catch(() => {
        /* keep translation / static fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const title = featured?.name ?? t('title');
  const description = featured?.description
    ? packageDescriptionPreview(featured.description)
    : t('description');
  const price = featured
    ? formatPackagePrice(featured.pricing.totalCents, featured.pricing.currency)
    : '$159.00';
  const detailsHref = featured ? `/packages/${featured.id}` : '/packages';
  const imageUrl = featured?.imageUrl ?? FALLBACK_IMAGE;
  const imageAlt = featured?.name ?? title;

  return (
    <section ref={ref} className="bg-atg-surface py-6 sm:py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href={detailsHref}
          aria-label={`${title} — ${t('details')}`}
          className={`group relative block overflow-hidden rounded-xl bg-atg-elevated outline-none ring-1 ring-atg-border transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface sm:rounded-2xl ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            {/* Visual */}
            <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[16/10] md:aspect-auto md:min-h-[14rem] lg:min-h-[18rem]">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 45vw"
                priority={false}
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-atg-elevated/80"
                aria-hidden
              />
              <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center truncate bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white sm:left-4 sm:top-4 sm:px-3 sm:text-[11px] sm:tracking-[0.14em] md:left-5 md:top-5">
                {t('badge')}
              </span>
            </div>

            {/* Copy + CTA */}
            <div className="relative flex flex-col justify-center gap-4 px-4 py-5 sm:gap-5 sm:px-6 sm:py-7 md:px-7 md:py-8 lg:gap-6 lg:px-10 lg:py-10">
              <div
                className="pointer-events-none absolute inset-y-5 left-0 hidden w-1 bg-secondary md:inset-y-8 md:block"
                aria-hidden
              />

              <div className="space-y-2 sm:space-y-3 md:pl-4">
                <h2 className="max-w-xl text-xl font-bold tracking-tight text-atg-fg sm:text-2xl lg:text-[2rem] lg:leading-tight">
                  {title}
                </h2>
                <p className="line-clamp-3 max-w-lg text-sm leading-relaxed text-atg-muted sm:line-clamp-4 sm:text-base md:line-clamp-none">
                  {description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 md:pl-4">
                <p className="text-sm text-atg-muted">
                  <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-atg-muted/80 sm:text-xs">
                    {t('priceFrom')}
                  </span>
                  <span className="mt-0.5 inline-flex items-baseline gap-1 sm:mt-1 sm:gap-1.5">
                    <span className="text-2xl font-bold tracking-tight text-secondary sm:text-3xl lg:text-4xl">
                      {price}
                    </span>
                    <span className="text-xs text-atg-muted sm:text-sm">{t('perPerson')}</span>
                  </span>
                </p>

                <span className="inline-flex min-h-10 w-full items-center justify-center gap-2 bg-secondary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 group-hover:bg-secondary/90 sm:min-h-11 sm:w-auto sm:px-6 sm:text-sm">
                  {t('details')}
                  <svg
                    className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 sm:h-4 sm:w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
