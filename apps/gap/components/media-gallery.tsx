import Image from 'next/image';
import Link from 'next/link';
import type { PublicGapMediaItem } from '@africatourismgate/types';
import { getTranslations } from 'next-intl/server';
import { resolveGapMediaUrl } from '@/lib/api/public-gap';

type MediaGalleryProps = {
  items: PublicGapMediaItem[];
  compact?: boolean;
};

export async function MediaGallery({ items, compact = false }: MediaGalleryProps) {
  const tMedia = await getTranslations('media');
  const tHome = await getTranslations('home');

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="rounded-xl border border-atg-border bg-atg-elevated/50 px-4 py-8 text-center text-atg-muted">
          {tMedia('empty')}
        </p>
      </div>
    );
  }

  const displayItems = compact ? items.slice(0, 6) : items;

  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-atg-fg">
              {compact ? tHome('exploreMedia') : tMedia('title')}
            </h2>
            {!compact ? <p className="mt-3 text-atg-muted">{tMedia('subtitle')}</p> : null}
          </div>
          {compact ? (
            <Link
              href="/media"
              className="inline-flex text-sm font-semibold text-primary hover:underline"
            >
              {tHome('exploreMedia')} →
            </Link>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item) => {
            const thumb =
              resolveGapMediaUrl(item.thumbnailUrl) ??
              resolveGapMediaUrl(item.fileUrl) ??
              resolveGapMediaUrl(item.externalUrl);
            const href = resolveGapMediaUrl(item.externalUrl) ?? resolveGapMediaUrl(item.fileUrl);
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated"
              >
                {thumb ? (
                  <div className="relative aspect-[4/3] w-full bg-atg-surface">
                    <Image
                      src={thumb}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
                      {item.mediaType === 'video' ? tMedia('video') : tMedia('image')}
                    </span>
                  </div>
                ) : null}
                <div className="space-y-2 p-4">
                  <h3 className="font-semibold text-atg-fg">{item.title}</h3>
                  {item.description ? (
                    <p className="text-sm text-atg-muted">{item.description}</p>
                  ) : null}
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-sm font-medium text-primary hover:underline"
                    >
                      {item.mediaType === 'video' ? tMedia('watch') : tMedia('image')} →
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
