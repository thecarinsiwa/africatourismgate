'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import type { PublicBlogPostListItem } from '@africatourismgate/types';
import {
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import { browseBlogPostsForLocale } from '../../lib/api/public';
import {
  DEFAULT_BLOG_VIEW_MODE,
  BLOG_VIEW_MODE_STORAGE_KEY,
  isBlogViewMode,
  type BlogViewMode,
} from '../../lib/blog/view-mode';
import { usePersistentState } from '../../lib/hooks/use-persistent-state';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';
import { useListingPagination } from '../../lib/listing/pagination';
import { toListingPaginationLabels, scrollListingToTop } from '../../lib/listing/pagination-labels';
import { PLACEHOLDER_COVER_IMAGE } from '../../lib/media/stock-images';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PageHero } from '../shared/page-hero';
import {
  CompactViewIcon,
  GridViewIcon,
  TableViewIcon,
  ViewModeToggle,
} from '../shared/view-mode-toggle';

type Translate = ReturnType<typeof useTranslations<'blog'>>;

function matchesQuery(post: PublicBlogPostListItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    post.title.toLowerCase().includes(q) ||
    (post.excerpt?.toLowerCase().includes(q) ?? false)
  );
}

function coverUrl(post: PublicBlogPostListItem): string {
  return post.coverImageUrl?.trim() || PLACEHOLDER_COVER_IMAGE;
}

function BlogGrid({
  posts,
  locale,
  t,
}: {
  posts: PublicBlogPostListItem[];
  locale: string;
  t: Translate;
}) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <article className="flex h-full flex-col overflow-hidden rounded-xl border border-atg-border bg-atg-elevated transition-shadow hover:shadow-md">
            <Link
              href={`/blog/${post.slug}`}
              className="relative block aspect-[16/10] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img
                src={coverUrl(post)}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            </Link>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              {post.publishedAt ? (
                <time
                  dateTime={post.publishedAt}
                  className="text-xs font-medium uppercase tracking-wide text-atg-muted"
                >
                  {formatRelativeReviewDate(post.publishedAt, locale)}
                </time>
              ) : null}
              <h2 className="mt-1.5 text-lg font-semibold text-atg-fg">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition-colors hover:text-primary"
                >
                  {post.title}
                </Link>
              </h2>
              {post.excerpt ? (
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-atg-muted">{post.excerpt}</p>
              ) : null}
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-flex min-h-[40px] items-center text-sm font-semibold text-primary hover:text-primary/80"
              >
                {t('readMore')}
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

function BlogCompact({
  posts,
  locale,
  t,
}: {
  posts: PublicBlogPostListItem[];
  locale: string;
  t: Translate;
}) {
  return (
    <ul className="divide-y divide-atg-border overflow-hidden rounded-xl border border-atg-border bg-atg-elevated">
      {posts.map((post) => (
        <li key={post.id}>
          <article className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-primary/5 sm:gap-4 sm:px-4 sm:py-3">
            <Link
              href={`/blog/${post.slug}`}
              className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md ring-1 ring-atg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-14 sm:w-20"
            >
              <img src={coverUrl(post)} alt="" className="h-full w-full object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h2 className="truncate text-sm font-semibold text-atg-fg sm:text-base">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition-colors hover:text-primary"
                  >
                    {post.title}
                  </Link>
                </h2>
                {post.publishedAt ? (
                  <time
                    dateTime={post.publishedAt}
                    className="shrink-0 text-xs tabular-nums text-atg-muted"
                  >
                    {formatRelativeReviewDate(post.publishedAt, locale)}
                  </time>
                ) : null}
              </div>
              {post.excerpt ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-atg-muted sm:text-sm">
                  {post.excerpt}
                </p>
              ) : null}
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="hidden shrink-0 text-xs font-semibold text-primary hover:text-primary/80 sm:inline"
            >
              {t('readMore')}
            </Link>
          </article>
        </li>
      ))}
    </ul>
  );
}

function BlogTable({
  posts,
  columns,
  loading,
  searchActive,
  t,
}: {
  posts: PublicBlogPostListItem[];
  columns: ColumnDef<PublicBlogPostListItem, unknown>[];
  loading: boolean;
  searchActive: boolean;
  t: Translate;
}) {
  return (
    <Card variant="dashboard" padding="none" className="overflow-hidden">
      <DataTable
        columns={columns}
        data={posts}
        isLoading={loading}
        loadingMessage={t('loading')}
        emptyMessage={searchActive ? t('noSearchResultsHint') : t('noResultsHint')}
        emptyVariant={searchActive ? 'search' : 'default'}
        getRowId={(row) => row.id}
        aria-label={t('tableAria')}
        expandRowLabel={t('expandRow')}
        collapseRowLabel={t('collapseRow')}
        expandRowAriaLabel={t('expandRowAria')}
      />
    </Card>
  );
}

