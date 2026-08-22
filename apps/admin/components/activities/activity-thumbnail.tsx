'use client';

import type { ActivityImage } from '@africatourismgate/types';
import { cn, SidebarActivityIcon } from '@africatourismgate/ui';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

type ActivityThumbnailProps = {
  activityId: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Photo principale (première par ordre d'affichage). Si fournie, aucun chargement API. */
  imageUrl?: string | null;
  /** Force le rechargement lorsque les photos changent (mode autonome). */
  refreshKey?: number;
};

const sizeClasses = {
  sm: 'h-10 w-14',
  md: 'h-12 w-16',
  lg: 'h-24 w-32 sm:h-28 sm:w-36',
};

const sizeHints = {
  sm: '56px',
  md: '64px',
  lg: '(max-width: 640px) 128px, 144px',
};

export function pickMainActivityImageUrl(images: ActivityImage[]): string | null {
  if (images.length === 0) return null;
  const sorted = [...images].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.createdAt.localeCompare(right.createdAt),
  );
  return sorted[0]?.url ?? null;
}

export function ActivityThumbnail({
  activityId,
  label,
  size = 'md',
  className,
  imageUrl: controlledImageUrl,
  refreshKey = 0,
}: ActivityThumbnailProps) {
  const isControlled = controlledImageUrl !== undefined;
  const [fetchedImageUrl, setFetchedImageUrl] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [loading, setLoading] = useState(!isControlled);

  useEffect(() => {
    if (isControlled) {
      setLoading(false);
      setImageFailed(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await getApiClient().listActivityImages({
          activityId,
          page: 1,
          limit: 100,
        });
        if (cancelled) return;
        setFetchedImageUrl(pickMainActivityImageUrl(result.data));
        setImageFailed(false);
      } catch {
        if (!cancelled) {
          setFetchedImageUrl(null);
          setImageFailed(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [activityId, isControlled, refreshKey]);

  const rawUrl = isControlled ? controlledImageUrl : fetchedImageUrl;
  const imgSrc = rawUrl && !imageFailed ? resolveMediaUrl(rawUrl) : null;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-lg ring-1 ring-atg-border/60',
        sizeClasses[size],
        !imgSrc && 'bg-gradient-to-br from-primary/25 to-atg-surface',
        className,
      )}
      title={label}
    >
      {loading ? (
        <span className="absolute inset-0 animate-pulse bg-atg-border/40" aria-hidden />
      ) : imgSrc ? (
        <Image
          src={imgSrc}
          alt={label}
          fill
          className="object-cover"
          sizes={sizeHints[size]}
          unoptimized
          priority={size === 'lg'}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-primary/70" aria-hidden>
          <SidebarActivityIcon className={size === 'lg' ? 'h-8 w-8' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
        </span>
      )}
    </div>
  );
}
