'use client';

import { cn, SidebarShipIcon } from '@africatourismgate/ui';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';

type ShipThumbnailProps = {
  shipId?: string;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClasses = {
  sm: 'h-10 w-14',
  md: 'h-12 w-16',
};

function resolveImageUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = resolveApiBaseUrl();
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function ShipThumbnail({
  shipId,
  label,
  size = 'md',
  className,
}: ShipThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(shipId));
  const iconClassName = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  useEffect(() => {
    if (!shipId) {
      setLoading(false);
      setImageUrl(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const result = await getApiClient().listShipImages({
          shipId,
          page: 1,
          limit: 1,
        });
        if (cancelled) return;
        const first = result.data.sort((a, b) => a.sortOrder - b.sortOrder)[0];
        setImageUrl(first?.url ?? null);
      } catch {
        if (!cancelled) setImageUrl(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [shipId]);

  const session = getSession();
  const imgSrc = imageUrl ? resolveImageUrl(imageUrl) : null;

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-atg-border/60',
        sizeClasses[size],
        !imgSrc && 'bg-gradient-to-br from-primary/25 to-atg-surface',
        className,
      )}
      title={label}
      aria-hidden
    >
      {loading ? (
        <span className="absolute inset-0 animate-pulse bg-atg-border/40" />
      ) : imgSrc ? (
        <Image
          src={imgSrc}
          alt={label}
          fill
          className="object-cover"
          sizes={size === 'sm' ? '56px' : '64px'}
          unoptimized
          {...(session?.accessToken
            ? {
                loader: ({ src }) => src,
              }
            : {})}
        />
      ) : (
        <SidebarShipIcon className={cn(iconClassName, 'text-primary/70')} />
      )}
    </div>
  );
}
