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
    <section ref={ref} className="bg-atg-surface py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href={detailsHref}
          aria-label={`${title} — ${t('details')}`}
          className={`group relative block overflow-hidden rounded-2xl bg-atg-elevated outline-none ring-1 ring-atg-border transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            {/* Visual — dominant image plane */}
            <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[16rem] lg:min-h-[18rem]">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 45vw"
                priority={false}
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-atg-elevated/80"
                aria-hidden
              />
              <span className="absolute left-4 top-4 inline-flex items-center bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white md:left-5 md:top-5">
                {t('badge')}
              </span>
            </div>

            {/* Copy + CTA */}
            <div className="relative flex flex-col justify-center gap-5 px-5 py-6 sm:px-7 sm:py-8 lg:gap-6 lg:px-10 lg:py-10">
              <div
                className="pointer-events-none absolute inset-y-6 left-0 hidden w-1 rounded-full bg-secondary md:inset-y-8 md:block"
                aria-hidden
              />

              <div className="space-y-3 md:pl-4">
                <h2 className="max-w-xl text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl lg:text-[2rem] lg:leading-tight">
                  {title}
                </h2>
                <p className="max-w-lg text-sm leading-relaxed text-atg-muted sm:text-base">
                  {description}
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:pl-4">
                <p className="text-sm text-atg-muted">
                  <span className="block text-xs font-medium uppercase tracking-[0.12em] text-atg-muted/80">
                    {t('priceFrom')}
                  </span>
                  <span className="mt-1 inline-flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
                      {price}
                    </span>
                    <span className="text-sm text-atg-muted">{t('perPerson')}</span>
                  </span>
                </p>

                <span className="inline-flex min-h-11 items-center justify-center gap-2 self-start bg-secondary px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 group-hover:bg-secondary/90 sm:self-auto">
                  {t('details')}
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
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
