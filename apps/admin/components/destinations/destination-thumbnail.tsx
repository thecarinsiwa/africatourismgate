'use client';

import { cn } from '@africatourismgate/ui';
import Image from 'next/image';
import { CountryFlagPlaceholder } from '../flights/country-flag-placeholder';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

type DestinationThumbnailProps = {
  name: string;
  countryCode: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClasses = {
  sm: 'h-10 w-14',
  md: 'h-12 w-16',
};

const flagSizeClasses = {
  sm: 'absolute -bottom-1 -right-1 h-5 w-5 rounded-md text-sm',
  md: 'absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-md',
};

export function DestinationThumbnail({
  name,
  countryCode,
  imageUrl,
  size = 'md',
  className,
}: DestinationThumbnailProps) {
  const trimmedImage = imageUrl?.trim();
  const imgSrc = trimmedImage ? resolveMediaUrl(trimmedImage) : null;

  return (
    <div className={cn('relative shrink-0', sizeClasses[size], className)}>
      <div
        className={cn(
          'relative h-full w-full overflow-hidden rounded-lg ring-1 ring-atg-border/60',
          !imgSrc && 'bg-gradient-to-br from-[#0f2744] to-primary/70',
        )}
      >
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={name}
            fill
            className="object-cover"
            sizes={size === 'sm' ? '56px' : '64px'}
            unoptimized
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-xs font-bold uppercase text-white/90"
            aria-hidden
          >
            {name.trim().charAt(0) || '?'}
          </span>
        )}
      </div>
      <CountryFlagPlaceholder
        countryCode={countryCode}
        className={cn(flagSizeClasses[size], 'shadow-sm')}
      />
    </div>
  );
}
