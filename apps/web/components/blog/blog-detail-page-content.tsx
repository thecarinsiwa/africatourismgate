'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { browseBlogPostsForLocale, getBlogPostBySlugForLocale } from '../../lib/api/public';
import { estimateReadingTimeMinutes } from '../../lib/blog/reading-time';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';
import type { PublicBlogPostDetail, PublicBlogPostListItem } from '@africatourismgate/types';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { BlogArticleBody } from './blog-article-body';
import { BlogPostCard } from './blog-post-card';

type BlogDetailPageContentProps = {
  slug: string;
};

function BlogDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[min(55vh,520px)] bg-[#1b1b2f]" />
      <div className="relative z-10 -mt-12 mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-t-3xl bg-atg-bg px-6 py-10 sm:px-10">
          <div className="h-4 w-32 rounded bg-atg-border" />
          <div className="mt-6 h-8 w-full rounded bg-atg-border" />
          <div className="mt-3 h-8 w-2/3 rounded bg-atg-border" />
          <div className="mt-8 space-y-4">
            <div className="h-4 w-full rounded bg-atg-border" />
            <div className="h-4 w-full rounded bg-atg-border" />
            <div className="h-4 w-4/5 rounded bg-atg-border" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogDetailPageContent({ slug }: BlogDetailPageContentProps) {
  const locale = useLocale();
  const t = useTranslations('blog');

  const [post, setPost] = useState<PublicBlogPostDetail | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<PublicBlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void getBlogPostBySlugForLocale(slug, locale)
      .then((data) => {
        if (!cancelled) {
          setPost(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPost(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, locale]);

  useEffect(() => {
    let cancelled = false;

    void browseBlogPostsForLocale(locale, { limit: 10 })
      .then(({ response }) => {
        if (cancelled) return;
        setRelatedPosts(response.data.filter((item) => item.slug !== slug).slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setRelatedPosts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, locale]);

  const readingMinutes = useMemo(
    () => (post ? estimateReadingTimeMinutes(post.content, post.excerpt) : 1),
    [post],
  );

  const cardLabels = {
    readMore: t('readMore'),
    category: t('categoryBadge'),
    readingTime: (minutes: number) => t('readingTime', { minutes }),
  };

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        {loading ? (
          <BlogDetailSkeleton />
        ) : error || !post ? (
          <div className="mx-auto max-w-3xl px-4 py-20 text-center">
            <p className="text-lg font-semibold">{t('noResults')}</p>
            <Link
              href="/blog"
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-atg-border px-5 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('backToBlog')}
            </Link>
          </div>
        ) : (
          <>
            <section className="relative min-h-[min(55vh,520px)] overflow-hidden bg-[#1b1b2f] text-white">
              {post.coverImageUrl ? (
                <>
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b2f] via-[#1b1b2f]/60 to-[#1b1b2f]/30" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f2744] via-[#1b1b2f] to-primary/80" />
              )}

              <div className="relative mx-auto flex min-h-[min(55vh,520px)] max-w-4xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:px-8">
                <nav className="mb-6 text-sm text-white/70" aria-label="Breadcrumb">
                  <ol className="flex flex-wrap items-center gap-2">
                    <li>
                      <Link href="/" className="transition-colors hover:text-white">
                        {t('breadcrumbHome')}
                      </Link>
                    </li>
                    <li aria-hidden>/</li>
                    <li>
                      <Link href="/blog" className="transition-colors hover:text-white">
                        {t('breadcrumbBlog')}
                      </Link>
                    </li>
                  </ol>
                </nav>

                <span className="inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {t('categoryBadge')}
                </span>

                <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {post.title}
                </h1>

                {post.excerpt ? (
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                    {post.excerpt}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
                  {post.publishedAt ? (
                    <time dateTime={post.publishedAt}>
                      {t('publishedOn')}{' '}
                      {formatRelativeReviewDate(post.publishedAt, locale)}
                    </time>
                  ) : null}
                  <span aria-hidden>·</span>
                  <span>{t('readingTime', { minutes: readingMinutes })}</span>
                </div>
              </div>
            </section>

            <article className="relative z-10 -mt-10">
              <div className="mx-auto max-w-3xl rounded-t-3xl bg-atg-bg px-4 pb-16 pt-10 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:px-8 lg:px-12">
                <BlogArticleBody html={post.content} />

                <footer className="mt-12 border-t border-atg-border pt-8">
                  <Link
                    href="/blog"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-atg-border px-5 py-2.5 text-sm font-semibold text-atg-fg transition-colors hover:border-primary hover:text-primary dark:border-atg-border"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t('backToBlog')}
                  </Link>
                </footer>
              </div>
            </article>

            {relatedPosts.length > 0 ? (
              <section className="border-t border-atg-border bg-atg-elevated/40 py-14 dark:bg-atg-surface/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl font-bold tracking-tight text-atg-fg">{t('relatedArticles')}</h2>
                  <p className="mt-2 text-atg-muted">{t('relatedArticlesHint')}</p>
                  <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedPosts.map((related) => (
                      <li key={related.id}>
                        <BlogPostCard
                          post={related}
                          locale={locale}
                          readMoreLabel={cardLabels.readMore}
                          categoryLabel={cardLabels.category}
                          readingTimeLabel={cardLabels.readingTime}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
