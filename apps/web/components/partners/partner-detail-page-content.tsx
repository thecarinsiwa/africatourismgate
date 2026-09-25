'use client';

import type { PublicActivityProviderDetail } from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getPublicActivityProvider } from '../../lib/api/public';
import { useNamespaceLabels } from '../../lib/i18n/use-namespace-labels';
import { partnerColor, partnerInitials } from '../../lib/partners/display';
import { partnersListHref } from '../../lib/partners/listings';
import type { ActivitySearchResult } from '../../lib/activities/types';
import { ActivityCard } from '../activities/activity-card';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ListingPageBody } from '../shared/listing-patterns';
import { PageHero } from '../shared/page-hero';

type PartnerDetailPageContentProps = {
  partnerId: string;
};

export function PartnerDetailPageContent({ partnerId }: PartnerDetailPageContentProps) {
  const t = useTranslations('partners');
  const a = useNamespaceLabels('activities');

  const [detail, setDetail] = useState<PublicActivityProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(false);

    void getPublicActivityProvider(partnerId)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDetail(null);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('404')) {
          setNotFound(true);
        } else {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [partnerId, fetchId]);

  const logo = detail?.logoUrl?.trim()
    ? normalizeBrandingAssetUrl(detail.logoUrl.trim())
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        {loading ? (
          <PageHero
            title={
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('loading')}</h1>
            }
          />
        ) : notFound ? (
          <>
            <PageHero
              title={
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {t('notFoundTitle')}
                </h1>
              }
              description={
                <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                  {t('notFoundDescription')}
                </p>
              }
              actions={
                <Link
                  href={partnersListHref()}
                  className="inline-flex min-h-[44px] items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#1b1b2f] transition-colors hover:bg-white/90"
                >
                  {t('backToPartners')}
                </Link>
              }
            />
          </>
        ) : error || !detail ? (
          <>
            <PageHero
              title={
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {t('loadError')}
                </h1>
              }
              actions={
                <button
                  type="button"
                  onClick={() => setFetchId((n) => n + 1)}
                  className="inline-flex min-h-[44px] items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#1b1b2f] transition-colors hover:bg-white/90"
                >
                  {t('retry')}
                </button>
              }
            />
          </>
        ) : (
          <>
            <PageHero
              breadcrumb={
                <nav aria-label="Breadcrumb" className="text-sm text-white/70">
                  <ol className="flex flex-wrap items-center gap-2">
                    <li>
                      <Link href="/" className="hover:text-white">
                        {t('breadcrumbHome')}
                      </Link>
                    </li>
                    <li aria-hidden>/</li>
                    <li>
                      <Link href={partnersListHref()} className="hover:text-white">
                        {t('breadcrumbPartners')}
                      </Link>
                    </li>
                    <li aria-hidden>/</li>
                    <li className="text-white">{detail.name}</li>
                  </ol>
                </nav>
              }
              title={
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                  {logo ? (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white shadow-lg ring-2 ring-white/30 sm:h-24 sm:w-24">
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
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg ring-2 ring-white/30 sm:h-24 sm:w-24"
                      style={{ backgroundColor: partnerColor(detail.name) }}
                      aria-hidden
                    >
                      {partnerInitials(detail.name)}
                    </div>
                  )}
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{detail.name}</h1>
                </div>
              }
              description={
                <p className="text-base leading-relaxed text-white/80 sm:text-lg">
                  <span className="font-medium text-white/90">{t('destinationLabel')}: </span>
                  {detail.destinationName}
                </p>
              }
            />

            <ListingPageBody>
              <h2 className="mb-6 text-xl font-bold text-atg-fg sm:text-2xl">
                {t('activitiesHeading')}
              </h2>

              {detail.activities.length === 0 ? (
                <div className="mx-auto max-w-lg text-center">
                  <p className="text-lg font-semibold text-atg-fg">{t('noActivities')}</p>
                  <p className="mt-2 text-atg-muted">{t('noActivitiesHint')}</p>
                  <Link
                    href={partnersListHref()}
                    className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-primary hover:underline"
                  >
                    {t('backToPartners')}
                  </Link>
                </div>
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {detail.activities.map((activity) => (
                    <li key={activity.id}>
                      <ActivityCard
                        activity={activity as ActivitySearchResult}
                        t={a}
                        searchParams={{ destination: detail.destinationName }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </ListingPageBody>
          </>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
