'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { browseBlogPosts, getBlogPostBySlug } from '../../lib/api/public';
import { resolveBlogCoverUrl } from '../../lib/blog/cover-images';
import { useAppLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';
import type { PublicBlogPostDetail, PublicBlogPostListItem } from '@africatourismgate/types';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { BlogCard } from './blog-card';
import { BlogCardSkeleton } from './blog-skeleton';

type BlogDetailPageContentProps = {
  slug: string;
};

export function BlogDetailPageContent({ slug }: BlogDetailPageContentProps) {
  const locale = useAppLocale();
  const t = useTranslations();
  const b = t.blog;

  const [post, setPost] = useState<PublicBlogPostDetail | null>(null);
  const [related, setRelated] = useState<PublicBlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void Promise.all([
      getBlogPostBySlug(slug, locale),
      browseBlogPosts({ locale, limit: 4 }),
    ])
      .then(([detail, list]) => {
        if (cancelled) return;
        setPost(detail);
        setRelated(list.data.filter((item) => item.slug !== slug).slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) {
          setPost(null);
          setRelated([]);
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

  const coverUrl = useMemo(
    () => (post ? resolveBlogCoverUrl(post) : null),
    [post],
  );

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        {loading ? (
          <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6">
            <div className="h-72 animate-pulse rounded-2xl bg-atg-surface sm:h-96" />
            <BlogCardSkeleton />
          </div>
        ) : error || !post ? (
          <div className="mx-auto max-w-lg px-4 py-16 text-center">
            <p className="text-lg font-semibold">{b.noResults}</p>
            <Link
              href="/blog"
              className="mt-6 inline-flex min-h-[44px] items-center text-primary hover:text-primary/80"
            >
              {b.backToBlog}
            </Link>
          </div>
        ) : (
          <>
            <section className="relative min-h-[320px] overflow-hidden bg-[#1b1b2f] sm:min-h-[420px]">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b2f] via-[#1b1b2f]/55 to-[#1b1b2f]/30" />
              <div className="relative mx-auto flex min-h-[320px] max-w-4xl flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[420px] sm:px-6 sm:pb-14 lg:px-8">
                <nav className="mb-6 text-sm text-white/70" aria-label="Breadcrumb">
                  <ol className="flex flex-wrap items-center gap-2">
                    <li>
                      <Link href="/" className="transition-colors hover:text-white">
                        {b.breadcrumbHome}
                      </Link>
                    </li>
                    <li aria-hidden>/</li>
                    <li>
                      <Link href="/blog" className="transition-colors hover:text-white">
                        {b.breadcrumbBlog}
                      </Link>
                    </li>
                  </ol>
                </nav>
                <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                  {b.cardBadge}
                </span>
                <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                  {post.title}
                </h1>
                {post.excerpt ? (
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                    {post.excerpt}
                  </p>
                ) : null}
                {post.publishedAt ? (
                  <p className="mt-5 text-sm text-white/65">
                    {b.publishedOn}{' '}
                    <time dateTime={post.publishedAt}>
                      {formatRelativeReviewDate(post.publishedAt, locale)}
                    </time>
                  </p>
                ) : null}
              </div>
            </section>

            <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
              <div
                className="blog-content prose prose-lg prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-atg-fg prose-p:leading-relaxed prose-p:text-atg-muted prose-a:text-primary prose-img:rounded-xl prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mt-12 flex flex-wrap gap-3 border-t border-atg-border pt-8">
                <Link
                  href="/blog"
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-atg-border px-4 py-2.5 text-sm font-semibold text-atg-fg transition-colors hover:border-primary hover:text-primary"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {b.backToBlog}
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
                >
                  {b.explorePackages}
                </Link>
              </div>
            </article>

            {related.length > 0 ? (
              <section
                className="border-t border-atg-border bg-atg-surface py-14 dark:bg-atg-surface"
                aria-labelledby="blog-related-heading"
              >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <h2
                    id="blog-related-heading"
                    className="text-2xl font-bold uppercase tracking-wide text-atg-fg"
                  >
                    {b.relatedTitle}
                  </h2>
                  <p className="mt-2 text-sm text-atg-muted">{b.relatedHint}</p>
                  <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((item) => (
                      <li key={item.id}>
                        <BlogCard post={item} locale={locale} labels={b} variant="compact" />
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
