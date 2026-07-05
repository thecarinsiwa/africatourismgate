'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { browseBlogPosts } from '../../lib/api/public';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';
import { useListingPagination } from '../../lib/listing/pagination';
import { toListingPaginationLabels, scrollListingToTop } from '../../lib/listing/pagination-labels';
import type { PublicBlogPostListItem } from '@africatourismgate/types';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ListingPageBody, ListingPaginationBar } from '../shared/listing-patterns';
import { PageHero } from '../shared/page-hero';

export function BlogPageContent() {
  const locale = useLocale();
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

  const paginationLabels = useMemo(() => toListingPaginationLabels(l), [l]);

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        <PageHero title={b.heroTitle} subtitle={b.heroSubtitle} />
        <ListingPageBody>
          {loading ? (
            <p className="text-center text-atg-muted">{b.loading}</p>
          ) : error ? (
            <div className="mx-auto max-w-lg text-center">
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
            <div className="mx-auto max-w-lg text-center">
              <p className="text-lg font-semibold text-atg-fg">{b.noResults}</p>
              <p className="mt-2 text-atg-muted">{b.noResultsHint}</p>
            </div>
          ) : (
            <>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pageItems.map((post) => (
                  <li key={post.id}>
                    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-atg-border bg-atg-elevated shadow-sm transition-shadow hover:shadow-md dark:border-atg-border dark:bg-atg-elevated">
                      {post.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.coverImageUrl}
                          alt=""
                          className="h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center bg-primary/10 text-primary">
                          <svg className="h-12 w-12 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        {post.publishedAt ? (
                          <time
                            dateTime={post.publishedAt}
                            className="text-xs font-medium uppercase tracking-wide text-atg-muted"
                          >
                            {formatRelativeReviewDate(post.publishedAt, locale)}
                          </time>
                        ) : null}
                        <h2 className="mt-2 text-lg font-semibold text-atg-fg">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="transition-colors hover:text-primary"
                          >
                            {post.title}
                          </Link>
                        </h2>
                        {post.excerpt ? (
                          <p className="mt-2 line-clamp-3 flex-1 text-sm text-atg-muted">
                            {post.excerpt}
                          </p>
                        ) : null}
                        <Link
                          href={`/blog/${post.slug}`}
                          className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                        >
                          {b.readMore}
                          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
              {showPagination ? (
                <ListingPaginationBar
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
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
