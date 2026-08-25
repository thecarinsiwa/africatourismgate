'use client';

import type { ActivityImage } from '@africatourismgate/types';
import { Button, cn } from '@africatourismgate/ui';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { AdminImageViewerModal } from '../admin-image-viewer-modal';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

type ActivityPhotosCarouselProps = {
  images: ActivityImage[];
  altFallback: string;
  className?: string;
};

export function ActivityPhotosCarousel({
  images,
  altFallback,
  className,
}: ActivityPhotosCarouselProps) {
  const t = useTranslations('modules.activities.view');
  const tGallery = useTranslations('modules.common.imagesGallery');
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    setIndex(0);
    setViewerOpen(false);
  }, [images]);

  const count = images.length;
  const safeIndex = count === 0 ? 0 : ((index % count) + count) % count;
  const current = count > 0 ? images[safeIndex] : null;
  const alt = current?.caption?.trim() || altFallback;

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % count);
  }, [count]);

  if (count === 0 || !current) {
    return <p className="text-sm text-atg-muted">{t('imagesEmpty')}</p>;
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <div
        className="relative aspect-video w-full overflow-hidden rounded-lg border border-atg-border bg-atg-surface"
        role="group"
        aria-roledescription="carousel"
        aria-label={t('imagesTitle')}
      >
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          className="absolute inset-0 z-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          aria-label={tGallery('viewerOpen')}
        >
          <Image
            key={current.id}
            src={resolveMediaUrl(current.url)}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 20rem"
            unoptimized
            priority={safeIndex === 0}
          />
        </button>

        {count > 1 ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute left-1.5 top-1/2 z-10 h-7 w-7 -translate-y-1/2 !px-0 bg-atg-elevated/90 shadow-sm"
              onClick={goPrev}
              aria-label={tGallery('viewerPrev')}
            >
              ‹
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute right-1.5 top-1/2 z-10 h-7 w-7 -translate-y-1/2 !px-0 bg-atg-elevated/90 shadow-sm"
              onClick={goNext}
              aria-label={tGallery('viewerNext')}
            >
              ›
            </Button>
            <p className="pointer-events-none absolute bottom-1.5 right-1.5 z-10 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white">
              {safeIndex + 1}/{count}
            </p>
          </>
        ) : null}
      </div>

      {current.caption?.trim() ? (
        <p className="truncate text-xs text-atg-muted">{current.caption}</p>
      ) : null}

      {count > 1 ? (
        <ul className="flex gap-1 overflow-x-auto pb-0.5" aria-label={t('imagesTitle')}>
          {images.map((image, i) => {
            const active = i === safeIndex;
            return (
              <li key={image.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`${i + 1}`}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'relative h-9 w-9 overflow-hidden rounded-md border transition',
                    active
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-atg-border opacity-80 hover:opacity-100',
                  )}
                >
                  <Image
                    src={resolveMediaUrl(image.url)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="36px"
                    unoptimized
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <AdminImageViewerModal
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        images={images}
        index={safeIndex}
        onIndexChange={setIndex}
        fallbackLabel={altFallback}
      />
    </div>
  );
}
