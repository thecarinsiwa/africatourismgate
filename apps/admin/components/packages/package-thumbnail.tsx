'use client';

import { cn } from '@africatourismgate/ui';
import Image from 'next/image';
import { useState } from 'react';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

type PackageThumbnailProps = {
  imageUrl?: string | null;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClasses = {
  sm: 'h-10 w-14',
  md: 'h-12 w-16',
} as const;

export function PackageThumbnail({
  imageUrl,
  label,
  size = 'md',
  className,
}: PackageThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl?.trim() ? resolveMediaUrl(imageUrl.trim()) : null;
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-lg border border-atg-border bg-atg-surface',
        sizeClasses[size],
        className,
      )}
      aria-hidden={!showImage}
    >
      {showImage && src ? (
        <Image
          src={src}
          alt={label}
          fill
          unoptimized
          className="object-cover"
          sizes={size === 'md' ? '64px' : '56px'}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0f2744] to-primary/70 text-[10px] font-semibold uppercase tracking-wide text-white/90">
          PKG
        </div>
      )}
    </div>
  );
}
