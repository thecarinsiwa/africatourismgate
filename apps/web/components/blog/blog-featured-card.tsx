'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { PublicBlogPostListItem } from '@africatourismgate/types';
import { resolveBlogCoverUrl } from '../../lib/blog/cover-images';
import { formatRelativeReviewDate } from '../../lib/i18n/format-relative-date';
import type { Translations } from '../../lib/i18n/translations';

type BlogFeaturedCardProps = {
  post: PublicBlogPostListItem;
  locale: string;
  labels: Translations['blog'];
};

export function BlogFeaturedCard({ post, locale, labels }: BlogFeaturedCardProps) {
  const coverUrl = resolveBlogCoverUrl(post);
  const href = `/blog/${post.slug}`;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-atg-border bg-[#1b1b2f] shadow-xl dark:border-white/10">
      <div className="grid lg:grid-cols-2">
        <Link href={href} className="relative block min-h-[280px] overflow-hidden lg:min-h-[420px]">
          <Image
            src={coverUrl}
            alt=""
            fill
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1b1b2f]/20 via-transparent to-[#1b1b2f]/60 lg:bg-gradient-to-t lg:from-[#1b1b2f]/80 lg:via-[#1b1b2f]/20 lg:to-transparent" />
        </Link>

        <div className="relative flex flex-col justify-center px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/90">
            {labels.featuredLabel}
          </p>
          <span className="mt-3 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            {labels.cardBadge}
          </span>
          <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
            <Link href={href} className="transition-colors hover:text-primary/90">
              {post.title}
            </Link>
          </h2>
          {post.excerpt ? (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">
              {post.excerpt}
            </p>
          ) : null}
          {post.publishedAt ? (
            <p className="mt-4 text-sm text-white/60">
              {labels.publishedOn}{' '}
              <time dateTime={post.publishedAt}>
                {formatRelativeReviewDate(post.publishedAt, locale)}
              </time>
            </p>
          ) : null}
          <Link
            href={href}
            className="mt-8 inline-flex min-h-[48px] w-fit items-center rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
          >
            {labels.readMore}
          </Link>
        </div>
      </div>
    </article>
  );
}