export function BlogPageContent() {
  const locale = useLocale();
  const t = useTranslations('blog');
  const tListing = useTranslations('listing');
  const tNav = useTranslations('nav');

  const [posts, setPosts] = useState<PublicBlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [usedLocaleFallback, setUsedLocaleFallback] = useState(false);
  const [fetchId, setFetchId] = useState(0);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = usePersistentState<BlogViewMode>(
    BLOG_VIEW_MODE_STORAGE_KEY,
    DEFAULT_BLOG_VIEW_MODE,
    isBlogViewMode,
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setUsedLocaleFallback(false);

    void browseBlogPostsForLocale(locale, { limit: 50 })
      .then(({ response, usedLocaleFallback: fallback }) => {
        if (!cancelled) {
          setPosts(response.data);
          setUsedLocaleFallback(fallback);
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

  const filteredPosts = useMemo(
    () => posts.filter((post) => matchesQuery(post, search)),
    [posts, search],
  );

  const paginationResetKey = useMemo(
    () => `${locale}-${fetchId}-${search.trim()}-${viewMode}`,
    [locale, fetchId, search, viewMode],
  );

  const {
    pageItems,
    page,
    setPage,
    totalPages,
    totalItems,
    pageSize,
    showPagination,
  } = useListingPagination(filteredPosts, paginationResetKey);

  const paginationLabels = useMemo(() => toListingPaginationLabels(tListing), [tListing]);

  const columns = useMemo<ColumnDef<PublicBlogPostListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('tableArticle'),
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="flex min-w-0 items-start gap-3">
              <img
                src={coverUrl(post)}
                alt=""
                className="h-14 w-20 shrink-0 object-cover ring-1 ring-atg-border"
              />
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-atg-fg">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {post.title}
                  </Link>
                </p>
                {post.excerpt ? (
                  <p className="line-clamp-2 text-sm text-atg-muted">{post.excerpt}</p>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        id: 'publishedAt',
        header: t('tablePublished'),
        meta: { hideOnMobile: true, mobileDetailLabel: t('tablePublished') },
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums text-atg-muted">
            {row.original.publishedAt
              ? formatRelativeReviewDate(row.original.publishedAt, locale)
              : '—'}
          </span>
        ),
      },
      {
        id: 'locale',
        header: t('tableLocale'),
        meta: {
          align: 'center',
          hideOnMobile: true,
          mobileDetailLabel: t('tableLocale'),
        },
        cell: ({ row }) => (
          <span className="text-sm uppercase text-atg-muted">{row.original.locale}</span>
        ),
      },
      {
        id: 'actions',
        header: t('tableActions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="view"
              href={`/blog/${row.original.slug}`}
              label={t('readMore')}
            />
          </DataTableActions>
        ),
      },
    ],
    [locale, t],
  );

  const viewOptions = useMemo(
    () => [
      { value: 'grid' as const, label: t('viewGrid'), icon: <GridViewIcon /> },
      { value: 'compact' as const, label: t('viewCompact'), icon: <CompactViewIcon /> },
      {
        value: 'table' as const,
        label: t('viewTable'),
        icon: <TableViewIcon />,
        className: 'hidden md:inline-flex',
      },
    ],
    [t],
  );

  const searchActive = Boolean(search.trim());
  const showEmpty =
    !loading && !error && filteredPosts.length === 0;

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

        <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          {usedLocaleFallback ? (
            <p className="rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-muted">
              {t('localeFallback')}
            </p>
          ) : null}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm text-atg-muted">{t('resultsLabel')}</p>
              <p className="text-lg font-bold text-atg-fg">
                {t('resultsCount', { count: filteredPosts.length })}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
              <label className="block w-full sm:max-w-xs">
                <span className="sr-only">{t('searchLabel')}</span>
                <input
                  id="blog-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-4 text-sm text-atg-fg placeholder:text-atg-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <ViewModeToggle
                value={viewMode}
                options={viewOptions}
                onChange={setViewMode}
                ariaLabel={t('viewModeLabel')}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-atg-border bg-atg-elevated px-5 py-10 text-center">
              <p className="text-lg font-semibold text-atg-fg">{t('loadError')}</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setFetchId((n) => n + 1)}
                  className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  {t('retry')}
                </button>
                <Link
                  href="/"
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-5 text-sm font-semibold text-atg-fg"
                >
                  {tNav('home')}
                </Link>
              </div>
            </div>
          ) : loading ? (
            <p className="py-16 text-center text-sm text-atg-muted">{t('loading')}</p>
          ) : showEmpty ? (
            <div className="rounded-xl border border-atg-border bg-atg-elevated px-5 py-10 text-center">
              <p className="text-lg font-semibold text-atg-fg">
                {searchActive ? t('noSearchResults') : t('noResults')}
              </p>
              <p className="mt-2 text-sm text-atg-muted">
                {searchActive ? t('noSearchResultsHint') : t('noResultsHint')}
              </p>
              {searchActive ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mt-5 inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 text-sm font-semibold text-atg-fg hover:border-primary"
                >
                  {t('clearSearch')}
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <div data-view-mode={viewMode}>
                {viewMode === 'grid' ? (
                  <BlogGrid posts={pageItems} locale={locale} t={t} />
                ) : null}
                {viewMode === 'compact' ? (
                  <BlogCompact posts={pageItems} locale={locale} t={t} />
                ) : null}
                {viewMode === 'table' ? (
                  <>
                    <div className="md:hidden">
                      <BlogCompact posts={pageItems} locale={locale} t={t} />
                    </div>
                    <div className="hidden md:block">
                      <BlogTable
                        posts={pageItems}
                        columns={columns}
                        loading={false}
                        searchActive={searchActive}
                        t={t}
                      />
                    </div>
                  </>
                ) : null}
              </div>

              {showPagination ? (
                <DataTablePagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  itemLabel={tListing('resultItem')}
                  labels={paginationLabels}
                  onPageChange={(next) => {
                    setPage(next);
                    scrollListingToTop();
                  }}
                />
              ) : null}
            </>
          )}
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
