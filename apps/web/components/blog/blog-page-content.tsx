'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { browseBlogPostsForLocale } from '../../lib/api/public';
import { useListingPagination } from '../../lib/listing/pagination';
import { toListingPaginationLabels, scrollListingToTop } from '../../lib/listing/pagination-labels';
import type { PublicBlogPostListItem } from '@africatourismgate/types';
import { useTranslations as useLegacyTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ListingPageBody, ListingPaginationBar } from '../shared/listing-patterns';
import { ListingCardsSkeleton } from '../shared/loading-skeletons';
import { PageHero } from '../shared/page-hero';
import { BlogPostCard } from './blog-post-card';

export function BlogPageContent() {
  const locale = useLocale();
  const t = useTranslations('blog');
  const legacy = useLegacyTranslations();

  const [posts, setPosts] = useState<PublicBlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void browseBlogPostsForLocale(locale, { limit: 50 })
      .then(({ response }) => {
        if (!cancelled) {
          setPosts(response.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPosts([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, fetchId]);

  const paginationResetKey = useMemo(() => `${locale}-${fetchId}`, [locale, fetchId]);

  const {
    pageItems,
    page,
    setPage,
    totalPages,
    totalItems,
    pageSize,
    showPagination,
  } = useListingPagination(posts, paginationResetKey);

  const paginationLabels = useMemo(() => toListingPaginationLabels(legacy.listing), [legacy.listing]);

  const featuredPost = page === 1 && pageItems.length > 0 ? pageItems[0] : null;
  const gridPosts = page === 1 && pageItems.length > 1 ? pageItems.slice(1) : pageItems;

  const cardLabels = {
    readMore: t('readMore'),
    category: t('categoryBadge'),
    readingTime: (minutes: number) => t('readingTime', { minutes }),
  };

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        <PageHero
          title={
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{t('heroTitle')}</h1>
          }
          description={
            <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {t('heroSubtitle')}
            </p>
          }
        />
        <ListingPageBody>
          {loading ? (
            <ListingCardsSkeleton count={3} variant="grid" />
          ) : error ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-atg-border bg-atg-elevated px-6 py-10 text-center shadow-sm">
              <p className="text-atg-muted">{t('loadError')}</p>
              <button
                type="button"
                onClick={() => setFetchId((n) => n + 1)}
                className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                {t('retry')}
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-atg-border bg-atg-elevated/50 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-atg-fg">{t('noResults')}</p>
              <p className="mt-2 text-atg-muted">{t('noResultsHint')}</p>
            </div>
          ) : (
            <>
              {!showPagination && posts.length > 0 ? (
                <p className="mb-8 text-sm font-medium text-atg-muted">
                  {t('articlesCount', { count: posts.length })}
                </p>
              ) : null}

              {featuredPost ? (
                <div className="mb-8">
                  <BlogPostCard
                    post={featuredPost}
                    locale={locale}
                    variant="featured"
                    readMoreLabel={cardLabels.readMore}
                    categoryLabel={cardLabels.category}
                    readingTimeLabel={cardLabels.readingTime}
                  />
                </div>
              ) : null}

              {gridPosts.length > 0 ? (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {gridPosts.map((post) => (
                    <li key={post.id}>
                      <BlogPostCard
                        post={post}
                        locale={locale}
                        readMoreLabel={cardLabels.readMore}
                        categoryLabel={cardLabels.category}
                        readingTimeLabel={cardLabels.readingTime}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}

              {showPagination ? (
                <ListingPaginationBar
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  itemLabel={legacy.listing.resultItem}
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
