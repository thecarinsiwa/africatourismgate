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
    <div className={cn('space-y-2', className)}>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-lg border border-atg-border bg-atg-surface"
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
          sizes="(max-width: 1024px) 100vw, 40vw"
          unoptimized
          priority={safeIndex === 0}
        />

        {count > 1 ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 !px-0 bg-atg-elevated/90 shadow-sm"
              onClick={goPrev}
              aria-label={t('carouselPrev')}
            >
              ‹
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 !px-0 bg-atg-elevated/90 shadow-sm"
              onClick={goNext}
              aria-label={t('carouselNext')}
            >
              ›
            </Button>
            <p className="absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-medium tabular-nums text-white">
              {safeIndex + 1}/{count}
            </p>
          </>
        ) : null}
      </div>

      {current.caption?.trim() ? (
        <p className="truncate text-xs text-atg-muted">{current.caption}</p>
      ) : null}

      {count > 1 ? (
        <ul className="flex gap-1.5 overflow-x-auto pb-0.5" aria-label={t('carouselThumbs')}>
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
                    'relative h-12 w-12 overflow-hidden rounded-md border transition',
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
                    sizes="48px"
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
