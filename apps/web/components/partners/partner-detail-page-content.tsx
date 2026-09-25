'use client';

import type { PublicActivityProviderDetail } from '@africatourismgate/types';
import { normalizeBrandingAssetUrl } from '@africatourismgate/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getPublicActivityProvider } from '../../lib/api/public';
import { useNamespaceLabels } from '../../lib/i18n/use-namespace-labels';
import { partnerColor, partnerInitials } from '../../lib/partners/display';
import { partnersListHref } from '../../lib/partners/listings';
import type { ActivitySearchResult } from '../../lib/activities/types';
import { siteSearchDeepLinks } from '../../lib/site-search/deep-links';
import { ActivityCard } from '../activities/activity-card';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PageHero } from '../shared/page-hero';

type PartnerDetailPageContentProps = {
  partnerId: string;
};

function PartnerBreadcrumb({
  partnerName,
  homeLabel,
  partnersLabel,
}: {
  partnerName?: string;
  homeLabel: string;
  partnersLabel: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-white/70">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="transition-colors hover:text-white">
            {homeLabel}
          </Link>
        </li>
        <li aria-hidden className="text-white/40">
          /
        </li>
        <li>
          <Link href={partnersListHref()} className="transition-colors hover:text-white">
            {partnersLabel}
          </Link>
        </li>
        {partnerName ? (
          <>
            <li aria-hidden className="text-white/40">
              /
            </li>
            <li className="max-w-[14rem] truncate text-white sm:max-w-none">{partnerName}</li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

function PartnerAvatar({
  name,
  logo,
  size = 'lg',
}: {
  name: string;
  logo: string | null;
  size?: 'md' | 'lg';
}) {
  const dim = size === 'lg' ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-20 w-20';
  if (logo) {
    return (
      <div
        className={`relative ${dim} shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(0,0,0,.35)] ring-4 ring-white/90`}
      >
        <Image
          src={logo}
          alt=""
          fill
          unoptimized
          className="object-cover"
          sizes={size === 'lg' ? '128px' : '80px'}
          priority={size === 'lg'}
        />
      </div>
    );
  }
  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-[0_12px_40px_rgba(0,0,0,.35)] ring-4 ring-white/90 sm:text-4xl`}
      style={{ backgroundColor: partnerColor(name) }}
      aria-hidden
    >
      {partnerInitials(name)}
    </div>
  );
}

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

  const heroImage = useMemo(() => {
    if (!detail) return null;
    const fromActivity = detail.activities.find((row) => row.imageUrl?.trim())?.imageUrl;
    return fromActivity?.trim() || logo;
  }, [detail, logo]);

  const destinationHref = detail
    ? siteSearchDeepLinks.activitiesByDestination(detail.destinationName)
    : '#';

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        {loading ? (
          <section className="relative overflow-hidden bg-[#1b1b2f] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(11,110,79,.35),_transparent_55%)]" />
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
              <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
              <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end">
                <div className="h-28 w-28 animate-pulse rounded-2xl bg-white/10 sm:h-32 sm:w-32" />
                <div className="flex-1 space-y-3 pb-1">
                  <div className="h-9 w-2/3 max-w-md animate-pulse rounded bg-white/15" />
                  <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            </div>
          </section>
        ) : notFound ? (
          <PageHero
            breadcrumb={
              <PartnerBreadcrumb
                homeLabel={t('breadcrumbHome')}
                partnersLabel={t('breadcrumbPartners')}
              />
            }
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
        ) : error || !detail ? (
          <PageHero
            breadcrumb={
              <PartnerBreadcrumb
                homeLabel={t('breadcrumbHome')}
                partnersLabel={t('breadcrumbPartners')}
              />
            }
            title={
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('loadError')}</h1>
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
        ) : (
          <>
            <section className="relative isolate overflow-hidden bg-[#1b1b2f] text-white">
              {heroImage ? (
                <div className="absolute inset-0" aria-hidden>
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    unoptimized
                    priority
                    className="object-cover animate-partner-hero-ken"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#12121f] via-[#1b1b2f]/88 to-[#1b1b2f]/55" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b2f] via-transparent to-[#1b1b2f]/40" />
                </div>
              ) : (
                <div
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(11,110,79,.4),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(26,158,215,.2),_transparent_45%)]"
                  aria-hidden
                />
              )}

              <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
                <div className="animate-fade-in-up">
                  <PartnerBreadcrumb
                    partnerName={detail.name}
                    homeLabel={t('breadcrumbHome')}
                    partnersLabel={t('breadcrumbPartners')}
                  />
                </div>

                <div className="mt-10 flex flex-col gap-8 sm:mt-12 sm:flex-row sm:items-end sm:gap-10">
                  <div className="animate-fade-in-up delay-100">
                    <PartnerAvatar name={detail.name} logo={logo} />
                  </div>

                  <div className="min-w-0 flex-1 animate-fade-in-up delay-200">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/90">
                      {t('operatorBadge')}
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                      {detail.name}
                    </h1>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                      {t('detailIntro', { destination: detail.destinationName })}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Link
                        href={destinationHref}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
                      >
                        <svg
                          className="h-4 w-4 shrink-0 text-emerald-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        {detail.destinationName}
                      </Link>
                      <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                        {t('activitiesCount', { count: detail.activities.length })}
                      </span>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      {detail.activities.length > 0 ? (
                        <a
                          href="#partner-activities"
                          className="inline-flex min-h-[44px] items-center rounded-lg bg-[var(--atg-primary,#0b6e4f)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--atg-primary-hover,#095a40)]"
                        >
                          {t('exploreActivities')}
                        </a>
                      ) : null}
                      <Link
                        href={partnersListHref()}
                        className="inline-flex min-h-[44px] items-center rounded-lg border border-white/25 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        {t('backToPartners')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="partner-activities"
              className="scroll-mt-24 relative overflow-hidden border-t border-atg-border bg-atg-elevated py-16 sm:py-20"
              aria-labelledby="partner-activities-heading"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(11,110,79,.08),_transparent_70%)]"
                aria-hidden
              />
              <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {t('activitiesEyebrow')}
                  </p>
                  <h2
                    id="partner-activities-heading"
                    className="mt-3 text-2xl font-bold uppercase tracking-wide text-atg-fg sm:text-3xl"
                  >
                    {t('activitiesHeading')}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-atg-muted sm:text-base">
                    {t('activitiesSubtitle', { name: detail.name })}
                  </p>
                  {detail.activities.length > 0 ? (
                    <p className="mt-4 inline-flex items-center rounded-full border border-atg-border bg-atg-surface px-3.5 py-1 text-sm font-semibold text-atg-fg">
                      {t('activitiesCount', { count: detail.activities.length })}
                    </p>
                  ) : null}
                </div>

                {detail.activities.length === 0 ? (
                  <div className="mx-auto max-w-lg border border-dashed border-atg-border bg-atg-surface px-6 py-16 text-center">
                    <div
                      className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"
                      aria-hidden
                    >
                      <svg
                        className="h-7 w-7"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M17 7l2.1-2.1" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-atg-fg">{t('noActivities')}</p>
                    <p className="mt-2 text-atg-muted">{t('noActivitiesHint')}</p>
                    <Link
                      href={partnersListHref()}
                      className="mt-6 inline-flex min-h-[44px] items-center text-sm font-semibold text-primary hover:underline"
                    >
                      {t('backToPartners')}
                    </Link>
                  </div>
                ) : (
                  <>
                    <ul className="mx-auto flex max-w-4xl flex-col gap-5 sm:gap-6">
                      {detail.activities.map((activity, index) => (
                        <li
                          key={activity.id}
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${Math.min(index, 6) * 80}ms` }}
                        >
                          <ActivityCard
                            activity={activity as ActivitySearchResult}
                            t={a}
                            searchParams={{ destination: detail.destinationName }}
                          />
                        </li>
                      ))}
                    </ul>

                    <div className="mt-12 flex flex-col items-center gap-3 text-center sm:mt-14">
                      <p className="text-sm text-atg-muted">{t('moreInDestination')}</p>
                      <Link
                        href={destinationHref}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-atg-border bg-atg-surface px-5 py-2.5 text-sm font-semibold text-atg-fg transition hover:border-primary hover:text-primary"
                      >
                        {t('browseDestinationActivities', {
                          destination: detail.destinationName,
                        })}
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
