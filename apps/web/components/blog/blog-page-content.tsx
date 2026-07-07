'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { browseBlogPosts } from '../../lib/api/public';
import { resolveBlogCoverUrl } from '../../lib/blog/cover-images';
import { useAppLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { useListingPagination } from '../../lib/listing/pagination';
import { toListingPaginationLabels, scrollListingToTop } from '../../lib/listing/pagination-labels';
import type { PublicBlogPostListItem } from '@africatourismgate/types';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ListingPageBody, ListingPaginationBar } from '../shared/listing-patterns';
import { PageHero } from '../shared/page-hero';
import { BlogCard } from './blog-card';
import { BlogFeaturedCard } from './blog-featured-card';
import { BlogFeaturedSkeleton, BlogGridSkeleton } from './blog-skeleton';

export function BlogPageContent() {
  const locale = useAppLocale();
  const t = useTranslations();
  const b = t.blog;
  const l = t.listing;

  const [posts, setPosts] = useState<PublicBlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void browseBlogPosts({ locale, limit: 50 })
      .then((response) => {
        if (!cancelled) setPosts(response.data);
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

  const featuredPost = posts[0] ?? null;
  const gridPosts = posts.slice(1);

  const paginationResetKey = useMemo(() => `${locale}-${fetchId}`, [locale, fetchId]);

  const {
    pageItems,
    page,
    setPage,
    totalPages,
    totalItems,
    pageSize,
    showPagination,
  } = useListingPagination(gridPosts, paginationResetKey);

  const paginationLabels = useMemo(() => toListingPaginationLabels(l), [l]);

  const heroBackground = featuredPost ? resolveBlogCoverUrl(featuredPost) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        <PageHero
          backgroundImage={heroBackground}
          title={
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary/90">
                {b.heroBadge}
              </p>
              <h1 className="mt-3 text-3xl font-bold uppercase tracking-wide sm:text-4xl lg:text-5xl">
                {b.heroTitle}
              </h1>
            </div>
          }
          description={
            <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              {b.heroSubtitle}
            </p>
          }
          actions={
            <Link
              href="/packages"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              {b.explorePackages}
            </Link>
          }
        />

        <ListingPageBody>
          {loading ? (
            <div className="space-y-12">
              <BlogFeaturedSkeleton />
              <BlogGridSkeleton count={3} />
            </div>
          ) : error ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-atg-border bg-atg-elevated px-6 py-10 text-center shadow-sm">
              <p className="text-atg-muted">{b.loadError}</p>
              <button
                type="button"
                onClick={() => setFetchId((n) => n + 1)}
                className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                {b.retry}
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-atg-border bg-atg-surface px-6 py-12 text-center">
              <p className="text-lg font-semibold text-atg-fg">{b.noResults}</p>
              <p className="mt-2 text-sm text-atg-muted">{b.noResultsHint}</p>
            </div>
          ) : (
            <div className="space-y-14">
              {featuredPost ? (
                <section aria-labelledby="blog-featured-heading">
                  <h2 id="blog-featured-heading" className="sr-only">
                    {b.featuredLabel}
                  </h2>
                  <BlogFeaturedCard post={featuredPost} locale={locale} labels={b} />
                </section>
              ) : null}

              {gridPosts.length > 0 ? (
                <section aria-labelledby="blog-stories-heading">
                  <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                        {b.heroBadge}
                      </p>
                      <h2
                        id="blog-stories-heading"
                        className="mt-2 text-2xl font-bold uppercase tracking-wide text-atg-fg sm:text-3xl"
                      >
                        {b.storiesLabel}
                      </h2>
                      <p className="mt-2 max-w-xl text-sm text-atg-muted">{b.storiesHint}</p>
                    </div>
                    <p className="text-sm font-medium text-atg-muted">
                      {posts.length} {b.articlesCount}
                    </p>
                  </div>

                  <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {pageItems.map((post) => (
                      <li key={post.id}>
                        <BlogCard post={post} locale={locale} labels={b} />
                      </li>
                    ))}
                  </ul>

                  {showPagination ? (
                    <div className="mt-10">
                      <ListingPaginationBar
                        page={page}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        itemLabel={l.resultItem}
                        labels={paginationLabels}
                        onPageChange={(next) => {
                          setPage(next);
                          scrollListingToTop();
                        }}
                      />
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>
          )}
        </ListingPageBody>
      </main>
      <HomeFooter />
    </div>
  );
}
