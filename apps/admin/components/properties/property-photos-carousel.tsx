'use client';

import type { PropertyImage } from '@africatourismgate/types';
import { Button, cn } from '@africatourismgate/ui';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

type PropertyPhotosCarouselProps = {
  images: PropertyImage[];
  altFallback: string;
  className?: string;
};

export function PropertyPhotosCarousel({
  images,
  altFallback,
  className,
}: PropertyPhotosCarouselProps) {
  const t = useTranslations('modules.properties.view');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [images]);

  const count = images.length;
  const safeIndex = count === 0 ? 0 : ((index % count) + count) % count;
  const current = count > 0 ? images[safeIndex] : null;

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
        <Image
          key={current.id}
          src={resolveMediaUrl(current.url)}
          alt={current.caption?.trim() || altFallback}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 20rem"
          unoptimized
          priority={safeIndex === 0}
        />

        {count > 1 ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute left-1.5 top-1/2 z-10 h-7 w-7 -translate-y-1/2 !px-0 bg-atg-elevated/90 shadow-sm"
              onClick={goPrev}
              aria-label={t('carouselPrev')}
            >
              ‹
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute right-1.5 top-1/2 z-10 h-7 w-7 -translate-y-1/2 !px-0 bg-atg-elevated/90 shadow-sm"
              onClick={goNext}
              aria-label={t('carouselNext')}
            >
              ›
            </Button>
            <p className="absolute bottom-1.5 right-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white">
              {safeIndex + 1}/{count}
            </p>
          </>
        ) : null}
      </div>

      {current.caption?.trim() ? (
        <p className="truncate text-xs text-atg-muted">{current.caption}</p>
      ) : null}

      {count > 1 ? (
        <ul className="flex gap-1 overflow-x-auto pb-0.5" aria-label={t('carouselThumbs')}>
          {images.map((image, i) => {
            const active = i === safeIndex;
            return (
              <li key={image.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={t('carouselGoTo', { index: i + 1 })}
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
    </div>
  );
}
