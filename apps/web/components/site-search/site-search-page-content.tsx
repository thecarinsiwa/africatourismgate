'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useSiteSearch } from '../../lib/site-search';
import type { SiteSearchGroupId, SiteSearchResultItem } from '../../lib/site-search';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PageHero } from '../shared/page-hero';
import {
  ListingPageBody,
  ListingResultsGrid,
} from '../shared/listing-patterns';

type SiteSearchPageContentProps = {
  initialQuery: string;
};

export function SiteSearchPageContent({
  initialQuery,
}: SiteSearchPageContentProps) {
  const t = useTranslations('siteSearch');
  const tNav = useTranslations('nav');

  const {
    setQuery,
    groups,
    flatItems,
    loading,
    hasResults,
    isEmpty,
  } = useSiteSearch({ enabled: true });

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery, setQuery]);

  const groupLabel = (group: SiteSearchGroupId) =>
    t(`groups.${group}` as Parameters<typeof t>[0]);

  const title = initialQuery
    ? t('resultsPageSubtitle', { query: initialQuery })
    : t('resultsPageTitle');

  const showEmpty =
    !loading && (isEmpty || (!initialQuery && !hasResults));

  const hasPartialError =
    !loading && !hasResults && !isEmpty && groups.some((group) => group.error);

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface">
      <HomeHeader />
      <main className="flex-1">
        <PageHero
          title={
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
          }
          description={
            <p className="max-w-2xl text-base text-white/80 sm:text-lg">
              {t('placeholder')}
            </p>
          }
        />

        <ListingPageBody
          notice={
            hasPartialError ? (
              <p className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                {t('partialError')}
              </p>
            ) : null
          }
          loading={loading && !hasResults}
          loadingMessage={t('updating')}
          isEmpty={showEmpty}
          empty={{
            title: t('empty'),
            description: t('placeholder'),
            backHomeLabel: tNav('home'),
            backHomeHref: '/',
          }}
          resultsVariant="list"
        >
          {groups.map((group) => {
            if (group.items.length === 0 && !group.error) return null;
            return (
              <section
                key={group.group}
                aria-label={groupLabel(group.group)}
                data-testid="site-search-page-group"
                className="space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-atg-fg">
                    {groupLabel(group.group)}
                  </h2>
                  {group.error ? (
                    <span className="text-xs text-amber-700 dark:text-amber-400">
                      {t('groupError')}
                    </span>
                  ) : null}
                </div>
                <ListingResultsGrid variant="list">
                  {group.items.map((item) => (
                    <SiteSearchResultCard key={item.id} item={item} />
                  ))}
                </ListingResultsGrid>
              </section>
            );
          })}

          {loading && hasResults ? (
            <p className="text-center text-sm text-atg-muted">{t('updating')}</p>
          ) : null}

          {!loading && hasResults ? (
            <p
              className="text-sm text-atg-muted"
              data-testid="site-search-page-count"
            >
              {flatItems.length}
            </p>
          ) : null}
        </ListingPageBody>
      </main>
      <HomeFooter />
    </div>
  );
}

function SiteSearchResultCard({ item }: { item: SiteSearchResultItem }) {
  return (
    <Link
      href={item.href}
      data-testid="site-search-page-result"
      className="block rounded-2xl border border-atg-border bg-atg-elevated px-5 py-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface dark:border-atg-border dark:bg-atg-elevated"
    >
      <span className="text-base font-semibold text-atg-fg">{item.title}</span>
      {item.subtitle ? (
        <span className="mt-1 block truncate text-sm text-atg-muted">
          {item.subtitle}
        </span>
      ) : null}
    </Link>
  );
}
