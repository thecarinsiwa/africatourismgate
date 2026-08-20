'use client';

import { Button, Modal } from '@africatourismgate/ui';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';
import { resolveMediaUrl } from '../lib/resolve-media-url';

export type AdminImageViewerItem = {
  id: string;
  url: string;
  caption?: string | null;
};

type AdminImageViewerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: AdminImageViewerItem[];
  index: number;
  onIndexChange: (index: number) => void;
  fallbackLabel?: string;
};

export function AdminImageViewerModal({
  open,
  onOpenChange,
  images,
  index,
  onIndexChange,
  fallbackLabel,
}: AdminImageViewerModalProps) {
  const t = useTranslations('modules.common.imagesGallery');
  const count = images.length;
  const safeIndex = count === 0 ? 0 : ((index % count) + count) % count;
  const current = count > 0 ? images[safeIndex] : null;
  const alt = current?.caption?.trim() || fallbackLabel || t('title');

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    onIndexChange((safeIndex - 1 + count) % count);
  }, [count, onIndexChange, safeIndex]);

  const goNext = useCallback(() => {
    if (count <= 1) return;
    onIndexChange((safeIndex + 1) % count);
  }, [count, onIndexChange, safeIndex]);

  useEffect(() => {
    if (!open || count <= 1) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, count, goPrev, goNext]);

  return (
    <Modal
      open={open && current != null}
      onOpenChange={onOpenChange}
      title={t('viewerTitle')}
      showClose
      closeAriaLabel={t('viewerClose')}
      className="max-w-4xl p-4 sm:p-5"
      containerClassName="bg-black/40"
    >
      {current ? (
        <div className="space-y-3">
          <div className="relative flex min-h-[50vh] items-center justify-center overflow-hidden rounded-lg bg-atg-surface">
            <Image
              key={`viewer-${current.id}`}
              src={resolveMediaUrl(current.url)}
              alt={alt}
              width={1280}
              height={960}
              className="max-h-[70vh] w-auto max-w-full object-contain"
              unoptimized
              priority
            />

            {count > 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute left-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 !px-0 bg-atg-elevated/95 shadow-sm"
                  onClick={goPrev}
                  aria-label={t('viewerPrev')}
                >
                  ‹
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 !px-0 bg-atg-elevated/95 shadow-sm"
                  onClick={goNext}
                  aria-label={t('viewerNext')}
                >
                  ›
                </Button>
              </>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm text-atg-muted">
              {current.caption?.trim() || fallbackLabel || t('title')}
            </p>
            <p className="shrink-0 text-xs font-medium tabular-nums text-atg-muted">
              {safeIndex + 1}/{count}
            </p>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
