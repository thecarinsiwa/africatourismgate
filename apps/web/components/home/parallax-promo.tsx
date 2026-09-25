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

  return (
    <section ref={ref} className="bg-atg-surface py-5 sm:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`rounded-xl border border-atg-border bg-atg-elevated shadow-sm transition-shadow hover:shadow-md ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
            {/* Thumbnail */}
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[12rem] shrink-0 overflow-hidden rounded-lg sm:mx-0 sm:aspect-square sm:h-28 sm:w-28 sm:max-w-none">
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 192px, 112px"
              />
            </div>

            {/* Content + green separator */}
            <div className="flex min-w-0 flex-1 flex-col gap-2 border-t border-secondary/40 pt-4 sm:border-t-0 sm:border-l-4 sm:border-secondary sm:pt-0 sm:pl-5">
              <span className="inline-flex w-fit rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {t('badge')}
              </span>
              <div className="min-w-0 space-y-1">
                <h2 className="line-clamp-2 text-lg font-bold leading-snug text-atg-fg sm:line-clamp-1 sm:text-xl">
                  {title}
                </h2>
                <p className="line-clamp-2 text-sm leading-relaxed text-atg-muted">
                  {description}
                </p>
              </div>
              <p className="text-sm text-atg-muted">
                {t('priceFrom')}{' '}
                <span className="text-lg font-bold text-secondary">{price}</span>
                <span className="ml-1">{t('perPerson')}</span>
              </p>
            </div>

            {/* CTA */}
            <div className="shrink-0 sm:ml-auto sm:self-center">
              <Link
                href={detailsHref}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-secondary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-secondary/90 sm:w-auto"
              >
                {t('details')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
