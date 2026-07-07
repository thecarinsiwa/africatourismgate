'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { PublicBlogPostListItem } from '@africatourismgate/types';
import { resolveBlogCoverUrl } from '../../lib/blog/cover-images';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';
import type { Translations } from '../../lib/i18n/translations';

type BlogCardProps = {
  post: PublicBlogPostListItem;
  locale: string;
  labels: Translations['blog'];
  variant?: 'grid' | 'compact';
};

export function BlogCard({ post, locale, labels, variant = 'grid' }: BlogCardProps) {
  const coverUrl = resolveBlogCoverUrl(post);
  const href = `/blog/${post.slug}`;
  const isCompact = variant === 'compact';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-atg-border dark:bg-atg-elevated">
      <Link href={href} className="relative block overflow-hidden">
        <div className={isCompact ? 'relative h-48' : 'relative h-56 sm:h-60'}>
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b2f]/90 via-[#1b1b2f]/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <span className="inline-flex rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              {labels.cardBadge}
            </span>
            {post.publishedAt ? (
              <time
                dateTime={post.publishedAt}
                className="mt-2 block text-xs font-medium uppercase tracking-wide text-white/75"
              >
                {formatRelativeReviewDate(post.publishedAt, locale)}
              </time>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 h-0.5 w-10 rounded-full bg-primary/80" aria-hidden />
        <h2 className="text-lg font-bold leading-snug text-atg-fg sm:text-xl">
          <Link href={href} className="transition-colors hover:text-primary">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-atg-muted">
            {post.excerpt}
          </p>
        ) : null}
        <Link
          href={href}
          className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {labels.readMore}
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
