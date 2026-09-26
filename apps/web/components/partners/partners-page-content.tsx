'use client';

import type { PublicActivityProvider } from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { listPublicActivityProviders } from '../../lib/api/public';
import { useListingPagination } from '../../lib/listing/pagination';
import { toListingPaginationLabels, scrollListingToTop } from '../../lib/listing/pagination-labels';
import { partnerColor, partnerInitials } from '../../lib/partners/display';
import { partnerHref } from '../../lib/partners/listings';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ListingPageBody, ListingPaginationBar } from '../shared/listing-patterns';
import { PageHero } from '../shared/page-hero';

export function PartnersPageContent() {
  const t = useTranslations('partners');
  const tListing = useTranslations('listing');

  const [partners, setPartners] = useState<PublicActivityProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void listPublicActivityProviders()
      .then((rows) => {
        if (!cancelled) setPartners(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setPartners([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchId]);

  const paginationResetKey = useMemo(() => String(fetchId), [fetchId]);

  const {
    pageItems,
    page,
    setPage,
    totalPages,
    totalItems,
    pageSize,
    showPagination,
  } = useListingPagination(partners, paginationResetKey);

  const paginationLabels = useMemo(() => toListingPaginationLabels(tListing), [tListing]);

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        <PageHero
          title={
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('heroTitle')}</h1>
          }
          description={
            <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {t('heroSubtitle')}
            </p>
          }
        />
        <ListingPageBody>
          {loading ? (
            <p className="text-center text-atg-muted">{t('loading')}</p>
          ) : error ? (
            <div className="mx-auto max-w-lg text-center">
              <p className="text-atg-muted">{t('loadError')}</p>
              <button
                type="button"
                onClick={() => setFetchId((n) => n + 1)}
                className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                {t('retry')}
              </button>
            </div>
          ) : partners.length === 0 ? (
            <div className="mx-auto max-w-lg text-center">
              <p className="text-lg font-semibold text-atg-fg">{t('noResults')}</p>
              <p className="mt-2 text-atg-muted">{t('noResultsHint')}</p>
            </div>
          ) : (
            <>
              <ul className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10">
                {pageItems.map((partner) => {
                  const logo = partner.logoUrl?.trim()
                    ? normalizeBrandingAssetUrl(partner.logoUrl.trim())
                    : null;
                  return (
                    <li key={partner.id} className="w-[8.5rem] sm:w-[9.5rem]">
                      <Link
                        href={partnerHref(partner.id)}
                        className="group flex flex-col items-center gap-2 rounded-xl p-2 text-center outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        {logo ? (
                          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-white shadow-md ring-1 ring-atg-border/60 transition-shadow group-hover:shadow-lg sm:h-24 sm:w-24">
                            <Image
                              src={logo}
                              alt=""
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>
                        ) : (
                          <div
                            className="flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold text-white shadow-md transition-shadow group-hover:shadow-lg sm:h-24 sm:w-24 sm:text-2xl"
                            style={{ backgroundColor: partnerColor(partner.name) }}
                            aria-hidden
                          >
                            {partnerInitials(partner.name)}
                          </div>
                        )}
                        <span className="line-clamp-2 text-sm font-medium text-atg-fg group-hover:text-primary">
                          {partner.name}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {showPagination ? (
                <ListingPaginationBar
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  itemLabel={t('resultItem')}
                  labels={paginationLabels}
                  onPageChange={(next) => {
                    setPage(next);
                    scrollListingToTop();
                  }}
                />
              ) : null}
            </>
          )}
        </ListingPageBody>
      </main>
      <HomeFooter />
    </div>
  );
}
