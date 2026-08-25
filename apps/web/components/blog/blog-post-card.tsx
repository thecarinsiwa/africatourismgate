'use client';

import Link from 'next/link';
import type { PublicBlogPostListItem } from '@africatourismgate/types';
import { cn } from '@africatourismgate/ui';
import { estimateReadingTimeMinutes } from '../../lib/blog/reading-time';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';

type BlogPostCardProps = {
  post: PublicBlogPostListItem;
  locale: string;
  readMoreLabel: string;
  categoryLabel: string;
  readingTimeLabel: (minutes: number) => string;
  variant?: 'default' | 'featured';
};

function BlogCover({
  post,
  categoryLabel,
  className,
}: {
  post: PublicBlogPostListItem;
  categoryLabel: string;
  className?: string;
}) {
  return (
    <div className={cn('relative overflow-hidden bg-[#1b1b2f]', className)}>
      {post.coverImageUrl ? (
        <>
          <img
            src={post.coverImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2744] via-[#1b1b2f] to-primary/70" />
      )}
      <span className="absolute left-4 top-4 z-10 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        {categoryLabel}
      </span>
    </div>
  );
}

export function BlogPostCard({
  post,
  locale,
  readMoreLabel,
  categoryLabel,
  readingTimeLabel,
  variant = 'default',
}: BlogPostCardProps) {
  const href = `/blog/${post.slug}`;
  const readingMinutes = estimateReadingTimeMinutes(post.excerpt);

  if (variant === 'featured') {
    return (
      <article className="group overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-lg transition-shadow hover:shadow-xl dark:border-atg-border">
        <div className="grid lg:grid-cols-2">
          <BlogCover post={post} categoryLabel={categoryLabel} className="min-h-[240px] lg:min-h-[360px]" />
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <BlogPostMeta
              post={post}
              locale={locale}
              readingMinutes={readingMinutes}
              readingTimeLabel={readingTimeLabel}
            />
            <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-atg-fg sm:text-3xl">
              <Link href={href} className="transition-colors hover:text-primary">
                {post.title}
              </Link>
            </h2>
            {post.excerpt ? (
              <p className="mt-4 line-clamp-4 text-base leading-relaxed text-atg-muted">{post.excerpt}</p>
            ) : null}
            <Link
              href={href}
              className="mt-6 inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              {readMoreLabel}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-atg-border">
      <Link href={href} className="relative block shrink-0" tabIndex={-1} aria-hidden>
        <BlogCover post={post} categoryLabel={categoryLabel} className="aspect-[16/10]" />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <BlogPostMeta
          post={post}
          locale={locale}
          readingMinutes={readingMinutes}
          readingTimeLabel={readingTimeLabel}
        />
        <h2 className="mt-3 text-lg font-bold leading-snug text-atg-fg sm:text-xl">
          <Link href={href} className="transition-colors hover:text-primary">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-atg-muted">{post.excerpt}</p>
        ) : null}
        <Link
          href={href}
          className="mt-4 inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {readMoreLabel}
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

function BlogPostMeta({
  post,
  locale,
  readingMinutes,
  readingTimeLabel,
}: {
  post: PublicBlogPostListItem;
  locale: string;
  readingMinutes: number;
  readingTimeLabel: (minutes: number) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-wide text-atg-muted">
      {post.publishedAt ? (
        <time dateTime={post.publishedAt}>{formatRelativeReviewDate(post.publishedAt, locale)}</time>
      ) : null}
      {post.publishedAt ? <span aria-hidden className="text-atg-border">·</span> : null}
      <span>{readingTimeLabel(readingMinutes)}</span>
    </div>
  );
}
