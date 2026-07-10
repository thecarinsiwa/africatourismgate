'use client';

import { cn, SidebarPlaneIcon } from '@africatourismgate/ui';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getApiClient, resolveApiBaseUrl } from '../../lib/auth/api';
import { getSession } from '../../lib/auth/session';

type FlightThumbnailProps = {
  flightId: string;
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

export function FlightThumbnail({
  flightId,
  label,
  size = 'md',
  className,
}: FlightThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getApiClient().listFlightImages({
          flightId,
          page: 1,
          limit: 1,
        });
        if (cancelled) return;
        const first = result.data.sort((a, b) => a.sortOrder - b.sortOrder)[0];
        setImageUrl(first?.url ?? null);
        setImageFailed(false);
      } catch {
        if (!cancelled) {
          setImageUrl(null);
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
  }, [flightId]);

  const session = getSession();
  const imgSrc = imageUrl && !imageFailed ? resolveImageUrl(imageUrl) : null;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-lg ring-1 ring-atg-border/60',
        sizeClasses[size],
        !imgSrc && 'bg-gradient-to-br from-primary/25 to-atg-surface',
        className,
      )}
    >
      {loading ? (
        <span className="absolute inset-0 animate-pulse bg-atg-border/40" aria-hidden />
      ) : imgSrc ? (
        <Image
          src={imgSrc}
          alt={label}
          fill
          className="object-cover"
          sizes={size === 'sm' ? '56px' : '64px'}
          unoptimized
          onError={() => setImageFailed(true)}
          {...(session?.accessToken
            ? {
                loader: ({ src }) => src,
              }
            : {})}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-primary/70">
          <SidebarPlaneIcon className="h-5 w-5" />
        </span>
      )}
    </div>
  );
}
