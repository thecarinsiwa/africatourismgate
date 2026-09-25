'use client';

import type { PublicActivityProvider } from '@africatourismgate/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { listPublicActivityProviders } from '../../lib/api/public';
import { partnerColor, partnerInitials } from '../../lib/partners/display';
import { partnerHref, partnersListHref } from '../../lib/partners/listings';
import { useScrollAnimation } from './use-scroll-animation';

export function PartnersSection() {
  const t = useTranslations('partners');
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [partners, setPartners] = useState<PublicActivityProvider[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listPublicActivityProviders()
      .then((rows) => {
        if (!cancelled) setPartners(rows);
      })
      .catch(() => {
        if (!cancelled) setPartners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (partners.length === 0) {
    return null;
  }

  return (
    <section
      ref={ref}
      className="border-y border-atg-border bg-atg-elevated py-16 transition-colors dark:border-atg-border dark:bg-atg-elevated sm:py-20"
      aria-label={t('ariaLabel')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto mb-10 max-w-2xl text-center ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <h2 className="text-2xl font-bold uppercase tracking-wide text-atg-fg sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-2 text-sm text-atg-muted sm:text-base">{t('subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10">
          {partners.map((partner, i) => {
            const logo = partner.logoUrl?.trim() || null;
            return (
              <div
                key={partner.id}
                className={`group flex w-[7.5rem] items-center justify-center sm:w-[8.5rem] ${
                  isVisible ? 'animate-flip-in-x' : 'opacity-0'
                }`}
                style={{ animationDelay: `${(i + 1) * 80}ms` }}
              >
                <Link
                  href={partnerHref(partner.id)}
                  className="flex flex-col items-center gap-2 rounded-lg outline-none transition-transform duration-300 group-hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  title={partner.name}
                >
                  {logo ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-white shadow-md ring-1 ring-atg-border/60 transition-all duration-300 group-hover:shadow-lg sm:h-20 sm:w-20">
                      <Image
                        src={logo}
                        alt={partner.name}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white shadow-md transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:shadow-lg sm:h-20 sm:w-20 sm:text-xl"
                      style={{ backgroundColor: partnerColor(partner.name) }}
                      aria-hidden
                    >
                      {partnerInitials(partner.name)}
                    </div>
                  )}
                  <span className="line-clamp-2 max-w-[7.5rem] text-center text-xs text-atg-muted transition-colors group-hover:text-atg-fg sm:max-w-[8.5rem]">
                    {partner.name}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        <div
          className={`mt-10 text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{ animationDelay: '200ms' }}
        >
          <Link
            href={partnersListHref()}
            className="inline-flex min-h-[44px] items-center text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline"
          >
            {t('seeAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}
