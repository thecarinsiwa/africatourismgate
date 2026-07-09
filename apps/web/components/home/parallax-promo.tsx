'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFeaturedPackage } from '../../lib/api/public';
import { packageDescriptionPreview } from '../../lib/packages/description-preview';
import { formatPackagePrice } from '../../lib/packages/listings';
import type { PackageListItem } from '../../lib/packages/types';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { useScrollAnimation } from './use-scroll-animation';

const FALLBACK_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg';

export function ParallaxPromo() {
  const t = useTranslations();
  const { ref, isVisible } = useScrollAnimation(0.15);
  const [featured, setFeatured] = useState<PackageListItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getFeaturedPackage().then((pkg) => {
      if (!cancelled) setFeatured(pkg);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const title = featured?.name ?? t.promo.title;
  const description = featured?.description
    ? packageDescriptionPreview(featured.description)
    : t.promo.description;
  const price = featured
    ? formatPackagePrice(featured.pricing.totalCents, featured.pricing.currency)
    : '$159.00';
  const detailsHref = featured ? `/packages/${featured.id}` : '/packages';
  const imageUrl = featured?.imageUrl ?? FALLBACK_IMAGE;

  return (
    <section ref={ref} className="bg-atg-surface py-4 sm:py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`overflow-hidden rounded-xl border border-secondary/30 bg-gradient-to-r from-secondary/15 via-atg-elevated to-atg-elevated shadow-sm ring-1 ring-secondary/20 transition-shadow hover:shadow-md dark:from-secondary/20 dark:via-atg-elevated dark:to-atg-elevated ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
            <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-32">
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 128px"
              />
              <div className="absolute inset-0 bg-secondary/25" aria-hidden />
            </div>

            <div className="min-w-0 flex-1 border-l-0 sm:border-l-4 sm:border-secondary sm:pl-4">
              <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                {t.promo.badge}
              </span>
              <h2 className="mt-1.5 line-clamp-1 text-base font-bold text-atg-fg sm:text-lg">{title}</h2>
              <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-atg-muted sm:line-clamp-2 sm:text-sm">
                {description}
              </p>
              <p className="mt-1.5 text-xs text-atg-muted sm:text-sm">
                {t.promo.priceFrom}{' '}
                <span className="text-base font-bold text-secondary sm:text-lg">{price}</span>
                <span className="ml-1">{t.promo.perPerson}</span>
              </p>
            </div>

            <div className="shrink-0 sm:self-center">
              <Link
                href={detailsHref}
                className="inline-flex min-h-[40px] w-full items-center justify-center rounded-lg bg-secondary px-5 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-secondary/90 sm:w-auto sm:text-sm"
              >
                {t.promo.details}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
