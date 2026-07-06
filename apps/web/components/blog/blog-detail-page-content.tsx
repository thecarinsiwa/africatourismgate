'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBlogPostBySlugForLocale } from '../../lib/api/public';
import { useAppLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';
import type { PublicBlogPostDetail } from '@africatourismgate/types';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PageHero } from '../shared/page-hero';

type BlogDetailPageContentProps = {
  slug: string;
};

export function BlogDetailPageContent({ slug }: BlogDetailPageContentProps) {
  const locale = useAppLocale();
  const t = useTranslations();
  const b = t.blog;

  const [post, setPost] = useState<PublicBlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    void getBlogPostBySlugForLocale(slug, locale)
      .then((data) => {
        if (!cancelled) setPost(data);
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

  return (
    <div className="flex min-h-screen flex-col bg-atg-bg text-atg-fg">
      <HomeHeader />
      <main className="flex-1">
        {loading ? (
          <div className="mx-auto max-w-3xl px-4 py-16 text-center text-atg-muted">
            {b.loading}
          </div>
        ) : error || !post ? (
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
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
            <PageHero
              title={
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
              }
              description={
                post.excerpt ? (
                  <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                    {post.excerpt}
                  </p>
                ) : undefined
              }
            />
            <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
              <nav className="mb-6 text-sm text-atg-muted" aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-2">
                  <li>
                    <Link href="/" className="hover:text-primary">
                      {b.breadcrumbHome}
                    </Link>
                  </li>
                  <li aria-hidden>/</li>
                  <li>
                    <Link href="/blog" className="hover:text-primary">
                      {b.breadcrumbBlog}
                    </Link>
                  </li>
                </ol>
              </nav>

              {post.publishedAt ? (
                <p className="text-sm text-atg-muted">
                  {b.publishedOn}{' '}
                  <time dateTime={post.publishedAt}>
                    {formatRelativeReviewDate(post.publishedAt, locale)}
                  </time>
                </p>
              ) : null}

              {post.coverImageUrl ? (
                <img
                  src={post.coverImageUrl}
                  alt=""
                  className="mt-6 w-full rounded-xl object-cover"
                />
              ) : null}

              <div
                className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-p:text-atg-muted prose-headings:text-atg-fg"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <Link
                href="/blog"
                className="mt-10 inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {b.backToBlog}
              </Link>
            </article>
          </>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
