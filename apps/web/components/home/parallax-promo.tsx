'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFeaturedPackage } from '../../lib/api/public';
import { formatPackagePrice } from '../../lib/packages/listings';
import type { PackageListItem } from '../../lib/packages/types';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { useScrollAnimation } from './use-scroll-animation';

const FALLBACK_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

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
    ? stripHtml(featured.description)
    : t.promo.description;
  const price = featured
    ? formatPackagePrice(featured.pricing.totalCents, featured.pricing.currency)
    : '$159.00';
  const detailsHref = featured ? `/packages/${featured.id}` : '/packages';
  const backgroundImage = featured?.imageUrl ?? FALLBACK_IMAGE;

  return (
    <section ref={ref} className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="absolute inset-0 parallax-bg"
        style={{ backgroundImage: `url("${backgroundImage}")` }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className={`max-w-3xl ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              {description}
            </p>
            <p className="mt-4 text-lg text-white/90">
              {t.promo.priceFrom}{' '}
              <span className="text-2xl font-bold text-white">{price}</span>
              <span className="ml-1 text-sm text-white/70">{t.promo.perPerson}</span>
            </p>
          </div>

          <div className={`shrink-0 ${isVisible ? 'animate-fade-in-right delay-200' : 'opacity-0'}`}>
            <Link
              href={detailsHref}
              className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-primary-hover hover:shadow-md"
            >
              {t.promo.details}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
